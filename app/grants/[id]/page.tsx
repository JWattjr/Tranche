import proof from '@/deploy/proof.json';
import {GrantView} from '@/components/grant-view';
import type {Proof} from '@/lib/domain';
export default async function GrantPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <GrantView proof={proof as unknown as Proof} grantId={id}/>;}
