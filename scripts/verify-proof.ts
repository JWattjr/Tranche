import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readClient,readGrant,receiptState,nativeCredit} from '../lib/protocol';
import type {Grant,Proof} from '../lib/domain';
import type {TransactionHash} from 'genlayer-js/types';
const proof=JSON.parse(readFileSync('deploy/proof.json','utf8')) as Proof&{sourceSha256?:string;creditedTransfers?:Array<{hash:string;from:string;to:string;amount:string}>;flowGrantId?:string;flowRecord?:{status:string;refunded:string;held:string};verification?:Record<string,unknown>};
if(!proof.contract||!proof.grantId||!proof.outcomes)throw Error('Finalized demo proof is incomplete.');
const client=readClient();
async function rpc<T>(read:()=>Promise<T>):Promise<T>{
  for(let attempt=0;attempt<3;attempt++){
    try{return await read();}catch(error){
      if(attempt===2)throw error;
      console.warn('RPC read failed; retrying in '+(15*(attempt+1))+' seconds.');
      await new Promise(resolve=>setTimeout(resolve,15000*(attempt+1)));
    }
  }
  throw Error('RPC read retries exhausted.');
}
let verified=0;
for(const [name,hash] of Object.entries(proof.transactions)){
  const r=await rpc(()=>client.getTransaction({hash:hash as TransactionHash})) as unknown as Record<string,unknown>;
  const transfer=proof.creditedTransfers?.find(t=>t.hash===hash);
  if(transfer?!nativeCredit(r,transfer.from,transfer.to,transfer.amount):receiptState(r).phase!=='finalized-success')throw Error('Proof did not verify: '+name);
  verified++;console.log('VERIFIED',name,hash);
  // The verifier is read-only and consumes at most 15 RPC requests per minute.
  await new Promise(resolve=>setTimeout(resolve,4000));
}
const record=await rpc(()=>readGrant(proof.contract!,proof.grantId!));
const expected=['MET','NOT_MET','INSUFFICIENT_EVIDENCE'];
if(expected.some((v,i)=>record.milestones[i].judgments[0]?.verdict!==v||!record.milestones[i].judgments[0]?.finalized))throw Error('Live per-criterion verdicts do not match the retained demo.');
if(record.released!=='1000000000000000')throw Error('Fixed allocation release does not match proof.');
if(record.spec_hash!==proof.record?.spec_hash)throw Error('Frozen specification hash changed.');
if(record.held!==proof.record.held&&record.status!=='CLOSED')throw Error('Held escrow differs from the recorded agreement.');
const localHash=createHash('sha256').update(readFileSync('contracts/tranche.py')).digest('hex');
if(proof.sourceSha256!==localHash)throw Error('Local contract source differs from deployed proof.');
await new Promise(resolve=>setTimeout(resolve,4000));
const onChainCode=await rpc(()=>client.getContractCode(proof.contract!));
if(createHash('sha256').update(onChainCode).digest('hex')!==localHash)throw Error('Deployed contract source differs from the local contract.');
if(proof.flowGrantId){await new Promise(resolve=>setTimeout(resolve,4000));const flow=await rpc(()=>readGrant(proof.contract!,proof.flowGrantId!));if(flow.status!=='CLOSED'||flow.held!=='0'||flow.refunded!=='1000000000000000')throw Error('Live resubmission/refund flow proof no longer matches.');}
const browser=(proof as unknown as {browser?:{grantId:string;record:{spec_hash:string}}}).browser;
if(browser){await new Promise(resolve=>setTimeout(resolve,4000));const grant=await rpc(()=>readGrant(proof.contract!,browser.grantId));if(grant.spec_hash!==browser.record.spec_hash||grant.status!=='SPEC_ACCEPTED'||grant.funded!=='0')throw Error('Unfunded browser specification proof differs from live state.');}
const productionBrowser=(proof as unknown as {productionBrowser?:{grantId:string;record:Grant;completed:boolean}}).productionBrowser;
if(productionBrowser){
  await new Promise(resolve=>setTimeout(resolve,4000));
  const grant=await rpc(()=>readGrant(proof.contract!,productionBrowser.grantId));
  if(grant.spec_hash!==productionBrowser.record.spec_hash)throw Error('Production browser agreement hash changed.');
  if(productionBrowser.completed&&(grant.status!=='CLOSED'||grant.funded!=='1000000000000000'||grant.released!=='500000000000000'||grant.refunded!=='500000000000000'||grant.held!=='0'||grant.milestones[0].judgments[0]?.verdict!=='MET'||!grant.milestones[0].judgments[0]?.finalized||grant.milestones[1].attempt!==2||grant.milestones[1].history.length!==1||grant.milestones[1].judgments[0]?.verdict!=='INSUFFICIENT_EVIDENCE'||!grant.milestones[1].judgments[0]?.finalized))throw Error('Completed production browser settlement differs from the retained proof.');
}
console.log(JSON.stringify({verifiedTransactions:verified,outcomes:expected,specificationHash:record.spec_hash,sourceSha256:localHash,heldWei:record.held,releasedWei:record.released,simulated:true},null,2));
