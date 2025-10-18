"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { isAuthenticated, getCurrentUser, getDefaultRoute } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  Vote, 
  DollarSign, 
  MessageSquare, 
  Shield,
  ArrowRight,
  CheckCircle,
  LayoutDashboard
} from "lucide-react";

export default function LandingPage() {
  const { theme } = useTheme();

  const features = [
    {
      icon: Users,
      title: "Member Management",
      description: "Easily manage member profiles, families, and contact information in one place."
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "Create and manage church events, track attendance, and send notifications."
    },
    {
      icon: Vote,
      title: "Voting System",
      description: "Conduct secure online voting for church decisions and elections."
    },
    {
      icon: DollarSign,
      title: "Financial Tracking",
      description: "Track donations, manage budgets, and generate financial reports."
    },
    {
      icon: MessageSquare,
      title: "Communications",
      description: "Send announcements, newsletters, and SMS updates to your congregation."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy controls."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8">
              <Image 
                src={theme === "dark" ? "/worshiply-dark.png" : "/worshiply-logo.png"} 
                alt="Worshiply" 
                width={128}
                height={128}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Welcome to{" "}
              <span className="text-primary">Worshiply</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              The complete church management solution that brings your congregation together. 
              Manage members, events, finances, and communications all in one beautiful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAuthenticated() ? (
                <Button asChild size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                  <Link href={getDefaultRoute(getCurrentUser().role)}>
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                    <Link href="/login">
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                    <Link href="/member-info">
                      Join Our Community
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Easy to Use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Mobile Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything Your Church Needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for church communities to help you 
              connect, organize, and grow together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of churches already using Worshiply to manage their communities. 
              Get started today and see how easy church management can be.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                <Link href="/login">
                  Access Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-lg">
                <Link href="/member-info">
                  New Member Registration
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <Image 
                src={theme === "dark" ? "/worshiply-dark.png" : "/worshiply-logo.png"} 
                alt="Worshiply" 
                width={64}
                height={64}
                className="w-full h-full object-contain opacity-60"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Hex Soup. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
