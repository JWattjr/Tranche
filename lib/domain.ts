export const artifactKinds=['github_release','github_tag','github_file','npm_version','archive_snapshot','studionet_contract'] as const;
export type ArtifactKind=typeof artifactKinds[number];
export const kindLabels:Record<ArtifactKind,string>={github_release:'GitHub release',github_tag:'GitHub tag',github_file:'GitHub file',npm_version:'npm version',archive_snapshot:'Archived web page',studionet_contract:'StudioNet contract'};
export type Criterion={kind:ArtifactKind;source:string;requirement:string};
export type Evidence={kind:ArtifactKind;url:string;sha?:string;tag?:string;path?:string;version?:string;capture?:string};
export type Judgment={verdict:'MET'|'NOT_MET'|'INSUFFICIENT_EVIDENCE';quote:string;reason:string;finalized:boolean;availability:string;timestamp:number|null;sha:string};
export type SpecCheck={accepted:boolean;reason:string;finalized:boolean};
export type MilestoneSpec={title:string;allocation:string;deadline:number;criteria:Criterion[]};
export type Specification={title:string;recipient:string;budget:string;milestones:MilestoneSpec[]};
export type Milestone=MilestoneSpec&{status:string;spec_checks:(SpecCheck|null)[];attempt:number;evidence:Evidence[];judgments:(Judgment|null)[];released:string;refunded:string;history:Array<{attempt:number;status:string;evidence:Evidence[];judgments:(Judgment|null)[]}>};
export type Grant={id:string;funder:string;spec:Specification;spec_hash:string;status:string;created_at:number;funded:string;released:string;held:string;refunded:string;contract_balance:string;milestones:Milestone[]};
export type Proof={network:string;chainId:number;simulated:boolean;contract?:`0x${string}`;grantId?:string;record?:Grant;recordedAt?:string;transactions:Record<string,`0x${string}`>;outcomes?:Record<string,{milestone:number;transaction:string;callback:string}>;sourceCommit?:string;website?:string;github?:string;submissionReady:boolean};
export const explorer='https://explorer-studio.genlayer.com';
export const shortAddress=(v:string)=>v.slice(0,6)+'…'+v.slice(-4);
export function parseGen(v:string):bigint{if(!/^\d+(\.\d{1,18})?$/.test(v.trim()))throw Error('Use a positive GEN amount with at most 18 decimal places.');const [whole,fraction='']=v.trim().split('.');return BigInt(whole)*10n**18n+BigInt(fraction.padEnd(18,'0'));}
export function formatGen(v:string|bigint){const wei=BigInt(v);const whole=wei/10n**18n;const fraction=(wei%10n**18n).toString().padStart(18,'0').replace(/0+$/,'');return whole.toString()+(fraction?'.'+fraction:'');}
export function specificationErrors(spec:Specification,time=Math.floor(Date.now()/1000)):string[]{
  const errors:string[]=[];
  if(!spec.title.trim()||spec.title.length>120)errors.push('Name the grant in 120 characters or fewer.');
  if(!/^0x[\da-fA-F]{40}$/.test(spec.recipient)||/^0x0{40}$/.test(spec.recipient))errors.push('Enter a nonzero recipient wallet address.');
  if(!/^\d{1,40}$/.test(spec.budget)||BigInt(spec.budget)<=0n)errors.push('Budget must be a positive GEN amount.');
  if(spec.milestones.length<1||spec.milestones.length>3)errors.push('Add one to three milestones.');
  let allocated=0n;
  spec.milestones.forEach((m,i)=>{if(!m.title.trim()||m.title.length>120)errors.push(`Name milestone ${i+1}.`);if(!/^\d{1,40}$/.test(m.allocation)||BigInt(m.allocation)<=0n)errors.push(`Give milestone ${i+1} a positive allocation.`);else allocated+=BigInt(m.allocation);if(!Number.isSafeInteger(m.deadline)||m.deadline<time+300||m.deadline>time+366*86400)errors.push(`Milestone ${i+1} needs a deadline between five minutes and one year from now.`);if(m.criteria.length<1||m.criteria.length>5)errors.push(`Milestone ${i+1} needs one to five criteria.`);m.criteria.forEach(c=>{if(!artifactKinds.includes(c.kind))errors.push('Choose an allowlisted artifact type.');if(c.requirement.length<8||c.requirement.length>1000)errors.push('Describe a concrete expected property in 8–1,000 characters.');if(sourceError(c))errors.push(sourceError(c)!);});});
  if(/^\d+$/.test(spec.budget)&&allocated!==BigInt(spec.budget))errors.push('Milestone allocations must sum exactly to the budget.');return [...new Set(errors)];
}
export function sourceError(c:Criterion):string|null{if(c.kind.startsWith('github_'))return /^[\w.-]+\/[\w.-]+$/.test(c.source)&&!c.source.includes('..')?null:'Name the GitHub source as owner/repository.';if(c.kind==='npm_version')return /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/.test(c.source)&&!c.source.includes('..')?null:'Name the npm package, including its scope if any.';if(c.kind==='studionet_contract')return /^0x[\da-fA-F]{40}$/.test(c.source)?null:'Enter the StudioNet contract address.';try{const u=new URL(c.source);return u.protocol==='https:'&&!u.username&&!u.hash?null:'Use the exact original public HTTPS URL.';}catch{return 'Use the exact original public HTTPS URL.';}}
export function evidenceFor(c:Criterion,fields:Record<string,string>):Evidence{
  const base:Evidence={kind:c.kind,url:''};
  if(c.kind==='github_release'||c.kind==='github_tag'){const tag=fields.tag??'';if(!/^[\w./-]{1,120}$/.test(tag)||tag.includes('..'))throw Error('Enter the exact release or tag name.');const sha=fields.sha??'';if(!/^[a-f0-9]{40}$/.test(sha))throw Error('Enter a lowercase 40-character commit SHA.');return {...base,tag,sha,url:`https://github.com/${c.source}/${c.kind==='github_release'?'releases/tag':'tree'}/${tag}`};}
  if(c.kind==='github_file'){const sha=fields.sha??'',path=fields.path??'';if(!/^[a-f0-9]{40}$/.test(sha))throw Error('Enter a lowercase 40-character commit SHA.');if(!/^[\w./ -]{1,400}$/.test(path)||path.includes('..')||path.startsWith('/'))throw Error('Enter a public repository file path.');return {...base,sha,path,url:`https://github.com/${c.source}/blob/${sha}/${path}`};}
  if(c.kind==='npm_version'){const version=fields.version??'';if(!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(version))throw Error('Enter an exact npm version.');return {...base,version,url:`https://registry.npmjs.org/${c.source}/${version}`};}
  if(c.kind==='archive_snapshot'){const capture=fields.capture??'';if(!/^\d{14}$/.test(capture))throw Error('Enter the 14-digit archive timestamp.');const year=+capture.slice(0,4),month=+capture.slice(4,6),day=+capture.slice(6,8),hour=+capture.slice(8,10),minute=+capture.slice(10,12),second=+capture.slice(12,14);const d=new Date(Date.UTC(year,month-1,day,hour,minute,second));if(d.getUTCFullYear()!==year||d.getUTCMonth()!==month-1||d.getUTCDate()!==day||hour>23||minute>59||second>59)throw Error('Archive timestamp is not a valid UTC date.');return {...base,capture,url:`https://web.archive.org/web/${capture}id_/${c.source}`};}
  return {...base,url:`${explorer}/address/${c.source}`};
}
export function fetchTargets(c:Criterion,e:Evidence):string[]{
  if(c.kind==='github_release')return [`https://api.github.com/repos/${c.source}/commits/${encodeURIComponent(e.tag!)}`,`https://api.github.com/repos/${c.source}/releases/tags/${encodeURIComponent(e.tag!)}`];
  if(c.kind==='github_tag')return [`https://api.github.com/repos/${c.source}/commits/${encodeURIComponent(e.tag!)}`];
  if(c.kind==='github_file')return [`https://raw.githubusercontent.com/${c.source}/${e.sha}/${e.path!.split('/').map(encodeURIComponent).join('/')}`];
  if(c.kind==='npm_version')return [e.url,`https://registry.npmjs.org/${c.source}`];
  if(c.kind==='archive_snapshot')return [`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(c.source)}&output=json&filter=timestamp:${e.capture}&filter=statuscode:200&matchType=exact&limit=5`,e.url];
  return ['https://studio.genlayer.com/api'];
}
