"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Globe,
  Target,
  Sparkles,
  BarChart3,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const objectives = [
  {
    id: 1,
    title: "Social Media Boosting",
    description:
      "Grow your presence on TikTok, Instagram, Facebook, YouTube, X, and more",
    icon: TrendingUp,
    color: "from-primary/20 to-primary/10",
    route: "/services",
    isInternal: true,
  },
  {
    id: 2,
    title: "Buy UK Account",
    description: "Get verified UK accounts for your business needs",
    icon: Globe,
    color: "from-blue-500/20 to-blue-500/10",
    route: "whatsapp",
    isInternal: false,
  },
  {
    id: 3,
    title: "Open PayPal Account",
    description: "Professional PayPal account setup and verification",
    icon: Target,
    color: "from-purple-500/20 to-purple-500/10",
    route: "whatsapp",
    isInternal: false,
  },
  {
    id: 4,
    title: "Buy TikTok Coins",
    description: "Affordable TikTok coins for gifting and engagement",
    icon: Sparkles,
    color: "from-pink-500/20 to-pink-500/10",
    route: "whatsapp",
    isInternal: false,
  },
  {
    id: 5,
    title: "Buy USA/UK Numbers",
    description: "Virtual phone numbers for USA and UK regions",
    icon: BarChart3,
    color: "from-orange-500/20 to-orange-500/10",
    route: "whatsapp",
    isInternal: false,
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

export function ObjectivesSection() {
  const handleObjectiveClick = (objective: (typeof objectives)[0]) => {
    if (objective.isInternal) {
      return;
    } else {
      const message = encodeURIComponent(
        `Hello! I'm interested in: ${objective.title}`
      );
      const phone = "2349017992518";
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    }
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          Our Services
        </Badge>
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Choose Your Goal
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select from our range of professional services to achieve your
          business objectives
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {objectives.map((objective) => {
          const Icon = objective.icon;
          return (
            <motion.div
              key={objective.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative group"
            >
              {objective.isInternal ? (
                <Link href={objective.route}>
                  <Card
                    className={`p-6 cursor-pointer hover:border-primary/50 transition-all h-full bg-linear-to-br ${objective.color}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-background/80 backdrop-blur-sm rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">
                      {objective.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {objective.description}
                    </p>
                  </Card>
                </Link>
              ) : (
                <div onClick={() => handleObjectiveClick(objective)}>
                  <Card
                    className={`p-6 cursor-pointer hover:border-primary/50 transition-all h-full bg-linear-to-br ${objective.color}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-background/80 backdrop-blur-sm rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">
                      {objective.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {objective.description}
                    </p>
                    <Badge variant="outline" className="mt-4 text-xs">
                      Contact via WhatsApp
                    </Badge>
                  </Card>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
