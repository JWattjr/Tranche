import {readGrant} from '@/lib/protocol';
import proof from '@/deploy/proof.json';
export const dynamic='force-dynamic';
const cache=new Map<string,{at:number;record:unknown}>();
export async function GET(request:Request){
  const id=new URL(request.url).searchParams.get('id')??proof.grantId;
  if(!id||!/^[a-z0-9-]{3,64}$/.test(id))return Response.json({error:'Enter a valid grant ID.'},{status:400});
  const address=process.env.NEXT_PUBLIC_TRANCHE_CONTRACT??proof.contract;
  if(!address)return Response.json({error:'The escrow contract is not deployed yet.'},{status:503});
  const saved=cache.get(id);
  if(saved&&Date.now()-saved.at<5000)return Response.json({record:saved.record,readAt:new Date(saved.at).toISOString(),source:'live-finalized'},{headers:{'Cache-Control':'no-store'}});
  try{const record=await readGrant(address as `0x${string}`,id);const at=Date.now();cache.set(id,{at,record});if(cache.size>100)cache.delete(cache.keys().next().value!);return Response.json({record,readAt:new Date(at).toISOString(),source:'live-finalized'},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'The finalized grant could not be read. It may still be processing; retry shortly.'},{status:502});}
}
