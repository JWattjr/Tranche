import proof from '@/deploy/proof.json';
import {GrantView} from '@/components/grant-view';
import type {Proof} from '@/lib/domain';
export default function Home(){return <GrantView proof={proof as unknown as Proof}/>;}
