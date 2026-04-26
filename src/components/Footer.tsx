import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-navbar border-t border-border mt-20">
      <div className="container mx-auto px-4 lg:px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              Brazilian Jiu-Jitsu Legends Federation — preserving tradition, certifying excellence.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 grid place-items-center rounded-full border border-border text-foreground/70 hover:text-gold hover:border-gold transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wider text-gold mb-4">Federation</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><Link to="/about" className="hover:text-foreground">About BJJLF</Link></li>
              <li><Link to="/graduates" className="hover:text-foreground">Black Belt Registry</Link></li>
              <li><Link to="/news" className="hover:text-foreground">News & Updates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wider text-gold mb-4">Membership</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><Link to="/register/athlete" className="hover:text-foreground">Register as Athlete</Link></li>
              <li><Link to="/register/academy" className="hover:text-foreground">Register Academy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg tracking-wider text-gold mb-4">Newsletter</h4>
            <p className="text-sm text-foreground/70 mb-3">Get event updates and rankings in your inbox.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input type="email" placeholder="your@email.com" className="bg-background" />
              <Button variant="primary" type="submit">Join</Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} BJJLF — Brazilian Jiu-Jitsu Legends Federation. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
