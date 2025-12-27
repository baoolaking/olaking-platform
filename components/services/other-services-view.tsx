"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Target,
  Sparkles,
  BarChart3,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const otherServices = [
  {
    id: 2,
    title: "Buy UK Account",
    description: "Get verified UK accounts for your business needs",
    icon: Globe,
    color: "from-blue-500/20 to-blue-500/10",
    category: "Account Services",
  },
  {
    id: 3,
    title: "Open PayPal Account",
    description: "Professional PayPal account setup and verification",
    icon: Target,
    color: "from-purple-500/20 to-purple-500/10",
    category: "Payment Services",
  },
  {
    id: 4,
    title: "Buy TikTok Coins",
    description: "Affordable TikTok coins for gifting and engagement",
    icon: Sparkles,
    color: "from-pink-500/20 to-pink-500/10",
    category: "Digital Currency",
  },
  {
    id: 5,
    title: "Buy USA/UK Numbers",
    description: "Virtual phone numbers for USA and UK regions",
    icon: BarChart3,
    color: "from-orange-500/20 to-orange-500/10",
    category: "Virtual Numbers",
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

interface OtherServicesViewProps {
  searchTerm?: string;
}

export function OtherServicesView({ searchTerm = "" }: OtherServicesViewProps) {
  const handleServiceClick = (service: typeof otherServices[0]) => {
    const message = encodeURIComponent(
      `Hello! I'm interested in: ${service.title}`
    );
    const phone = "2349017992518";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  // Filter services based on search term
  const filteredServices = otherServices.filter(
    (service) =>
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredServices.length === 0 && searchTerm) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No services found matching "{searchTerm}"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Other Services</h2>
        <p className="text-muted-foreground">
          Additional services available via WhatsApp consultation
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6"
      >
        {filteredServices.map((service) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative group"
            >
              <Card
                className={`p-6 cursor-pointer hover:border-primary/50 transition-all h-full bg-gradient-to-br ${service.color} hover:shadow-lg`}
                onClick={() => handleServiceClick(service)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-background/80 backdrop-blur-sm rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                </div>

                <Badge variant="outline" className="mb-3 text-xs">
                  {service.category}
                </Badge>

                <h3 className="text-xl font-semibold mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {service.description}
                </p>

                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Contact via WhatsApp
                </Badge>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}