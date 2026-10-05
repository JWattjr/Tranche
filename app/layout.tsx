import type {Metadata} from 'next';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/libre-baskerville/400.css';
import './globals.css';
import proof from '@/deploy/proof.json';
import {SessionProvider} from '@/components/session';
import {Shell} from '@/components/shell';
export const metadata:Metadata={title:'Tranche — money follows shipped work',description:'Milestone grant escrow with independently verified public evidence on GenLayer StudioNet.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth"><body><a className="skip-link" href="#content">Skip to grant</a><SessionProvider contract={(process.env.NEXT_PUBLIC_TRANCHE_CONTRACT??proof.contract) as `0x${string}`|undefined}><Shell>{children}</Shell></SessionProvider></body></html>;}
