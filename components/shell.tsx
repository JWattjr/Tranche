'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ArrowUpRight,Plus,Layers2} from 'lucide-react';
import {WalletButton,OperationProgress,useSession} from './session';
export function Shell({children}:{children:React.ReactNode}){
  const path=usePathname(),{operation}=useSession();
  return <><header className="masthead"><div className="masthead-inner"><Link href="/" className="wordmark" aria-label="Tranche home"><Layers2 size={27} strokeWidth={1.6}/>tranche<span className="brand-dot">.</span></Link><nav aria-label="Main navigation"><Link href="/" aria-current={path==='/'?'page':undefined}>Grant ledger</Link><Link href="/proof" aria-current={path==='/proof'?'page':undefined}>Execution proof</Link></nav><div className="header-actions"><WalletButton/><Link href="/create" className="button primary"><Plus size={16}/>Create grant</Link></div></div></header><main className="workspace"><OperationProgress/>{operation&&operation.phase==='complete'&&operation.grantId&&<Link className="operation-link" href={'/grants/'+operation.grantId}>Open your grant <ArrowUpRight size={14}/></Link>}{children}</main><footer className="footer"><span>tranche. <span className="muted">Grant money that follows shipped work.</span></span><div><span>StudioNet · Simulated GEN</span><a href="https://github.com/JWattjr/Tranche" target="_blank" rel="noreferrer">Source <ArrowUpRight size={13}/></a></div></footer></>;
}
