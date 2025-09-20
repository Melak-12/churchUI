"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Edit2,
  Save,
  X,
} from "lucide-react";
import apiClient from "@/lib/api";
import { getDocumentId } from "@/lib/utils";

interface MemberFormProps {
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
    consent: boolean;
    status: "PAID" | "DELINQUENT";
    delinquencyDays: number;
    eligibility?: "ELIGIBLE" | "NOT_ELIGIBLE";
    eligibilityReason?: string;
    lastPaymentDate?: string;
  };
  onSuccess?: () => void;
}

// EditableField component extracted to prevent recreation on every render
const EditableField = memo(
  ({
    field,
    label,
    value,
    type = "text",
    placeholder = "",
    required = false,
    multiline = false,
    editingField,
    tempValue,
    onStartEditing,
    onSaveEdit,
    onCancelEditing,
    onTempValueChange,
  }: {
    field: string;
    label: string;
    value: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    multiline?: boolean;
    editingField: string | null;
    tempValue: string;
    onStartEditing: (field: string) => void;
    onSaveEdit: (field: string) => void;
    onCancelEditing: () => void;
    onTempValueChange: (value: string) => void;
  }) => {
    const isEditing = editingField === field;

    if (isEditing) {
      return (
        <div className="space-y-2">
          <Label htmlFor={field}>
            {label} {required && "*"}
          </Label>
          <div className="flex space-x-2">
            {multiline ? (
              <Textarea
                id={field}
                value={tempValue}
                onChange={(e) => onTempValueChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    onSaveEdit(field);
                  } else if (e.key === "Escape") {
                    onCancelEditing();
                  }
                }}
                placeholder={placeholder}
                rows={3}
                className="flex-1"
                autoFocus
              />
            ) : (
              <Input
                id={field}
                type={type}
                value={tempValue}
                onChange={(e) => onTempValueChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSaveEdit(field);
                  } else if (e.key === "Escape") {
                    onCancelEditing();
                  }
                }}
                placeholder={placeholder}
                className="flex-1"
                autoFocus
              />
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => onSaveEdit(field)}
              className="px-3"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancelEditing}
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-600">{label}</Label>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <span className="text-gray-900">{value || "Not provided"}</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onStartEditing(field)}
            className="px-2"
            title="Click to edit (Enter to save, Escape to cancel)"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);

EditableField.displayName = "EditableField";

