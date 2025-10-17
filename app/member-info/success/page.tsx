"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, User } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 flex items-center">
      <div className="max-w-lg mx-auto w-full">
        <Card className="shadow-xl border-0 text-center">
          <CardHeader className="space-y-6 pb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to Our Community!
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Your information has been successfully submitted
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                What's Next?
              </h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    You'll receive a confirmation message shortly
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Check your email for login credentials
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    You can update your profile anytime after logging in
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => router.push("/")}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Go to Home
              </Button>

              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                <User className="h-5 w-5 mr-2" />
                Login
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Redirecting to home in {countdown} seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

