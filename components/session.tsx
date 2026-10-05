'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import type {CalldataEncodable} from 'genlayer-js/types';
import {explorer,shortAddress} from '@/lib/domain';
import {ArrowUpRight,Check,LoaderCircle,Wallet} from 'lucide-react';

type Provider={request:(args:{method:string;params?:unknown[]})=>Promise<unknown>;on?:(event:string,fn:(value:unknown)=>void)=>void;removeListener?:(event:string,fn:(value:unknown)=>void)=>void};
type Step={method:string;args:CalldataEncodable[];value?:string};
type Operation={label:string;grantId:string;steps:Step[];index:number;hash?:string;phase:string;pending:string[];visited:string[];error?:string};
type Session={account:string;connecting:boolean;connect:()=>Promise<void>;error:string;operation:Operation|null;busy:boolean;run:(label:string,id:string,steps:Step[])=>Promise<void>;resume:()=>Promise<void>;clear:()=>void};
const Context=createContext<Session|null>(null);
export const useSession=()=>{const context=useContext(Context);if(!context)throw Error('Missing wallet session');return context;};
const key='tranche:operation:v1';
const provider=()=> (window as unknown as {ethereum?:Provider}).ethereum;
const delay=(signal:AbortSignal)=>new Promise<void>((resolve,reject)=>{const timer=setTimeout(resolve,5000);signal.addEventListener('abort',()=>{clearTimeout(timer);reject(Error('Polling paused'));},{once:true});});
const problem=(e:unknown)=>e instanceof Error?e.message:typeof e==='object'&&e&&'message' in e?String(e.message):'The request could not complete. Please try again.';