export function MemberForm({ member, onSuccess }: MemberFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: member?.firstName || "",
    lastName: member?.lastName || "",
    phone: member?.phone
      ? member.phone.startsWith("+1")
        ? member.phone
        : "+1" + member.phone.replace(/\D/g, "")
      : "",
    email: member?.email || "",
    address: member?.address || "",
    consent: member?.consent || false,
    status: member?.status || ("PAID" as "PAID" | "DELINQUENT"),
    delinquencyDays: member?.delinquencyDays || 0,
    password: "", // Only for new members
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isEdit = !!member;

  // Create a stable reference for member data to prevent unnecessary re-renders
  const memberData = useMemo(() => {
    if (!member) return null;
    return {
      id: getDocumentId(member), // Ensure ID is preserved
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      phone: member.phone
        ? member.phone.startsWith("+1")
          ? member.phone
          : "+1" + member.phone.replace(/\D/g, "")
        : "",
      email: member.email || "",
      address: member.address || "",
      consent: member.consent || false,
      status: member.status || ("PAID" as "PAID" | "DELINQUENT"),
      delinquencyDays: member.delinquencyDays || 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    member?.id,
    (member as any)?._id,
    member?.firstName,
    member?.lastName,
    member?.phone,
    member?.email,
    member?.address,
    member?.consent,
    member?.status,
    member?.delinquencyDays,
  ]);

  // Update form data when member data changes
  useEffect(() => {
    if (memberData) {
      console.log("MemberForm - member data changed:", memberData);
      setFormData({
        ...memberData,
        password: "", // Only for new members
      });
    }
  }, [memberData]);

  // Track original values to show changes
  const originalValues = member
    ? {
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        email: member.email || "",
        address: member.address || "",
        consent: member.consent,
        status: member.status,
        delinquencyDays: member.delinquencyDays,
      }
    : {};

  // Check if a field has changed from its original value
  const hasChanged = (field: string) => {
    if (!isEdit) return false;
    return (
      formData[field as keyof typeof formData] !==
      originalValues[field as keyof typeof originalValues]
    );
  };

  // Start editing a field
  const startEditing = (field: string) => {
    setEditingField(field);
    let value = formData[field as keyof typeof formData];

    // Handle different field types
    if (field === "consent") {
      setTempValue(value ? "true" : "false");
    } else {
      setTempValue(value?.toString() || "");
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
    setTempValue("");
  };

  // Save field edit
  const saveFieldEdit = (field: string) => {
    let value: any = tempValue;

    // Handle different field types
    if (field === "delinquencyDays") {
      value = parseInt(tempValue) || 0;
    } else if (field === "consent") {
      value = tempValue === "true";
    }

    handleInputChange(field, value);
    setEditingField(null);
    setTempValue("");
  };

  const validatePhoneNumber = (phone: string) => {
    // Accept US phone numbers: +1 followed by 10 digits
    const usPhoneRegex = /^\+1\d{10}$/;
    return usPhoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate phone number format
    if (!validatePhoneNumber(formData.phone)) {
      setError("Please enter a valid US phone number (e.g., (651) 307-9220)");
      setIsLoading(false);
      return;
    }

    try {
      if (isEdit) {
        // Update existing member
        await apiClient.updateMember(member.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email || undefined,
          address: formData.address || undefined,
          consent: formData.consent,
          status: formData.status,
          delinquencyDays: formData.delinquencyDays,
        });
        setSuccess("Member updated successfully!");
      } else {
        // Create new member
        await apiClient.createMember({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email || undefined,
          address: formData.address || undefined,
          consent: formData.consent,
          status: formData.status,
          delinquencyDays: formData.delinquencyDays,
          eligibility: "ELIGIBLE", // New members start as eligible
          password: formData.password,
        });
        setSuccess("Member created successfully!");
      }

      // Redirect or call success callback
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push("/members");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (isEdit) {
      setHasUnsavedChanges(true);
    }
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    if (!member || !hasUnsavedChanges) return;

    console.log("Member object in handleSaveAllChanges:", member);
    console.log("Member ID:", member.id);
    console.log("Member _id:", (member as any)._id);

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate phone number format
      if (!validatePhoneNumber(formData.phone)) {
        setError("Please enter a valid US phone number (e.g., (651) 307-9220)");
        setIsLoading(false);
        return;
      }

      // Use the correct ID field
      const memberId = getDocumentId(member);
      if (!memberId) {
        setError("Member ID not found. Please refresh the page and try again.");
        setIsLoading(false);
        return;
      }

      console.log("Using member ID for API call:", memberId);
      await apiClient.updateMember(memberId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        consent: formData.consent,
        status: formData.status,
        delinquencyDays: formData.delinquencyDays,
      });

      setSuccess("All changes saved successfully!");
      setHasUnsavedChanges(false);

      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // If it starts with 1 and has 11 digits, it's already US format
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return "+" + cleaned;
    }
    // If it has 10 digits, add US country code
    else if (cleaned.length === 10) {
      return "+1" + cleaned;
    }
    // If it's less than 10 digits, return as is for user to complete
    else if (cleaned.length < 10) {
      return cleaned;
    }
    // If it's more than 10 digits but doesn't start with 1, assume it's US
    else if (cleaned.length > 10 && !cleaned.startsWith("1")) {
      return "+1" + cleaned;
    }
    // Default case
    else {
      return "+" + cleaned;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange("phone", formatted);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{isEdit ? "Member Information" : "Add New Member"}</span>
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Click edit icons to modify fields • Press Enter to save • Use Save Changes to save all"
              : "Create a new member profile for the community"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 mb-6">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {isEdit ? (
            // Edit mode - show editable fields
            <div className="space-y-6 pb-20 md:pb-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField
                  field="firstName"
                  label="First Name"
                  value={formData.firstName}
                  required
                  editingField={editingField}
                  tempValue={tempValue}
                  onStartEditing={startEditing}
                  onSaveEdit={saveFieldEdit}
                  onCancelEditing={cancelEditing}
                  onTempValueChange={setTempValue}
                />
                <EditableField
                  field="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  required
                  editingField={editingField}
                  tempValue={tempValue}
                  onStartEditing={startEditing}
                  onSaveEdit={saveFieldEdit}
                  onCancelEditing={cancelEditing}
                  onTempValueChange={setTempValue}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <EditableField
                  field="phone"
                  label="Phone Number"
                  value={formData.phone}
                  type="tel"
                  required
                  editingField={editingField}
                  tempValue={tempValue}
                  onStartEditing={startEditing}
                  onSaveEdit={saveFieldEdit}
                  onCancelEditing={cancelEditing}
                  onTempValueChange={setTempValue}
                />
                <EditableField
                  field="email"
                  label="Email Address"
                  value={formData.email}
                  type="email"
                  editingField={editingField}
                  tempValue={tempValue}
                  onStartEditing={startEditing}
                  onSaveEdit={saveFieldEdit}
                  onCancelEditing={cancelEditing}
                  onTempValueChange={setTempValue}
                />
                <EditableField
                  field="address"
                  label="Address"
                  value={formData.address}
                  multiline
                  editingField={editingField}
                  tempValue={tempValue}
                  onStartEditing={startEditing}
                  onSaveEdit={saveFieldEdit}
                  onCancelEditing={cancelEditing}
                  onTempValueChange={setTempValue}
                />
              </div>

              {/* Status and Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">
                    Payment Status
                  </Label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <span className="text-gray-900">{formData.status}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing("status")}
                      className="px-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {editingField === "status" && (
                    <div className="flex space-x-2">
                      <select
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PAID">Paid</option>
                        <option value="DELINQUENT">Delinquent</option>
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveFieldEdit("status")}
                        className="px-3"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                        className="px-3"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {formData.status === "DELINQUENT" && (
                  <EditableField
                    field="delinquencyDays"
                    label="Days Delinquent"
                    value={formData.delinquencyDays.toString()}
                    type="number"
                    editingField={editingField}
                    tempValue={tempValue}
                    onStartEditing={startEditing}
                    onSaveEdit={saveFieldEdit}
                    onCancelEditing={cancelEditing}
                    onTempValueChange={setTempValue}
                  />
                )}
              </div>

              {/* Consent */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Communication Consent
                </Label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-900">
                    {formData.consent ? "Yes" : "No"}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing("consent")}
                    className="px-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                {editingField === "consent" && (
                  <div className="flex space-x-2">
                    <div className="flex-1 flex items-center space-x-2">
                      <Checkbox
                        checked={tempValue === "true"}
                        onCheckedChange={(checked) =>
                          setTempValue(checked ? "true" : "false")
                        }
                      />
                      <Label className="text-sm">
                        Member consents to receive communications via SMS and
                        phone
                      </Label>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => saveFieldEdit("consent")}
                      className="px-3"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      className="px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-2">
                  {hasUnsavedChanges && (
                    <span className="text-sm text-amber-600 flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Unsaved changes</span>
                    </span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveAllChanges}
                    disabled={!hasUnsavedChanges || isLoading}
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile Sticky Save Button */}
              {hasUnsavedChanges && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg md:hidden z-50 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex space-x-3 max-w-sm mx-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                      size="sm"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveAllChanges}
                      disabled={isLoading}
                      className="flex-1"
                      size="sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Create mode - show regular form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(651) 111-1111"
                    required
                    className={
                      formData.phone && !validatePhoneNumber(formData.phone)
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <p
                    className={`text-xs ${
                      formData.phone && !validatePhoneNumber(formData.phone)
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.phone && !validatePhoneNumber(formData.phone)
                      ? "Please enter a valid US phone number (e.g., (651) 307-9220)"
                      : "Enter US phone number (country code +1 will be added automatically)"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="member@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter password for member login"
                  required
                />
              </div>

              {/* Status and Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Payment Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PAID">Paid</option>
                    <option value="DELINQUENT">Delinquent</option>
                  </select>
                </div>

                {formData.status === "DELINQUENT" && (
                  <div className="space-y-2">
                    <Label htmlFor="delinquencyDays">Days Delinquent</Label>
                    <Input
                      id="delinquencyDays"
                      type="number"
                      min="0"
                      value={formData.delinquencyDays}
                      onChange={(e) =>
                        handleInputChange(
                          "delinquencyDays",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              {/* Consent */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) =>
                    handleInputChange("consent", checked)
                  }
                  required
                />
                <Label htmlFor="consent" className="text-sm">
                  Member consents to receive communications via SMS and phone
                </Label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !formData.firstName ||
                    !formData.lastName ||
                    !formData.phone ||
                    !validatePhoneNumber(formData.phone) ||
                    !formData.password
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Member"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
