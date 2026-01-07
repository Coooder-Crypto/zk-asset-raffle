import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Eye, 
  CheckCircle2, 
  Gift, 
  ArrowRight,
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      {/* Hero Section */}
      <section className="relative rounded-3xl border border-[#e7e2d9] bg-[#f8f6f2] text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-0 rounded-3xl bg-[linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-60" />
        <div className="relative grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 p-8 md:p-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-600">
              zkAssetRaffle / protocol
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight" style={{ fontFamily: "'Newsreader', ui-serif, Georgia, serif" }}>
                Verifiable raffle pages for real‑world assets, written on‑chain like a document.
              </h1>
              <p className="text-base md:text-lg text-slate-600 max-w-xl">
                Generate encrypted QR tickets, let users claim on-chain, then reveal proofs with zero‑knowledge. 
                Simple flow, audit‑friendly data.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="h-11 px-6 bg-slate-900 text-white hover:bg-slate-800" asChild>
                <Link href="/create"><Gift className="h-4 w-4 mr-2" /> Create Raffle</Link>
              </Button>
              <Button variant="outline" className="h-11 px-6 border-slate-300 text-slate-900 hover:bg-white" asChild>
                <Link href="/claim"><Users className="h-4 w-4 mr-2" /> Join Raffle</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1">Encrypted QR payloads</span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1">Merkle commitments</span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-1">ZK reveal proofs</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="font-mono">raffle-page.md</span>
                <span className="rounded-full border border-slate-200 px-2 py-1">Draft</span>
              </div>
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Overview</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900" style={{ fontFamily: "'Newsreader', ui-serif, Georgia, serif" }}>
                    Raffle: City Coffee Drop
                  </div>
                  <div className="mt-1 text-slate-600">1,200 items · 3 prize tiers · Sepolia</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Encrypted key</span>
                    <span className="font-mono">•••• •••• ••••</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-slate-700">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    Commitments ready to publish
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    "Upload QR batch",
                    "Claim tickets on-chain",
                    "Reveal + verify winners"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Last update</span>
                  <span>2 min ago</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block">
              <Image src="/lottery-illustration.svg" alt="Raffle illustration" width={160} height={160} className="opacity-80" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[{icon:Shield, title:'Provable Fairness', desc:'Winning info generated confidentially; merkle commitment ensures integrity.'},
            {icon:Eye, title:'Zero‑Knowledge Privacy', desc:'ZK protects confidentiality while enabling full verification.'},
            {icon:CheckCircle2, title:'Full Verifiability', desc:'Anyone can verify results on‑chain with privacy preserved.'}].map((f, i) => (
            <Card key={i} className="p-6 border border-slate-200 bg-white/90 text-slate-900 shadow-none">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 mb-3">
                <f.icon className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "'Newsreader', ui-serif, Georgia, serif" }}>{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 md:p-8 text-slate-900">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Workflow</div>
              <h2 className="text-2xl md:text-3xl font-semibold mt-2" style={{ fontFamily: "'Newsreader', ui-serif, Georgia, serif" }}>
                A three‑step flow your users already understand.
              </h2>
            </div>
            <Button variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-50" asChild>
              <Link href="/create">See it live <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {n:1, title:'Generate commitment', desc:'Define prizes and issue encrypted QR tickets with salts.'},
              {n:2, title:'On‑chain claim', desc:'Participants scan and register tickets directly on chain.'},
              {n:3, title:'Reveal + settle', desc:'Publish key, verify merkle proofs, redeem prizes.'},
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Step {s.n}</div>
                <h3 className="font-semibold mt-2" style={{ fontFamily: "'Newsreader', ui-serif, Georgia, serif" }}>{s.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
