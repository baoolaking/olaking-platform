"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe,
  Target,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
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

const platforms = [
  { name: "TikTok", icon: "/images/platforms/tiktok.svg", count: "10K+" },
  { name: "Instagram", icon: "/images/platforms/instagram.svg", count: "8K+" },
  { name: "Facebook", icon: "/images/platforms/facebook.svg", count: "12K+" },
  { name: "YouTube", icon: "/images/platforms/youtube.svg", count: "5K+" },
  { name: "X (Twitter)", icon: "/images/platforms/x.svg", count: "7K+" },
  { name: "Telegram", icon: "/images/platforms/telegram.svg", count: "3K+" },
];

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

const stats = [
  { value: "50K+", label: "Orders Completed" },
  { value: "15K+", label: "Happy Clients" },
  { value: "99.9%", label: "Success Rate" },
  { value: "24/7", label: "Support" },
];

export default function LandingPage() {
  const handleObjectiveClick = (objective: (typeof objectives)[0]) => {
    if (objective.isInternal) {
      // Navigate to internal route (handled by Link)
      return;
    } else {
      // Redirect to WhatsApp
      const message = encodeURIComponent(
        `Hello! I'm interested in: ${objective.title}`
      );
      const phone = "2349017992518"; // +234 901 799 2518
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    }
  };

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

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                BAO OLAKING
              </h1>
              <p className="text-xs text-muted-foreground">
                Global Enterprises
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
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
              <Link href="/services">
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
            <div className="grid grid-cols-4 gap-4 mt-12">
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
                  position:
                    "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
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

      {/* Platforms Section */}
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

      {/* Objectives Section */}
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

      {/* Features Section */}
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

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">BAO OLAKING</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional social media boosting services trusted by thousands
                worldwide.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Services</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/services"
                    className="hover:text-primary transition-colors"
                  >
                    TikTok Boosting
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="hover:text-primary transition-colors"
                  >
                    Instagram Growth
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="hover:text-primary transition-colors"
                  >
                    YouTube Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="hover:text-primary transition-colors"
                  >
                    Facebook Engagement
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-primary transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
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

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2025 BAO OLAKING GLOBAL ENTERPRISES. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
