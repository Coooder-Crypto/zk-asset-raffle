import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">zkAssetRaffle</h3>
            <p className="text-sm text-muted-foreground">
              Fair, verifiable raffles for real‑world assets using zero‑knowledge proofs.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/create">Create Raffle</Link></li>
              <li><Link className="hover:text-foreground" href="/claim">Claim Ticket</Link></li>
              <li><Link className="hover:text-foreground" href="/admin">Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a className="hover:text-foreground" href="#">Docs</a></li>
              <li><a className="hover:text-foreground" href="#">API</a></li>
              <li><a className="hover:text-foreground" href="#">Contracts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a className="hover:text-foreground" href="#">GitHub</a></li>
              <li><a className="hover:text-foreground" href="#">Twitter</a></li>
              <li><a className="hover:text-foreground" href="#">Discord</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} zkAssetRaffle. All rights reserved.</p>
          <p>Powered by Zero‑Knowledge Proofs</p>
        </div>
      </div>
    </footer>
  );
}

