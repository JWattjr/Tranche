import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import type {Grant} from './domain';
export const readClient=()=>createClient({chain:studionet});
export function receiptState(r:Record<string,unknown>){
  const status=String(r.statusName??r.status_name??'PENDING');
  const consensus=r.consensus_data as {leader_receipt?:Array<{execution_result?:string;result?:{status?:string}}>}|null|undefined;
  const leader=consensus?.leader_receipt?.[0];
  const execution=String(r.txExecutionResultName??leader?.execution_result??'');
  const successful=['SUCCESS','FINISHED_WITH_RETURN'].includes(execution)&&leader?.result?.status!=='rollback';
  return {status,execution,successful,phase:status==='FINALIZED'?(successful?'finalized-success':'finalized-error'):status==='ACCEPTED'?'accepted':status==='SUBMITTED'?'submitted':'pending'};
}
export function nativeCredit(r:Record<string,unknown>,from:string,to:string,amount:string){return String(r.statusName??r.status_name)==='FINALIZED'&&r.value_credited===true&&r.consensus_data===null&&String(r.from_address??r.sender).toLowerCase()===from.toLowerCase()&&String(r.to_address??r.recipient).toLowerCase()===to.toLowerCase()&&String(r.value)===amount;}
export async function readGrant(address:`0x${string}`,id:string):Promise<Grant>{return JSON.parse(String(await readClient().readContract({address,functionName:'get_grant',args:[id],transactionHashVariant:TransactionHashVariant.LATEST_FINAL}))) as Grant;}
