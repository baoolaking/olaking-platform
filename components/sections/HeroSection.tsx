"use client";

import { motion } from "framer-motion";
import {
  Users,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const stats = [
  { value: "50K+", label: "Orders Completed" },
  { value: "15K+", label: "Happy Clients" },
  { value: "99.9%", label: "Success Rate" },
  { value: "24/7", label: "Support" },
];

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Trusted by 15,000+ Clients
          </Badge>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Grow Your{" "}
            <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Social Media
            </span>{" "}
            Presence
          </h2>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Professional boosting services for TikTok, Instagram, Facebook,
            YouTube, and more. Safe, fast, and reliable growth for your online
            presence.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/services">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 group"
              >
                Explore Services
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              Chat with Us
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Animated Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative w-full aspect-square max-w-lg mx-auto">
            {/* Floating Icons */}
            {[
              { Icon: Users, position: "top-10 left-10", delay: 0 },
              { Icon: Heart, position: "top-20 right-10", delay: 0.2 },
              { Icon: Eye, position: "bottom-20 left-16", delay: 0.4 },
              { Icon: Share2, position: "bottom-16 right-20", delay: 0.6 },
              {
                Icon: TrendingUp,
                position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                delay: 0.8,
              },
            ].map(({ Icon, position, delay }, index) => (
              <motion.div
                key={index}
                className={`absolute ${position} bg-linear-to-br from-primary/20 to-primary/10 p-4 rounded-2xl backdrop-blur-sm border border-primary/20`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -10, 0],
                }}
                transition={{
                  opacity: { delay },
                  scale: { delay },
                  y: {
                    duration: 2 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <Icon className="w-8 h-8 text-primary" />
              </motion.div>
            ))}

            {/* Central Glow */}
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