export function SessionProvider({contract,children}:{contract?:`0x${string}`;children:ReactNode}){
  const [account,setAccount]=useState(''),[connecting,setConnecting]=useState(false),[error,setError]=useState(''),[operation,setOperation]=useState<Operation|null>(null),[busy,setBusy]=useState(false);
  const active=useRef<AbortController|null>(null);
  function persist(op:Operation){localStorage.setItem(key,JSON.stringify(op));setOperation({...op});}
  async function connect(){
    setConnecting(true);setError('');
    try{const p=provider();if(!p)throw Error('Install MetaMask with the GenLayer plugin to sign on StudioNet. You can inspect this grant without a wallet.');const client=createClient({chain:studionet});await client.connect('studionet');const accounts=await p.request({method:'eth_requestAccounts'});if(!Array.isArray(accounts)||typeof accounts[0]!=='string')throw Error('The wallet did not provide an account.');setAccount(accounts[0].toLowerCase());}catch(e){setError(problem(e));throw e;}finally{setConnecting(false);}
  }
  async function execute(op:Operation,canSign:boolean){
    await Promise.resolve();
    if(active.current&&!active.current.signal.aborted)return;
    const control=new AbortController();active.current=control;setBusy(true);setError('');
    try{
      if(!contract)throw Error('No deployed escrow contract is configured.');
      for(;op.index<op.steps.length;op.index++){
        if(control.signal.aborted)return;
        if(!op.hash){
          if(!canSign){op.phase='ready-for-signature';persist(op);return;}
          const p=provider();if(!p)throw Error('Reconnect MetaMask to sign the next step.');
          const accounts=await p.request({method:'eth_accounts'});const address=Array.isArray(accounts)?accounts[0]:null;
          if(typeof address!=='string')throw Error('Connect your wallet before signing.');
          const chain=await p.request({method:'eth_chainId'});if(BigInt(String(chain))!==61999n)throw Error('Switch your wallet to StudioNet (61999) before signing.');
          const signedProvider={request:async(req:{method:string;params?:unknown[]})=>{
            if(req.method==='eth_sendTransaction'){
              const tx=req.params?.[0] as Record<string,unknown>|undefined;
              if(!tx||tx.gasPrice===undefined||tx.gas===undefined)throw Error('The network did not return explicit gas fees. Retry when its fee read is available.');
            }
            return p.request(req);
          }};
          const client=createClient({chain:studionet,account:address as `0x${string}`,provider:signedProvider});
          const step=op.steps[op.index];op.phase='awaiting-signature';persist(op);
          op.hash=String(await client.writeContract({address:contract,functionName:step.method,args:step.args,value:BigInt(step.value??'0')}));
          op.phase='submitted';op.pending=[op.hash];op.visited=[];persist(op);
        }
        // Follow the parent, finalized callbacks and native-transfer descendants.
        while(op.pending.length){
          await delay(control.signal);if(control.signal.aborted)return;
          const hash=op.pending[0];
          const response=await fetch('/api/transaction?hash='+hash,{cache:'no-store',signal:control.signal});
          const receipt=await response.json();
          if(!response.ok){op.phase='pending';op.error=receipt.error;persist(op);continue;}
          op.error=undefined;op.phase=receipt.phase;persist(op);
          if(receipt.status==='FINALIZED'){
            if(!receipt.successful&&!receipt.nativeCredit){op.phase='finalized-error';op.error='The transaction finalized with an execution error. Open its receipt and correct the request.';persist(op);return;}
            op.pending.shift();op.visited.push(hash);
            for(const child of receipt.children as string[])if(!op.visited.includes(child)&&!op.pending.includes(child))op.pending.push(child);
            op.phase=op.pending.length?'pending':'finalized-success';persist(op);
          }
        }
        op.hash=undefined;op.phase='ready-for-signature';op.index++;persist(op);op.index--;
      }
      op.phase='complete';op.error=undefined;persist(op);window.dispatchEvent(new Event('tranche:updated'));
    }catch(e){if(!control.signal.aborted){op.error=problem(e);op.phase=op.hash?'pending':'ready-for-signature';persist(op);setError(problem(e));}}
    finally{if(active.current===control){active.current=null;setBusy(false);}}
  }
  async function run(label:string,id:string,steps:Step[]){if(active.current)return;const stored=localStorage.getItem(key);if(stored){const previous=JSON.parse(stored) as Operation;if(!['complete','finalized-error'].includes(previous.phase))throw Error('Resume or finish the existing transaction sequence first.');}const op:Operation={label,grantId:id,steps,index:0,phase:'ready-for-signature',pending:[],visited:[]};persist(op);await execute(op,true);}
  async function resume(){const value=localStorage.getItem(key);if(value)await execute(JSON.parse(value) as Operation,true);}
  function clear(){if(active.current)return;if(operation&&operation.phase!=='complete'&&operation.phase!=='finalized-error')return;localStorage.removeItem(key);setOperation(null);}
  useEffect(()=>{
    const p=provider();const update=(accounts:unknown)=>setAccount(Array.isArray(accounts)&&typeof accounts[0]==='string'?accounts[0].toLowerCase():'');
    void p?.request({method:'eth_accounts'}).then(update).catch(()=>{});p?.on?.('accountsChanged',update);
    const stored=localStorage.getItem(key);if(stored){try{const op=JSON.parse(stored) as Operation;if(op.phase==='complete'||op.phase==='finalized-error')void Promise.resolve().then(()=>setOperation(op));else void Promise.resolve().then(()=>execute(op,false));}catch{localStorage.removeItem(key);}}
    return()=>{p?.removeListener?.('accountsChanged',update);active.current?.abort();active.current=null;};
    // Mount resumes persisted reads; subsequent writes are explicit user actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  return <Context.Provider value={{account,connecting,connect,error,operation,busy,run,resume,clear}}>{children}</Context.Provider>;
}
export function WalletButton(){const {account,connecting,connect}=useSession();return <button className="button wallet" title={account||'Connect MetaMask on StudioNet'} onClick={()=>void connect().catch(()=>{})} disabled={connecting}><Wallet size={15}/>{connecting?'Connecting…':account?shortAddress(account):'Connect wallet'}</button>;}
export function OperationProgress(){const {operation:op,busy,resume,clear,error}=useSession();if(!op)return error?<p className="notice error" role="alert">{error}</p>:null;const complete=op.phase==='complete';return <section className="operation" aria-live="polite"><div className="operation-top">{complete?<Check size={18}/>:<LoaderCircle size={18} className={busy?'spin':''}/>}<strong>{op.label}</strong><span>{complete?'Complete':op.phase.replaceAll('-',' ')}</span></div><p>Step {Math.min(op.index+1,op.steps.length)} of {op.steps.length} · {op.steps[Math.min(op.index,op.steps.length-1)]?.method.replaceAll('_',' ')}</p>{op.hash&&<a href={`${explorer}/transactions/${op.hash}`} target="_blank" rel="noreferrer">Inspect transaction <ArrowUpRight size={13}/></a>}{op.phase==='accepted'&&<p>The native appeal window is open. Settlement waits for stored finality and its callbacks.</p>}{op.error&&<p role="alert">{op.error}</p>}{!busy&&!complete&&op.phase!=='finalized-error'&&<button className="button" onClick={()=>void resume()}>Resume {op.hash?'tracking':'and sign next step'}</button>}{complete||op.phase==='finalized-error'?<button className="text-button" onClick={clear}>Dismiss</button>:<p className="muted small">You can reload this page. Submitted hashes are retained; this sequence will resume tracking automatically.</p>}</section>;}
