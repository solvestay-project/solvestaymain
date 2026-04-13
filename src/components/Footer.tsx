import Link from "next/link";
import {
  Home,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
} from "lucide-react";

const CONTACT_EMAIL = "solvestay@gmail.com";

export function Footer() {
  return (
    <footer className="bg-[#f4f6f9] border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center shadow-sm">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">
                Solvestay
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              India&apos;s most transparent property platform. Find houses,
              apartments, PGs, and land with zero brokerage. Connect directly
              with verified property owners.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/properties"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Find Properties
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?listing_type=rent"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Rent a Home
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?listing_type=sale"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Buy a Home
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register?role=owner"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  List Your Property
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-6">Company &amp; legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-6">Contact us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-muted-foreground hover:text-primary text-sm transition-colors break-all"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Solvestay. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/faq"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
