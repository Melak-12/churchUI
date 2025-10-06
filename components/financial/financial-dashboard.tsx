"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Plus,
  Loader2,
} from "lucide-react";
import { PaymentForm } from "./payment-form";
import { TransactionManager } from "./transaction-manager";
import { BudgetManager } from "./budget-manager";
import { ReportsManager } from "./reports-manager";
import apiClient from "@/lib/api";

interface FinancialStats {
  payments: {
    totalRevenue: number;
    totalPayments: number;
    byType: Array<{
      type: string;
      totalAmount: number;
      count: number;
      averageAmount: number;
    }>;
  };
  transactions: {
    income: number;
    expenses: number;
    netIncome: number;
    totalTransactions: number;
  };
}

interface Payment {
  id: string;
  member: {
    firstName: string;
    lastName: string;
  };
  type: string;
  amount: number;
  method: string;
  status: string;
  paymentDate: string;
  description?: string;
}

export function FinancialDashboard() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<
    Array<{ id: string; firstName: string; lastName: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [dateRange, setDateRange] = useState("30"); // days

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      setDebugInfo(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      console.log("🔍 Fetching financial data...");
      console.log("📅 Date range:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const [statsResponse, paymentsResponse, membersResponse] =
        await Promise.all([
          apiClient.get<FinancialStats>(
            `/api/financial/financial/summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
          ),
          apiClient.get<{ payments: any[] }>(
            `/api/financial/payments?limit=10&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
          ),
          apiClient.getMembers({ limit: 1000 }), // Get all members for payment form
        ]);

      console.log("📊 Stats response:", statsResponse);
      console.log("💰 Payments response:", paymentsResponse);
      console.log("👥 Members response:", membersResponse);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as FinancialStats);
      }

      if (paymentsResponse.success && paymentsResponse.data) {
        setRecentPayments((paymentsResponse.data as { payments: any[] }).payments);
      }

      if (membersResponse.members) {
        setMembers(membersResponse.members);
      }
    } catch (err: any) {
      console.error("❌ Financial data fetch error:", err);

      const debugData = {
        error: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data,
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers,
        timestamp: new Date().toISOString(),
      };

      setDebugInfo(debugData);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load financial data"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "TITHE":
        return "bg-green-100 text-green-800";
      case "OFFERING":
        return "bg-blue-100 text-blue-800";
      case "DUES":
        return "bg-purple-100 text-purple-800";
      case "SPECIAL_OFFERING":
        return "bg-orange-100 text-orange-800";
      case "EVENT_FEE":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
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
                      {debugInfo.responseData && (
                        <div>
                          <strong>Response Data:</strong>
                          <pre className="mt-1 p-2 bg-white border rounded overflow-auto max-h-40">
                            {JSON.stringify(debugInfo.responseData, null, 2)}
                          </pre>
                        </div>
                      )}
                      {debugInfo.headers && (
                        <div>
                          <strong>Headers:</strong>
                          <pre className="mt-1 p-2 bg-white border rounded overflow-auto max-h-40">
                            {JSON.stringify(debugInfo.headers, null, 2)}
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

        <div className="text-sm text-gray-600">
          <p>
            <strong>Common solutions:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>
              Make sure you&apos;re logged in as an admin user
              (john.smith@email.com)
            </li>
            <li>Check that the backend server is running on port 3001</li>
            <li>Verify your authentication token is valid</li>
            <li>Check the browser console for additional error details</li>
          </ul>
        </div>
      </div>
    );
  }

  if (showPaymentForm) {
    return (
      <PaymentForm
        members={members}
        onSuccess={() => {
          setShowPaymentForm(false);
          fetchData();
        }}
        onCancel={() => setShowPaymentForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-gray-600">
            Manage church finances and track payments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowPaymentForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.payments.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.payments.totalPayments} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              {stats.transactions.netIncome >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.transactions.netIncome)}
              </div>
              <p className="text-xs text-muted-foreground">Income - Expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.transactions.income)}
              </div>
              <p className="text-xs text-muted-foreground">
                All income sources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.transactions.expenses)}
              </div>
              <p className="text-xs text-muted-foreground">All expenses</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Latest payments received from members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No payments found
                </p>
              ) : (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <DollarSign className="w-8 h-8 text-green-600 bg-green-100 rounded-full p-1" />
                        <div>
                          <p className="font-semibold">
                            {payment.member.firstName} {payment.member.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.description ||
                              `${payment.type.toLowerCase()} payment`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.paymentDate).toLocaleDateString()}{" "}
                            • {payment.method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatCurrency(payment.amount)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPaymentTypeColor(payment.type)}>
                            {payment.type}
                          </Badge>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionManager onTransactionUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <BudgetManager onBudgetUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Type Breakdown</CardTitle>
              <CardDescription>
                Revenue breakdown by payment type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.payments.byType && stats.payments.byType.length > 0 ? (
                <div className="space-y-4">
                  {stats.payments.byType.map((typeData) => (
                    <div
                      key={typeData.type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <PieChart className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{typeData.type}</p>
                          <p className="text-sm text-gray-600">
                            {typeData.count} payments • Avg:{" "}
                            {formatCurrency(typeData.averageAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(typeData.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {stats.payments.totalRevenue > 0
                            ? Math.round(
                                (typeData.totalAmount /
                                  stats.payments.totalRevenue) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No payment data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsManager onReportGenerated={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
