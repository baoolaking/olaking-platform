"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "Orders processed and delivered within 24-48 hours",
  },
  {
    icon: Shield,
    title: "100% Safe",
    description: "Gradual delivery to protect your account security",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Always available via WhatsApp and email",
  },
  {
    icon: CheckCircle2,
    title: "Money-Back Guarantee",
    description: "Full refund or replacement for failed orders",
  },
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

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 text-center hover:border-primary/50 transition-all h-full">
                <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
