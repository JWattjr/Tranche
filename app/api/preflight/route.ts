import {artifactKinds,evidenceFor,fetchTargets,sourceError,type Criterion,type Evidence} from '@/lib/domain';
export const dynamic='force-dynamic';
async function boundedFetch(url:string,options?:RequestInit){
  const response=await fetch(url,{...options,redirect:'error',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'Tranche-evidence-preview','Accept':'application/json,text/plain,text/html',...options?.headers}});
  if(!response.ok)throw Error('Public source returned HTTP '+response.status+'. Validators will verify availability themselves.');
  const reader=response.body?.getReader();if(!reader)throw Error('The public source returned an empty response.');
  const decoder=new TextDecoder();let text='';
  while(text.length<40000){const {done,value}=await reader.read();if(done)break;text+=decoder.decode(value,{stream:true});}
  await reader.cancel();return text.slice(0,40000);
}
export async function POST(request:Request){
  try{
    if(Number(request.headers.get('content-length')??'0')>10000)return Response.json({error:'Evidence reference is too large.'},{status:400});
    const {criterion,evidence}=await request.json() as {criterion:Criterion;evidence:Evidence};
    if(!criterion||!artifactKinds.includes(criterion.kind)||typeof criterion.source!=='string'||criterion.source.length>500||sourceError(criterion))throw Error('Choose an allowlisted public artifact and a valid source.');
    const derived=evidenceFor(criterion,evidence as unknown as Record<string,string>);
    if(evidence.url!==derived.url||evidence.kind!==derived.kind)throw Error('Evidence must match the frozen artifact source.');
    const targets=fetchTargets(criterion,derived);
    let body='';
    if(criterion.kind==='github_release'){
      const commit=JSON.parse(await boundedFetch(targets[0]));
      const release=JSON.parse(await boundedFetch(targets[1]));
      body=JSON.stringify({resolved_sha:commit.sha,pinned_sha:derived.sha,sha_matches:commit.sha===derived.sha,tag_name:release.tag_name,created_at:release.created_at,release_notes:release.body,html_url:release.html_url},null,2);
    }
    else if(criterion.kind==='studionet_contract')body=await boundedFetch(targets[0],{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'gen_getContractSchema',params:[criterion.source]})});
    else for(const target of targets){body+=(body?'\n\n':'')+target+'\n'+await boundedFetch(target);if(body.length>=40000)break;}
    return Response.json({body:body.slice(0,40000),targets,authoritative:false},{headers:{'Cache-Control':'no-store'}});
  }catch(e){return Response.json({error:e instanceof Error?e.message:'The public artifact could not be fetched.',authoritative:false},{status:400});}
}
