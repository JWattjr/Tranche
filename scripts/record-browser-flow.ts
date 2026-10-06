import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import type {TransactionHash} from 'genlayer-js/types';
import {abi} from 'genlayer-js';
import {readClient,readGrant,receiptState,nativeCredit} from '../lib/protocol';
import type {Grant,Proof} from '../lib/domain';

// Records public hashes observed in the browser; it never signs a transaction.
const [grantId,...arguments_]=process.argv.slice(2);
if(!grantId||!/^grant-[\da-f-]+$/.test(grantId))throw Error('Supply the browser grant ID and name=hash receipt arguments.');
type Transfer={hash:string;from:string;to:string;amount:string};
type BrowserFlow={grantId:string;record:Grant;recordedAt:string;completed:boolean;observed?:string[]};
const proof=JSON.parse(readFileSync('deploy/proof.json','utf8')) as Proof&{creditedTransfers?:Transfer[];productionBrowser?:BrowserFlow};
if(!proof.contract)throw Error('The deployed contract is missing.');
const client=readClient();
const delay=()=>new Promise(resolve=>setTimeout(resolve,4000));
const encode=(value:unknown)=>JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v,2)+'\n';
const record=await readGrant(proof.contract,grantId);
if(proof.productionBrowser&&proof.productionBrowser.grantId!==grantId)throw Error('Retain the existing browser flow before starting another capture.');
if(proof.productionBrowser&&proof.productionBrowser.record.spec_hash!==record.spec_hash)throw Error('The frozen browser specification changed.');
mkdirSync('deploy/receipts',{recursive:true});
async function capture(name:string,hash:TransactionHash,depth=0):Promise<void>{
  if(depth>4)throw Error('Unexpected callback depth.');
  await delay();
  const receipt=await client.getTransaction({hash});
  const raw=receipt as unknown as Record<string,unknown>;
  if(depth===0){
    const calldata=(raw.data as {calldata?:string|{base64:string}})?.calldata;
    const encoded=typeof calldata==='string'?calldata:calldata?.base64;
    if(!encoded)throw Error('The browser receipt has no call data.');
    const decoded=abi.calldata.decode(Buffer.from(encoded,'base64'));
    const method=name.includes('-spec-')?'check_spec':name.includes('-judge-')?'adjudicate':name.includes('-claim-')||name.includes('-resubmit-')?'claim':name.slice('production-browser-'.length);
    if(!(decoded instanceof Map))throw Error('The receipt call data is not a method call.');
    const args=decoded.get('args');
    if(decoded.get('method')!==method||!Array.isArray(args)||args[0]!==grantId||String(raw.from_address??raw.sender).toLowerCase()!==record.funder.toLowerCase()||String(raw.to_address??raw.recipient).toLowerCase()!==proof.contract!.toLowerCase())throw Error('The receipt does not belong to the named browser operation.');
    const index=/-([01])$/.exec(name);
    if(index&&String(args[1])!==index[1])throw Error('The receipt names a different milestone.');
  }
  const amount=record.milestones[0]?.allocation;
  const to=name.startsWith('production-browser-refund')?record.funder:record.spec.recipient;
  const credit=!!amount&&nativeCredit(raw,proof.contract!,to,amount);
  if(receiptState(raw).phase!=='finalized-success'&&!credit)throw Error('Receipt has not finalized successfully: '+name);
  proof.transactions[name]=hash;
  writeFileSync('deploy/receipts/'+name+'.json',encode(receipt));
  if(credit){proof.creditedTransfers??=[];if(!proof.creditedTransfers.some(t=>t.hash===hash))proof.creditedTransfers.push({hash,from:proof.contract!,to,amount});}
  await delay();
  const children=await client.getTriggeredTransactionIds({hash});
  for(let i=0;i<children.length;i++)await capture(name+'-child-'+i,children[i],depth+1);
  console.log('CAPTURED',name,hash);
}
for(const argument of arguments_.filter(a=>a!=='--complete')){
  const match=/^(production-browser-[a-z0-9-]+)=(0x[\da-fA-F]{64})$/.exec(argument);
  if(!match)throw Error('Use production-browser-name=0xhash receipt arguments.');
  if(proof.transactions[match[1]]&&proof.transactions[match[1]]!==match[2])throw Error('A retained transaction cannot be replaced.');
  await capture(match[1],match[2] as TransactionHash);
}
const complete=arguments_.includes('--complete');
if(complete){
  const required=['propose','spec-0','spec-1','fund','claim-0','judge-0','claim-1','judge-1','resubmit-1','judge-resubmit-1','refund'];
  if(required.some(name=>!proof.transactions['production-browser-'+name]))throw Error('A browser operation is missing from the retained receipts.');
  const [paid,held]=record.milestones;
  if(record.status!=='CLOSED'||record.funded!=='1000000000000000'||record.released!=='500000000000000'||record.refunded!=='500000000000000'||record.held!=='0'||paid?.judgments[0]?.verdict!=='MET'||!paid.judgments[0].finalized||held?.attempt!==2||held.history.length!==1||held.judgments[0]?.verdict!=='INSUFFICIENT_EVIDENCE'||!held.judgments[0].finalized)throw Error('The live browser settlement flow does not match the observed test.');
  for(const prefix of ['production-browser-judge-0','production-browser-refund']){
    const hashes=Object.entries(proof.transactions).filter(([name])=>name.startsWith(prefix+'-child-')).map(([,hash])=>hash);
    if(!proof.creditedTransfers?.some(t=>hashes.includes(t.hash as TransactionHash)))throw Error('A browser settlement native credit is missing: '+prefix);
  }
}
proof.productionBrowser={...proof.productionBrowser,grantId,record,recordedAt:new Date().toISOString(),completed:complete};
// A receipt collector alone does not attest to browser UI verification.
proof.submissionReady=false;
writeFileSync('deploy/proof.json',encode(proof));writeFileSync('public/proof.json',encode(proof));
console.log('BROWSER_FLOW_RECORDED',grantId,record.status,complete);
