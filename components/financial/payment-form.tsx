"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, DollarSign, CreditCard, CheckCircle } from "lucide-react";
import apiClient from "@/lib/api";

const paymentSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  type: z.enum([
    "TITHE",
    "OFFERING",
    "DUES",
    "SPECIAL_OFFERING",
    "EVENT_FEE",
    "OTHER",
  ]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum([
    "CASH",
    "CHECK",
    "CREDIT_CARD",
    "BANK_TRANSFER",
    "ONLINE",
    "MOBILE",
  ]),
  paymentDate: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  checkNumber: z.string().optional(),
  bankName: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  members: Array<{ id: string; firstName: string; lastName: string }>;
  onSuccess?: (payment: any) => void;
  onCancel?: () => void;
}

export function PaymentForm({
  members,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  // Debug members data
  console.log("👥 PaymentForm received members:", members);
  console.log("📊 Members count:", members?.length || 0);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: "TITHE",
      method: "CASH",
      paymentDate: new Date().toISOString().split("T")[0],
    },
  });

  const selectedMethod = form.watch("method");

  const onSubmit = async (data: PaymentFormData) => {
    let paymentData: any = null;
    
    try {
      setIsLoading(true);
      setError("");

      paymentData = {
        memberId: data.memberId,
        type: data.type,
        amount: data.amount,
        method: data.method,
        paymentDate: data.paymentDate,
        description: data.description,
        category: data.category,
        metadata: {
          checkNumber: data.checkNumber,
          bankName: data.bankName,
          notes: data.notes,
        },
      };

      const response = await apiClient.post<{ payment: any }>(
        "/api/financial/payments",
        paymentData
      );

      if (response.success && response.data) {
        setSuccess(true);
        form.reset();
        onSuccess?.((response.data as { payment: any }).payment);
      } else {
        setError(response.message || "Failed to record payment");
      }
    } catch (err: any) {
      console.error("❌ Payment creation error:", err);

      const debugData = {
        error: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers,
        timestamp: new Date().toISOString(),
        paymentData: paymentData,
      };

      setDebugInfo(debugData);
      setError(
        err.response?.data?.message || err.message || "Failed to record payment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Payment Recorded Successfully
            </h3>
            <p className="text-gray-600 mb-4">
              The payment has been recorded and processed.
            </p>
            <div className="space-x-2">
              <Button onClick={() => setSuccess(false)}>
                Record Another Payment
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Record Payment
        </CardTitle>
        <CardDescription>Record a new payment from a member</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">❌ Error: {error}</div>
                {debugInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium hover:text-red-800">
                      🔍 Click to view debug information
                    </summary>
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs font-mono">
                      <div className="space-y-1">
                        <div>
                          <strong>Status:</strong> {debugInfo.status}{" "}
                          {debugInfo.statusText}
                        </div>
                        <div>
                          <strong>URL:</strong> {debugInfo.url}
                        </div>
                        <div>
                          <strong>Method:</strong> {debugInfo.method}
                        </div>
                        <div>
                          <strong>Timestamp:</strong> {debugInfo.timestamp}
                        </div>
                        {debugInfo.paymentData && (
                          <div>
                            <strong>Payment Data:</strong>
                            <pre className="mt-1 p-2 bg-white border rounded overflow-auto max-h-40">
                              {JSON.stringify(debugInfo.paymentData, null, 2)}
                            </pre>
                          </div>
                        )}
                        {debugInfo.responseData && (
                          <div>
                            <strong>Response Data:</strong>
                            <pre className="mt-1 p-2 bg-white border rounded overflow-auto max-h-40">
                              {JSON.stringify(debugInfo.responseData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Debug Information for Members */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-blue-800 hover:text-blue-900">
              🔍 Debug: Members Data
            </summary>
            <div className="mt-2 p-2 bg-white border border-blue-200 rounded text-xs font-mono">
              <div className="space-y-1">
                <div>
                  <strong>Members Count:</strong> {members?.length || 0}
                </div>
                <div>
                  <strong>Members Type:</strong> {typeof members}
                </div>
                <div>
                  <strong>Members Data:</strong>
                </div>
                <pre className="mt-1 p-2 bg-gray-50 border rounded overflow-auto max-h-40">
                  {JSON.stringify(members, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members && members.length > 0 ? (
                          members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.firstName} {member.lastName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-members" disabled>
                            {members === undefined
                              ? "Loading members..."
                              : "No members available"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TITHE">Tithe</SelectItem>
                        <SelectItem value="OFFERING">Offering</SelectItem>
                        <SelectItem value="DUES">Dues</SelectItem>
                        <SelectItem value="SPECIAL_OFFERING">
                          Special Offering
                        </SelectItem>
                        <SelectItem value="EVENT_FEE">Event Fee</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CHECK">Check</SelectItem>
                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="MOBILE">Mobile Payment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Building Fund, Missions"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Method-specific fields */}
            {selectedMethod === "CHECK" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Check number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the payment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Internal notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Record Payment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
