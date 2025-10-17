"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Users,
  Plus,
  X,
} from "lucide-react";
import apiClient from "@/lib/api";

type Step =
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "address"
  | "password"
  | "confirmPassword"
  | "consent"
  | "familyIntro"
  | "familyAdd"
  | "familyList"
  | "submitting";

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
}

export function WizardInfoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState<Step>("firstName");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: {
      street: "",
      street2: "",
      city: "",
      state: "",
      zipCode: "",
    },
    password: "",
    confirmPassword: "",
    consent: false,
  });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentFamily, setCurrentFamily] = useState({
    firstName: "",
    lastName: "",
    relationship: "CHILD",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneFromUrl, setPhoneFromUrl] = useState(false);

  // Read phone from URL query parameters
  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    if (phoneParam) {
      const formattedPhone = formatPhoneNumber(phoneParam);
      setFormData((prev) => ({ ...prev, phone: formattedPhone }));
      setPhoneFromUrl(true);
    }
  }, [searchParams]);

  const validatePhoneNumber = (phone: string) => {
    const usPhoneRegex = /^\+1\d{10}$/;
    return usPhoneRegex.test(phone);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return "+" + cleaned;
    } else if (cleaned.length === 10) {
      return "+1" + cleaned;
    } else if (cleaned.length < 10) {
      return cleaned;
    } else if (cleaned.length > 10 && !cleaned.startsWith("1")) {
      return "+1" + cleaned;
    }
    return "+" + cleaned;
  };

  const handlePhoneChange = (value: string, isFamilyPhone = false) => {
    const formatted = formatPhoneNumber(value);
    if (isFamilyPhone) {
      setCurrentFamily((prev) => ({ ...prev, phone: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, phone: formatted }));
    }
  };

  const canProgressFromStep = (step: Step): boolean => {
    switch (step) {
      case "firstName":
        return formData.firstName.trim().length > 0;
      case "lastName":
        return formData.lastName.trim().length > 0;
      case "phone":
        return validatePhoneNumber(formData.phone);
      case "email":
        return true; // Optional
      case "address":
        return true; // Optional
      case "password":
        return (
          formData.password.length >= 8 &&
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
        );
      case "confirmPassword":
        return formData.password === formData.confirmPassword;
      case "consent":
        return formData.consent;
      case "familyIntro":
        return true;
      case "familyAdd":
        return currentFamily.firstName.trim().length > 0;
      case "familyList":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    setError("");

    const stepOrder: Step[] = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "password",
      "confirmPassword",
      "consent",
      "familyIntro",
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else if (currentStep === "familyIntro") {
      setCurrentStep("familyAdd");
    } else if (currentStep === "familyAdd") {
      if (currentFamily.firstName.trim()) {
        // Add family member
        const newMember: FamilyMember = {
          id: Date.now().toString(),
          ...currentFamily,
          lastName: currentFamily.lastName || formData.lastName,
        };
        setFamilyMembers([...familyMembers, newMember]);
        setCurrentFamily({
          firstName: "",
          lastName: "",
          relationship: "CHILD",
          phone: "",
        });
      }
      setCurrentStep("familyList");
    } else if (currentStep === "familyList") {
      handleSubmit();
    }
  };

  const handleBack = () => {
    const stepOrder: Step[] = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "password",
      "confirmPassword",
      "consent",
      "familyIntro",
      "familyAdd",
      "familyList",
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSkipFamily = () => {
    handleSubmit();
  };

  const handleAddAnother = () => {
    setCurrentStep("familyAdd");
  };

  const handleRemoveFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    setCurrentStep("submitting");
    setIsLoading(true);
    setError("");

    try {
      // Format address as a single string
      const addressParts = [
        formData.address.street,
        formData.address.street2,
        formData.address.city,
        formData.address.state,
        formData.address.zipCode,
      ].filter(Boolean);
      
      const formattedAddress = addressParts.length > 0 
        ? addressParts.join(", ") 
        : undefined;

      const profileData = {
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        address: formattedAddress,
        password: formData.password,
        consent: formData.consent,
        familyMembers: familyMembers.map((fm) => ({
          firstName: fm.firstName,
          lastName: fm.lastName || formData.lastName,
          relationship: fm.relationship,
          phone: fm.phone || undefined,
        })),
      };

      await apiClient.completeProfile(profileData);
      router.push("/member-info/success");
    } catch (err: any) {
      setError(err.message || "Failed to save information. Please try again.");
      setIsLoading(false);
      setCurrentStep("consent");
    }
  };

  const getStepNumber = (): number => {
    const stepOrder: Step[] = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "password",
      "confirmPassword",
      "consent",
      "familyIntro",
      "familyAdd",
      "familyList",
    ];
    return stepOrder.indexOf(currentStep) + 1;
  };

  const getTotalSteps = (): number => {
    return 11; // Total steps including family
  };

  const isStepOptional = (step: Step): boolean => {
    return ["email", "address", "familyIntro"].includes(step);
  };

  const handleSkip = () => {
    // Clear the current field(s) when skipping
    if (currentStep === "email") {
      setFormData((prev) => ({ ...prev, email: "" }));
    } else if (currentStep === "address") {
      setFormData((prev) => ({
        ...prev,
        address: {
          street: "",
          street2: "",
          city: "",
          state: "",
          zipCode: "",
        },
      }));
    }

    const stepOrder: Step[] = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "password",
      "confirmPassword",
      "consent",
      "familyIntro",
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else if (currentStep === "familyIntro") {
      handleSubmit();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "firstName":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome to Our Community
              </h1>
              <p className="text-xl text-gray-600">Let's start with your first name</p>
            </div>
            <div className="max-w-md mx-auto">
              <Input
                autoFocus
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canProgressFromStep("firstName")) {
                    handleNext();
                  }
                }}
                placeholder="Your first name"
                className="text-2xl h-16 text-center"
              />
            </div>
          </div>
        );

      case "lastName":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Nice to meet you, {formData.firstName}!
              </h1>
              <p className="text-xl text-gray-600">What's your last name?</p>
            </div>
            <div className="max-w-md mx-auto">
              <Input
                autoFocus
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canProgressFromStep("lastName")) {
                    handleNext();
                  }
                }}
                placeholder="Your last name"
                className="text-2xl h-16 text-center"
              />
            </div>
          </div>
        );

      case "phone":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Your phone number</h1>
              <p className="text-xl text-gray-600">
                {phoneFromUrl
                  ? "We have your phone number on file"
                  : "We'll use this to keep you connected"}
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <Input
                  autoFocus={!phoneFromUrl}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canProgressFromStep("phone")) {
                      handleNext();
                    }
                  }}
                  placeholder="(555) 123-4567"
                  className="text-2xl h-16 text-center"
                  disabled={phoneFromUrl}
                  readOnly={phoneFromUrl}
                />
                {phoneFromUrl && (
                  <div className="absolute inset-0 bg-gray-50 bg-opacity-50 rounded-md pointer-events-none" />
                )}
              </div>
              {phoneFromUrl && (
                <p className="text-sm text-gray-500 text-center">
                  This phone number was provided in your invitation link
                </p>
              )}
              {formData.phone && !validatePhoneNumber(formData.phone) && !phoneFromUrl && (
                <p className="text-red-500 text-center">
                  Please enter a valid phone number
                </p>
              )}
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">Email address</h1>
                <span className="inline-block px-4 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                  Optional
                </span>
              </div>
              <p className="text-xl text-gray-600">Helpful for important updates</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <Input
                autoFocus
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNext();
                  }
                }}
                placeholder="your.email@example.com"
                className="text-2xl h-16 text-center"
              />
              <button
                onClick={handleSkip}
                className="w-full text-center text-base text-gray-500 hover:text-gray-700 py-2 underline"
              >
                Skip this step
              </button>
            </div>
          </div>
        );

      case "address":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">Where do you live?</h1>
                <span className="inline-block px-4 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                  Optional
                </span>
              </div>
              <p className="text-xl text-gray-600">Helps us serve you better</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <Input
                autoFocus
                type="text"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value },
                  }))
                }
                placeholder="Street address"
                className="text-lg h-14"
              />
              <Input
                type="text"
                value={formData.address.street2}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, street2: e.target.value },
                  }))
                }
                placeholder="Apt, Suite, Unit (optional)"
                className="text-lg h-14"
              />
              <Input
                type="text"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value },
                  }))
                }
                placeholder="City"
                className="text-lg h-14"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value },
                    }))
                  }
                  placeholder="State"
                  className="text-lg h-14"
                  maxLength={2}
                />
                <Input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value },
                    }))
                  }
                  placeholder="ZIP Code"
                  className="text-lg h-14"
                  maxLength={10}
                />
              </div>
              <button
                onClick={handleSkip}
                className="w-full text-center text-base text-gray-500 hover:text-gray-700 py-2 underline"
              >
                Skip this step
              </button>
            </div>
          </div>
        );

      case "password":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Create a password</h1>
              <p className="text-xl text-gray-600">
                Keep your account secure
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <Input
                  autoFocus
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canProgressFromStep("password")) {
                      handleNext();
                    }
                  }}
                  placeholder="Your password"
                  className="text-2xl h-16 text-center pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 text-center">
                At least 8 characters with uppercase, lowercase, and a number
              </p>
              {formData.password && !canProgressFromStep("password") && (
                <p className="text-red-500 text-center text-sm">
                  Password doesn't meet requirements
                </p>
              )}
            </div>
          </div>
        );

      case "confirmPassword":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Confirm password</h1>
              <p className="text-xl text-gray-600">Enter it one more time</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <Input
                  autoFocus
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canProgressFromStep("confirmPassword")) {
                      handleNext();
                    }
                  }}
                  placeholder="Confirm password"
                  className="text-2xl h-16 text-center pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-center">Passwords don't match</p>
                )}
            </div>
          </div>
        );

      case "consent":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">One more thing</h1>
              <p className="text-xl text-gray-600">
                We need your permission to stay in touch
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <div
                className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, consent: !prev.consent }))
                }
              >
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={formData.consent}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, consent: !!checked }))
                    }
                    className="mt-1"
                  />
                  <p className="text-lg leading-relaxed">
                    I agree to receive communications via SMS and phone from the
                    church about events, updates, and community information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "familyIntro":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">Family members?</h1>
                <span className="inline-block px-4 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                  Optional
                </span>
              </div>
              <p className="text-xl text-gray-600">
                Add your family members who are part of the community
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <Button
                onClick={() => setCurrentStep("familyAdd")}
                className="w-full h-16 text-xl"
                size="lg"
              >
                <Plus className="h-6 w-6 mr-2" />
                Add Family Member
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full h-16 text-xl"
                size="lg"
              >
                Skip - I'll complete this
              </Button>
            </div>
          </div>
        );

      case "familyAdd":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">Add family member</h1>
              <p className="text-lg text-gray-600">Tell us about them</p>
            </div>
            <div className="max-w-md mx-auto space-y-6">
              <Input
                autoFocus
                type="text"
                value={currentFamily.firstName}
                onChange={(e) =>
                  setCurrentFamily((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder="First name"
                className="text-xl h-14"
              />
              <Input
                type="text"
                value={currentFamily.lastName}
                onChange={(e) =>
                  setCurrentFamily((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                placeholder="Last name (optional)"
                className="text-xl h-14"
              />
              <select
                value={currentFamily.relationship}
                onChange={(e) =>
                  setCurrentFamily((prev) => ({
                    ...prev,
                    relationship: e.target.value,
                  }))
                }
                className="w-full text-xl h-14 px-4 rounded-md border border-gray-300"
              >
                <option value="CHILD">Child</option>
                <option value="SPOUSE">Spouse</option>
                <option value="PARENT">Parent</option>
                <option value="SIBLING">Sibling</option>
                <option value="OTHER">Other</option>
              </select>
              <Input
                type="tel"
                value={currentFamily.phone}
                onChange={(e) => handlePhoneChange(e.target.value, true)}
                placeholder="Phone (optional)"
                className="text-xl h-14"
              />
            </div>
          </div>
        );

      case "familyList":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {familyMembers.length > 0
                  ? `${familyMembers.length} Family ${
                      familyMembers.length === 1 ? "Member" : "Members"
                    } Added`
                  : "No family members yet"}
              </h1>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-lg">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-gray-600 capitalize">
                      {member.relationship.toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFamilyMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              ))}
              <Button
                onClick={handleAddAnother}
                variant="outline"
                className="w-full h-14 text-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Another
              </Button>
            </div>
          </div>
        );

      case "submitting":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
              <h1 className="text-4xl font-bold text-gray-900">
                Creating your profile...
              </h1>
              <p className="text-xl text-gray-600">This will only take a moment</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Progress bar */}
      {currentStep !== "submitting" && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-32 sm:pb-32">
        <div className="w-full max-w-3xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {renderStep()}
        </div>
      </div>

      {/* Navigation buttons */}
      {currentStep !== "submitting" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:p-6">
          <div className="max-w-3xl mx-auto">
            {/* Step counter - centered on mobile, visible on all screens */}
            <div className="text-xs sm:text-sm text-gray-500 text-center mb-3 sm:hidden">
              Step {getStepNumber()} of {getTotalSteps()}
            </div>
            
            <div className="flex items-center justify-between gap-2">
              {/* Back button */}
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-sm sm:text-lg sm:h-11 shrink-0"
                disabled={currentStep === "firstName"}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              {/* Step counter - hidden on mobile, visible on desktop */}
              <div className="hidden sm:block text-sm text-gray-500">
                {getStepNumber()} of {getTotalSteps()}
              </div>

              {/* Right side buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isStepOptional(currentStep) && (
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    size="sm"
                    className="text-sm sm:text-lg text-gray-500 sm:h-11"
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="text-sm sm:text-lg sm:h-11"
                  disabled={!canProgressFromStep(currentStep)}
                >
                  <span className="hidden sm:inline">
                    {currentStep === "familyList" ? "Complete" : "Next"}
                  </span>
                  <span className="sm:hidden">
                    {currentStep === "familyList" ? "Done" : "Next"}
                  </span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

