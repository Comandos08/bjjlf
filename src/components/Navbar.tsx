import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/" as const, label: "Home" },
  { to: "/news" as const, label: "News" },
  { to: "/graduates" as const, label: "Graduates" },
  { to: "/about" as const, label: "About" },
  { to: "/register/athlete" as const, label: "Athletes" },
  { to: "/register/academy" as const, label: "Academies" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navbar/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 font-heading text-sm uppercase tracking-wider text-foreground/80 hover:text-foreground transition-colors"
              activeProps={{ className: "px-4 py-2 font-heading text-sm uppercase tracking-wider text-primary border-b-2 border-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" className="font-heading uppercase tracking-wider">Login</Button>
          <Button variant="primary" className="font-heading uppercase tracking-wider">Sign Up</Button>
        </div>

        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-navbar">
          <nav className="container mx-auto flex flex-col px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-3 font-heading uppercase tracking-wider text-foreground/80"
                activeProps={{ className: "py-3 font-heading uppercase tracking-wider text-primary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3">
              <Button variant="ghost" className="flex-1">Login</Button>
              <Button variant="primary" className="flex-1">Sign Up</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
