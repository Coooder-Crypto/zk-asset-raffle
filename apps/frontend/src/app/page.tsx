import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Eye, 
  CheckCircle2, 
  Gift, 
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-sm">
              zkAssetRaffle Protocol
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">Real-World Assets</span> on Blockchain for <span className="gradient-text">Verifiable Fair Raffles</span>
            </h1>
            <p className="text-muted-foreground">
              A decentralized, fair, and verifiable raffle protocol for Real-World Assets (RWA). Merchants run transparent raffles with encrypted QR codes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="gradient" className="h-11 px-6" asChild>
                <Link href="/create"><Gift className="h-4 w-4 mr-2" /> Create Raffle</Link>
              </Button>
              <Button variant="outline" className="h-11 px-6" asChild>
                <Link href="/claim"><Users className="h-4 w-4 mr-2" /> Join Raffle</Link>
              </Button>
            </div>
          </div>
          <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto">
            <Image src="/lottery-illustration.svg" alt="Raffle Illustration" fill className="object-contain" />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[{icon:Shield, title:'Provable Fairness', desc:'Winning info generated confidentially; merkle commitment ensures integrity.'},
            {icon:Eye, title:'Zero‑Knowledge Privacy', desc:'ZK protects confidentiality while enabling full verification.'},
            {icon:CheckCircle2, title:'Full Verifiability', desc:'Anyone can verify results on‑chain with privacy preserved.'}].map((f, i) => (
            <Card key={i} className="p-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {n:1, title:'Generate Commitment', desc:'Set activity; encrypted QR codes + salts are generated.'},
            {n:2, title:'On‑Chain Claim', desc:'Users scan QR codes and claim tickets on chain.'},
            {n:3, title:'Reveal and Settle', desc:'Reveal key; anyone verifies and redeem prizes.'},
          ].map((s) => (
            <Card key={s.n} className="p-6">
              <div className="w-8 h-8 gradient-bg text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">{s.n}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
