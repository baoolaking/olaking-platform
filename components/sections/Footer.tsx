"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="mb-4">
              <Image
                src="/images/header-logo.png"
                alt="BAO OLAKING Logo"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Professional social media boosting services trusted by thousands
              worldwide.
            </p>
          </div>

          <div>
            <h5 className="font-semibold mb-4">Contact</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>WhatsApp: +234 901 799 2518</li>
              <li>WhatsApp: +234 916 331 3727</li>
              <li>Email: support@olaking.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>
            &copy; 2025 BAO OLAKING GLOBAL ENTERPRISES. All rights reserved.
          </p>
          <p>
            REGISTRATION NO. 8298166
          </p>
          <p>
            Developed with ❤️ by{" "}
            <Link
              href="https://decryptus.codmify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline"
            >
              Decryptus
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
