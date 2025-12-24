"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card } from "@/components/ui/card";

const platforms = [
  { name: "TikTok", icon: "/images/platforms/tiktok.svg", count: "10K+" },
  { name: "Instagram", icon: "/images/platforms/instagram.svg", count: "8K+" },
  { name: "Facebook", icon: "/images/platforms/facebook.svg", count: "12K+" },
  { name: "YouTube", icon: "/images/platforms/youtube.svg", count: "5K+" },
  { name: "X (Twitter)", icon: "/images/platforms/x.svg", count: "7K+" },
  { name: "Telegram", icon: "/images/platforms/telegram.svg", count: "3K+" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function PlatformsSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Supported Platforms
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We provide professional boosting services across all major social
          media platforms
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {platforms.map((platform) => (
          <motion.div
            key={platform.name}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative group"
          >
            <Card className="p-6 text-center hover:border-primary/50 transition-all cursor-pointer bg-linear-to-br from-card to-card/50">
              <Image
                src={platform.icon}
                alt={platform.name}
                width={48}
                height={48}
                className="mx-auto mb-3 opacity-80 group-hover:opacity-100 transition-opacity"
                priority={false}
              />
              <h4 className="font-semibold mb-1">{platform.name}</h4>
              <p className="text-xs text-primary">{platform.count} orders</p>
              <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
