import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import type {GenLayerClient,TransactionHash} from 'genlayer-js/types';
import {TransactionStatus,TransactionHashVariant} from 'genlayer-js/types';
import {studionet} from 'genlayer-js/chains';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const path='deploy/proof.json';
const stringify=(v:unknown)=>JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x,2);
function success(v:unknown){const r=v as Record<string,unknown>;const c=r.consensus_data as {leader_receipt?:Array<{execution_result?:string;result?:{status?:string}}>}|undefined;const leader=c?.leader_receipt?.[0];return (r.statusName??r.status_name)==='FINALIZED'&&['SUCCESS','FINISHED_WITH_RETURN'].includes(String(r.txExecutionResultName??leader?.execution_result))&&leader?.result?.status!=='rollback';}

export default async function main(client:GenLayerClient<typeof studionet>){
  mkdirSync('deploy/receipts',{recursive:true});mkdirSync('public',{recursive:true});
  const p=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{network:'StudioNet',chainId:61999,simulated:true,runner:'py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6',transactions:{},probes:{},submissionReady:false};
  const save=()=>{writeFileSync(path,stringify(p));writeFileSync('public/proof.json',stringify(p));};
  p.sourceSha256=createHash('sha256').update(readFileSync('contracts/tranche.py')).digest('hex');
  async function final(name:string,hash:TransactionHash){
    const receipt=await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:180,interval:5000});
    writeFileSync('deploy/receipts/'+name+'.json',stringify(receipt));
    if(!success(receipt))throw Error('Finalized execution failed: '+name);
    console.log(name,hash,'FINALIZED_SUCCESS');return receipt;
  }
  async function deploy(name:string,file:string){
    if(!p.transactions[name]){p.transactions[name]=await client.deployContract({code:readFileSync(file,'utf8'),args:[]});save();}
    const r=await final(name,p.transactions[name]);p[name==='probe-deploy'?'probeContract':'contract']=r.recipient;save();
  }
  async function write(name:string,address:`0x${string}`,method:string,args:Parameters<typeof client.writeContract>[0]['args'],value=0n){
    if(!p.transactions[name]){
      if(name.startsWith('demo-')||name.startsWith('flow-')){
        const account=client.account;
        if(!account?.signTransaction)throw Error('An unlocked local CLI signer is required.');
        const prepared=spawnSync('.release-venv/Scripts/python.exe',['scripts/prepare-release.py'],{input:stringify({sender:account.address,address,method,args,value:value.toString()}),encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});
        if(prepared.status!==0)throw Error('Python release preparation failed: '+prepared.stderr);
        const tx=JSON.parse(prepared.stdout);
        const unsigned={to:tx.to,data:tx.data,value:BigInt(tx.value),gas:BigInt(tx.gas),nonce:Number(BigInt(tx.nonce)),chainId:61999};
        const signed=tx.maxFeePerGas!==undefined?await account.signTransaction({...unsigned,type:'eip1559',maxFeePerGas:BigInt(tx.maxFeePerGas),maxPriorityFeePerGas:BigInt(tx.maxPriorityFeePerGas)}):await account.signTransaction({...unsigned,type:'legacy',gasPrice:BigInt(tx.gasPrice)});
        p.transactions[name]=await client.sendRawTransaction({serializedTransaction:signed});
      }else{p.transactions[name]=await client.writeContract({address,functionName:method,args,value});}
      save();
    }
    await final(name,p.transactions[name]);
    async function descendants(parentName:string,parent:TransactionHash,depth=0){
      if(depth>4)throw Error('Unexpected transaction dependency depth');
      const children=await client.getTriggeredTransactionIds({hash:parent});
      for(let i=0;i<children.length;i++){
        const childName=parentName+'-child-'+i;p.transactions[childName]=children[i];save();
        const r=await client.waitForTransactionReceipt({hash:children[i],status:TransactionStatus.FINALIZED,retries:180,interval:5000});
        writeFileSync('deploy/receipts/'+childName+'.json',stringify(r));
        const raw=r as unknown as Record<string,unknown>;
        const credit=String(raw.statusName??raw.status_name)==='FINALIZED'&&raw.value_credited===true&&raw.consensus_data===null&&String(raw.from_address??raw.sender).toLowerCase()===String(p.contract).toLowerCase()&&String(raw.value)==='1000000000000000';
        if(!success(r)&&!credit)throw Error('Callback or transfer failed: '+childName);
        if(credit){p.creditedTransfers??=[];if(!p.creditedTransfers.some((t:{hash:string})=>t.hash===children[i]))p.creditedTransfers.push({hash:children[i],from:String(raw.from_address??raw.sender),to:String(raw.to_address??raw.recipient),amount:String(raw.value)});save();}
        await descendants(childName,children[i],depth+1);
      }
    }
    await descendants(name,p.transactions[name]);
  }
  const step=process.env.TRANCHE_STEP??'probe-deploy';
  if(step==='probe-deploy')await deploy('probe-deploy','contracts/access_probe.py');
  if(step==='probe'){
    const urls=['https://api.github.com/repos/prettier/prettier/releases/tags/3.6.2','https://raw.githubusercontent.com/prettier/prettier/main/README.md','https://registry.npmjs.org/is-number/7.0.0','https://web.archive.org/cdx/search/cdx?url=example.com&output=json&limit=1&filter=statuscode:200'];
    for(let i=0;i<urls.length;i++){const name='access-'+i;await write(name,p.probeContract,'probe',[urls[i]]);p.probes[urls[i]]=JSON.parse(String(await client.readContract({address:p.probeContract,functionName:'result',args:[urls[i]],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})));save();console.log('ACCESS',urls[i],p.probes[urls[i]]);}
  }
  if(step==='deploy')await deploy('deploy','contracts/tranche.py');
  if(step==='seed'){
    const artifact=JSON.parse(readFileSync('deploy/demo-evidence.json','utf8'));
    p.grantId??='prettier-release-grant';
    p.spec??={title:'Public release verification',recipient:client.account?.address.toLowerCase(),budget:'3000000000000000',milestones:[
      {title:'Ship the formatting fix',allocation:'1000000000000000',deadline:Math.floor(Date.now()/1000)+86400,criteria:[{kind:'github_release',source:'prettier/prettier',requirement:'The prettier/prettier 3.6.2 release notes announce a fix adding a missing blank line around a code block.'}]},
      {title:'Ship native PDF export',allocation:'1000000000000000',deadline:Math.floor(Date.now()/1000)+86400,criteria:[{kind:'github_release',source:'prettier/prettier',requirement:'The prettier/prettier 3.6.2 release notes announce a new native PDF export feature.'}]},
      {title:'Publish the next release',allocation:'1000000000000000',deadline:Math.floor(Date.now()/1000)+86400,criteria:[{kind:'github_release',source:'prettier/prettier',requirement:'The prettier/prettier release 0.0.0-tranche-missing-release exists and its release notes announce a formatting fix.'}]}
    ]};save();
    await write('demo-propose',p.contract,'propose',[p.grantId,JSON.stringify(p.spec)]);
    for(let i=0;i<3;i++)await write('demo-spec-'+i,p.contract,'check_spec',[p.grantId,i,0]);
    const accepted=JSON.parse(String(await client.readContract({address:p.contract,functionName:'get_grant',args:[p.grantId],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})));
    if(!['SPEC_ACCEPTED','OPEN'].includes(accepted.status))throw Error('Specification not accepted; no deposit will be submitted.');
    await write('demo-fund',p.contract,'fund',[p.grantId],BigInt(p.spec.budget));
    p.record=JSON.parse(String(await client.readContract({address:p.contract,functionName:'get_grant',args:[p.grantId],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})));save();
    for(let i=0;i<3;i++){
      const missing=i===2;const tag=missing?'0.0.0-tranche-missing-release':'3.6.2';
      const ref={kind:'github_release',url:'https://github.com/prettier/prettier/releases/tag/'+tag,tag,sha:missing?'0'.repeat(40):artifact.sha};
      await write('demo-claim-'+i,p.contract,'claim',[p.grantId,i,JSON.stringify([ref])]);
      await write('demo-judge-'+i,p.contract,'adjudicate',[p.grantId,i,0]);
      p.record=JSON.parse(String(await client.readContract({address:p.contract,functionName:'get_grant',args:[p.grantId],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})));save();
      console.log('DEMO_OUTCOME',i,p.record.milestones[i].status);
    }
    const expected=['MET','NOT_MET','INSUFFICIENT_EVIDENCE'];
    if(expected.some((v,i)=>p.record.milestones[i].status!==v))throw Error('Unexpected live demo verdict. Inspect actual evidence, never override it.');
    p.outcomes=Object.fromEntries(expected.map((v,i)=>[v,{milestone:i,transaction:p.transactions['demo-judge-'+i],callback:p.transactions['demo-judge-'+i+'-child-0']}])) ;
    p.recordedAt=new Date().toISOString();save();
  }
  if(step==='flow-setup'){
    p.flowGrantId??='expiry-and-resubmission';
    p.flowSpec??={title:'Expiry and resubmission proof',recipient:client.account?.address.toLowerCase(),budget:'1000000000000000',milestones:[{title:'Missing release retry',allocation:'1000000000000000',deadline:Math.floor(Date.now()/1000)+900,criteria:[{kind:'github_release',source:'prettier/prettier',requirement:'The prettier/prettier release 0.0.0-tranche-missing-release exists and its release notes announce a formatting fix.'}]}]};save();
    await write('flow-propose',p.contract,'propose',[p.flowGrantId,JSON.stringify(p.flowSpec)]);
    await write('flow-spec',p.contract,'check_spec',[p.flowGrantId,0,0]);
    const specRecord=JSON.parse(String(await client.readContract({address:p.contract,functionName:'get_grant',args:[p.flowGrantId],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})));
    if(!['SPEC_ACCEPTED','OPEN'].includes(specRecord.status))throw Error('Flow specification not accepted.');
    await write('flow-fund',p.contract,'fund',[p.flowGrantId],1000000000000000n);
    const ref={kind:'github_release',url:'https://github.com/prettier/prettier/releases/tag/0.0.0-tranche-missing-release',tag:'0.0.0-tranche-missing-release',sha:'0'.repeat(40)};
    for(let attempt=1;attempt<=2;attempt++){
      await write('flow-claim-'+attempt,p.contract,'claim',[p.flowGrantId,0,JSON.stringify([ref])]);
      await write('flow-judge-'+attempt,p.contract,'adjudicate',[p.flowGrantId,0,0]);
    }
    p.flowRecord=JSON.parse(String(await client.readContract({address:p.contract,functionName:'get_grant',args:[p.flowGrantId],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})));save();
    if(p.flowRecord.milestones[0].attempt!==2||p.flowRecord.milestones[0].history.length!==1)throw Error('Live resubmission history mismatch');
  }
  if(step==='flow-refund'){
    if(Math.floor(Date.now()/1000)<=p.flowSpec.milestones[0].deadline)throw Error('Refund deadline not reached yet: '+p.flowSpec.milestones[0].deadline);
    await write('flow-refund',p.contract,'refund',[p.flowGrantId]);
    p.flowRecord=JSON.parse(String(await client.readContract({address:p.contract,functionName:'get_grant',args:[p.flowGrantId],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})));save();
    if(p.flowRecord.status!=='CLOSED'||p.flowRecord.refunded!=='1000000000000000'||p.flowRecord.held!=='0')throw Error('Live refund accounting mismatch');
  }
  if(step==='read'){
    p.record=JSON.parse(String(await client.readContract({address:p.contract,functionName:'get_grant',args:[p.grantId],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})));save();
  }
  if(step==='collect'){
    for(let i=0;i<3;i++)await write('demo-judge-'+i,p.contract,'adjudicate',[p.grantId,i,0]);
    save();
  }
}
