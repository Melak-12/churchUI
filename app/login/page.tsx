"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSuppressHydration } from "@/hooks/use-suppress-hydration";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Church, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";

export default function LoginPage() {
  const router = useRouter();
  const isClient = useSuppressHydration();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await login(formData.email, formData.password);

      // Redirect based on user role
      if (user.role === "ADMIN") {
        router.push("/dashboard");
      } else if (user.role === "MEMBER") {
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    setFormData({ ...formData, email, password });
    setError("");
  };

  // Demo credentials from the backend
  const demoCredentials = [
    { email: "john.smith@email.com", password: "password123", role: "Admin" },
    {
      email: "sarah.johnson@email.com",
      password: "password123",
      role: "Member",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4">
            <Image 
              src={theme === "dark" ? "/worshiply-dark.png" : "/worshiply-logo.png"} 
              alt="Worshiply" 
              width={96}
              height={96}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <Card className="shadow-md border backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 md:pb-6 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            <div suppressHydrationWarning={true}>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-10 text-sm"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2 sm:px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          rememberMe: checked as boolean,
                        })
                      }
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    />
                    <Label htmlFor="rememberMe" className="text-xs sm:text-sm">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-9 sm:h-10 md:h-11 text-sm"
                  disabled={isLoading || !formData.email || !formData.password}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs sm:text-sm">Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Quick Login Buttons - Integrated into form */}
                <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                  <div className="text-center text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">
                    Quick Login
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        fillCredentials(
                          demoCredentials[0].email,
                          demoCredentials[0].password
                        )
                      }
                      className="text-[10px] sm:text-xs py-1.5 sm:py-2 h-7 sm:h-8"
                    >
                      {demoCredentials[0].role}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        fillCredentials(
                          demoCredentials[1].email,
                          demoCredentials[1].password
                        )
                      }
                      className="text-[10px] sm:text-xs py-1.5 sm:py-2 h-7 sm:h-8"
                    >
                      {demoCredentials[1].role}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            <div className="mt-4 sm:mt-6">
              <Separator className="my-3 sm:my-4" />

              <div className="text-center space-y-1.5 sm:space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Register here
                  </Link>
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  New member?{" "}
                  <Link
                    href="/member-info"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Join our community
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 md:mt-8">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            © 2025 Hex Soup. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
