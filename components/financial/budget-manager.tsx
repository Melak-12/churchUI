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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calculator,
  Plus,
  Eye,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Loader2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { BudgetForm } from "./budget-form";
import apiClient from "@/lib/api";

interface Budget {
  _id: string;
  name: string;
  description?: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  totalBudgetedIncome: number;
  totalBudgetedExpenses: number;
  totalActualIncome: number;
  totalActualExpenses: number;
  categories: Array<{
    category: {
      _id: string;
      name: string;
      type: "INCOME" | "EXPENSE";
      color?: string;
    };
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    notes?: string;
  }>;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface BudgetManagerProps {
  onBudgetUpdate?: () => void;
}

export function BudgetManager({ onBudgetUpdate }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchBudgets();
    fetchCurrentBudget();
  }, [statusFilter]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      let url = "/api/financial/budgets";
      if (statusFilter !== "all") {
        url += `?status=${statusFilter}`;
      }

      const response = await apiClient.get<{ budgets: Budget[] }>(url);

      if (response.success) {
        setBudgets(response.data?.budgets || []);
      }
    } catch (err: any) {
      console.error("❌ Budget fetch error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load budgets"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentBudget = async () => {
    try {
      const response = await apiClient.get<{ budget: Budget }>(
        "/api/financial/budgets/current"
      );
      if (response.success && response.data?.budget) {
        setCurrentBudget(response.data.budget);
      }
    } catch (err: any) {
      console.error("❌ Current budget fetch error:", err);
      // Don't set error here as it's not critical
    }
  };

  const handleApproveBudget = async (budgetId: string) => {
    try {
      await apiClient.put(`/api/financial/budgets/${budgetId}/approve`);
      await fetchBudgets();
      await fetchCurrentBudget();
      onBudgetUpdate?.();
    } catch (err: any) {
      console.error("❌ Approve budget error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to approve budget"
      );
    }
  };

  const handleRejectBudget = async (budgetId: string) => {
    try {
      await apiClient.put(`/api/financial/budgets/${budgetId}/reject`);
      await fetchBudgets();
      onBudgetUpdate?.();
    } catch (err: any) {
      console.error("❌ Reject budget error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to reject budget"
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "CLOSED":
        return "bg-blue-100 text-blue-800";
      case "ARCHIVED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600";
    if (variance < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (showBudgetForm) {
    return (
      <BudgetForm
        onSuccess={() => {
          setShowBudgetForm(false);
          fetchBudgets();
          fetchCurrentBudget();
          onBudgetUpdate?.();
        }}
        onCancel={() => setShowBudgetForm(false)}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold'>Budget Management</h2>
          <p className='text-gray-600'>
            Manage annual budgets and track performance
          </p>
        </div>
        <Button onClick={() => setShowBudgetForm(true)}>
          <Plus className='w-4 h-4 mr-2' />
          New Budget
        </Button>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Budget Overview */}
      {currentBudget && (
        <Card className='border-2 border-blue-200'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='w-5 h-5 text-blue-600' />
                  Current Active Budget
                </CardTitle>
                <CardDescription>{currentBudget.name}</CardDescription>
              </div>
              <Badge className={getStatusColor(currentBudget.status)}>
                {currentBudget.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <TrendingUp className='w-5 h-5 text-green-600 mr-1' />
                  <span className='text-sm text-gray-600'>Budgeted Income</span>
                </div>
                <p className='text-xl font-semibold text-green-600'>
                  {formatCurrency(currentBudget.totalBudgetedIncome)}
                </p>
                <p className='text-xs text-gray-500'>
                  Actual: {formatCurrency(currentBudget.totalActualIncome)}
                </p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <TrendingDown className='w-5 h-5 text-red-600 mr-1' />
                  <span className='text-sm text-gray-600'>
                    Budgeted Expenses
                  </span>
                </div>
                <p className='text-xl font-semibold text-red-600'>
                  {formatCurrency(currentBudget.totalBudgetedExpenses)}
                </p>
                <p className='text-xs text-gray-500'>
                  Actual: {formatCurrency(currentBudget.totalActualExpenses)}
                </p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <DollarSign className='w-5 h-5 text-blue-600 mr-1' />
                  <span className='text-sm text-gray-600'>Budgeted Net</span>
                </div>
                <p
                  className={`text-xl font-semibold ${
                    currentBudget.totalBudgetedIncome -
                      currentBudget.totalBudgetedExpenses >=
                    0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    currentBudget.totalBudgetedIncome -
                      currentBudget.totalBudgetedExpenses
                  )}
                </p>
                <p className='text-xs text-gray-500'>
                  Actual:{" "}
                  {formatCurrency(
                    currentBudget.totalActualIncome -
                      currentBudget.totalActualExpenses
                  )}
                </p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Calculator className='w-5 h-5 text-purple-600 mr-1' />
                  <span className='text-sm text-gray-600'>Fiscal Year</span>
                </div>
                <p className='text-xl font-semibold text-purple-600'>
                  {currentBudget.fiscalYear}
                </p>
                <p className='text-xs text-gray-500'>
                  {new Date(currentBudget.startDate).toLocaleDateString()} -{" "}
                  {new Date(currentBudget.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className='flex space-x-4'>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='DRAFT'>Draft</SelectItem>
            <SelectItem value='ACTIVE'>Active</SelectItem>
            <SelectItem value='CLOSED'>Closed</SelectItem>
            <SelectItem value='ARCHIVED'>Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Budgets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Budgets</CardTitle>
          <CardDescription>Review and manage all budgets</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center h-32'>
              <Loader2 className='w-8 h-8 animate-spin' />
            </div>
          ) : budgets.length === 0 ? (
            <div className='text-center py-8'>
              <Calculator className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No budgets found
              </h3>
              <p className='text-gray-600 mb-4'>
                Create your first budget to get started.
              </p>
              <Button onClick={() => setShowBudgetForm(true)}>
                <Plus className='w-4 h-4 mr-2' />
                Create Budget
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Fiscal Year</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Net Budget</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => (
                  <TableRow key={budget._id}>
                    <TableCell>
                      <div>
                        <div className='font-medium'>{budget.name}</div>
                        {budget.description && (
                          <div className='text-sm text-gray-500 truncate max-w-xs'>
                            {budget.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{budget.fiscalYear}</TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div>
                          {new Date(budget.startDate).toLocaleDateString()}
                        </div>
                        <div className='text-gray-500'>
                          to {new Date(budget.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(budget.status)}>
                        {budget.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getApprovalStatusColor(
                          budget.approvalStatus
                        )}
                      >
                        {budget.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={getVarianceColor(
                          budget.totalBudgetedIncome -
                            budget.totalBudgetedExpenses
                        )}
                      >
                        {formatCurrency(
                          budget.totalBudgetedIncome -
                            budget.totalBudgetedExpenses
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => setSelectedBudget(budget)}
                            >
                              <Eye className='w-4 h-4' />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                            <DialogHeader>
                              <DialogTitle>
                                Budget Details: {selectedBudget?.name}
                              </DialogTitle>
                              <DialogDescription>
                                Detailed view of budget categories and
                                performance
                              </DialogDescription>
                            </DialogHeader>
                            {selectedBudget && (
                              <div className='space-y-6'>
                                {/* Budget Summary */}
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                  <div className='text-center'>
                                    <p className='text-sm text-gray-500'>
                                      Total Income
                                    </p>
                                    <p className='text-lg font-semibold text-green-600'>
                                      {formatCurrency(
                                        selectedBudget.totalBudgetedIncome
                                      )}
                                    </p>
                                  </div>
                                  <div className='text-center'>
                                    <p className='text-sm text-gray-500'>
                                      Total Expenses
                                    </p>
                                    <p className='text-lg font-semibold text-red-600'>
                                      {formatCurrency(
                                        selectedBudget.totalBudgetedExpenses
                                      )}
                                    </p>
                                  </div>
                                  <div className='text-center'>
                                    <p className='text-sm text-gray-500'>
                                      Net Budget
                                    </p>
                                    <p
                                      className={`text-lg font-semibold ${
                                        selectedBudget.totalBudgetedIncome -
                                          selectedBudget.totalBudgetedExpenses >=
                                        0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {formatCurrency(
                                        selectedBudget.totalBudgetedIncome -
                                          selectedBudget.totalBudgetedExpenses
                                      )}
                                    </p>
                                  </div>
                                  <div className='text-center'>
                                    <p className='text-sm text-gray-500'>
                                      Actual Net
                                    </p>
                                    <p
                                      className={`text-lg font-semibold ${
                                        selectedBudget.totalActualIncome -
                                          selectedBudget.totalActualExpenses >=
                                        0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {formatCurrency(
                                        selectedBudget.totalActualIncome -
                                          selectedBudget.totalActualExpenses
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Category Details */}
                                <div>
                                  <h4 className='text-lg font-medium mb-3'>
                                    Budget Categories
                                  </h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Budgeted</TableHead>
                                        <TableHead>Actual</TableHead>
                                        <TableHead>Variance</TableHead>
                                        <TableHead>Notes</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedBudget.categories.map(
                                        (categoryBudget, index) => (
                                          <TableRow key={index}>
                                            <TableCell>
                                              <div className='flex items-center space-x-2'>
                                                <span
                                                  className={`w-3 h-3 rounded-full ${
                                                    categoryBudget.category
                                                      .type === "INCOME"
                                                      ? "bg-green-500"
                                                      : "bg-red-500"
                                                  }`}
                                                ></span>
                                                <span>
                                                  {categoryBudget.category.name}
                                                </span>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <Badge
                                                className={
                                                  categoryBudget.category
                                                    .type === "INCOME"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }
                                              >
                                                {categoryBudget.category.type}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              {formatCurrency(
                                                categoryBudget.budgetedAmount
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {formatCurrency(
                                                categoryBudget.actualAmount
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <span
                                                className={getVarianceColor(
                                                  categoryBudget.variance
                                                )}
                                              >
                                                {formatCurrency(
                                                  categoryBudget.variance
                                                )}
                                              </span>
                                            </TableCell>
                                            <TableCell>
                                              <span className='text-sm text-gray-600'>
                                                {categoryBudget.notes || "-"}
                                              </span>
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {budget.approvalStatus === "PENDING" && (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-green-600 hover:text-green-700'
                              onClick={() => handleApproveBudget(budget._id)}
                            >
                              <Check className='w-4 h-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-red-600 hover:text-red-700'
                              onClick={() => handleRejectBudget(budget._id)}
                            >
                              <X className='w-4 h-4' />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
