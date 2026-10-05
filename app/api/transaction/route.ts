import {readClient,receiptState,nativeCredit} from '@/lib/protocol';
import type {TransactionHash} from 'genlayer-js/types';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const hash=new URL(request.url).searchParams.get('hash');
  if(!hash||!/^0x[\da-fA-F]{64}$/.test(hash))return Response.json({error:'Invalid transaction hash.'},{status:400});
  try{const client=readClient();const r=await client.getTransaction({hash:hash as TransactionHash});const state=receiptState(r as unknown as Record<string,unknown>);return Response.json({...state,hash,rawStatus:r.statusName,nativeCredit:nativeCredit(r as unknown as Record<string,unknown>,String((r as unknown as Record<string,unknown>).from_address),String((r as unknown as Record<string,unknown>).to_address),String((r as unknown as Record<string,unknown>).value)),children:state.status==='FINALIZED'?await client.getTriggeredTransactionIds({hash:hash as TransactionHash}):[],readAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'The network has not returned this transaction yet. Polling will resume.'},{status:502});}
}
