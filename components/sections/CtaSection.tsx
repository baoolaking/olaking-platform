"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-12 text-center bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Presence?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients and start boosting your social
            media today. Fast delivery, safe methods, and 24/7 support
            guaranteed.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Create Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const phone = "2349017992518";
                window.open(`https://wa.me/${phone}`, "_blank");
              }}
            >
              <MessageCircle className="mr-2 w-4 h-4" />
              Contact Support
            </Button>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
