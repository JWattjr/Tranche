import {readFileSync,writeFileSync} from 'node:fs';
import {readClient,readGrant,receiptState} from '../lib/protocol';
import type {TransactionHash} from 'genlayer-js/types';
const p=JSON.parse(readFileSync('deploy/proof.json','utf8'));
const client=readClient();
const encode=(v:unknown)=>JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x,2);
const captured={
  'browser-propose':'0x0c8b0c6412b22029fe6e40133a8c9961e00bf76207168c51f6735eaafa0c7888',
  'browser-spec':'0x603d06f9194be03ef89b1e5b56be81b88296c29d4bfc95017f86803747e89fab'
};
for(const [name,hash] of Object.entries(captured)){
  const receipt=await client.getTransaction({hash:hash as TransactionHash});
  if(receiptState(receipt as unknown as Record<string,unknown>).phase!=='finalized-success')throw Error(name+' has not finalized successfully');
  p.transactions[name]=hash;
  writeFileSync('deploy/receipts/'+name+'.json',encode(receipt));
  await new Promise(resolve=>setTimeout(resolve,5000));
  const children=await client.getTriggeredTransactionIds({hash:hash as TransactionHash});
  for(let i=0;i<children.length;i++){
    await new Promise(resolve=>setTimeout(resolve,5000));
    const child=await client.getTransaction({hash:children[i]});
    if(receiptState(child as unknown as Record<string,unknown>).phase!=='finalized-success')throw Error('Browser callback did not finalize');
    p.transactions[name+'-child-'+i]=children[i];
    writeFileSync('deploy/receipts/'+name+'-child-'+i+'.json',encode(child));
  }
}
await new Promise(resolve=>setTimeout(resolve,5000));
const grantId='grant-44cd64b1-58f8-479a';
const record=await readGrant(p.contract,grantId);
if(record.status!=='SPEC_ACCEPTED'||record.funded!=='0')throw Error('Browser grant did not finalize as accepted and unfunded');
p.browser={grantId,record,observed:['Chrome proposal signing','criterion check signing','accepted appeal state','reload resumes existing hashes','finalized success and fresh accepted specification'],remaining:['production wallet connection approval','browser funding','recipient claim signing','browser payout and refund'],productionConnection:'User rejected the request'};
writeFileSync('deploy/proof.json',encode(p));
writeFileSync('public/proof.json',encode(p));
console.log('BROWSER_SPEC_ACCEPTED',grantId);
