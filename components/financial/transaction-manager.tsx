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
  Receipt,
  Plus,
  Eye,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TransactionForm } from "./transaction-form";
import apiClient from "@/lib/api";

interface Transaction {
  _id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  transactionDate: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  vendor?: {
    name?: string;
    contact?: string;
  };
  referenceNumber?: string;
  tags?: string[];
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface TransactionManagerProps {
  onTransactionUpdate?: () => void;
}

export function TransactionManager({
  onTransactionUpdate,
}: TransactionManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (typeFilter !== "all") {
        params.type = typeFilter;
      }

      const response = await apiClient.getTransactions(params);

      setTransactions(response.transactions);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err: any) {
      console.error("❌ Transaction fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      await apiClient.put(
        `/api/financial/transactions/${transactionId}/approve`
      );
      await fetchTransactions();
      onTransactionUpdate?.();
    } catch (err: any) {
      console.error("❌ Approve transaction error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve transaction"
      );
    }
  };

  const handleRejectTransaction = async (
    transactionId: string,
    reason?: string
  ) => {
    try {
      await apiClient.put(
        `/api/financial/transactions/${transactionId}/reject`,
        {
          reason: reason || "Transaction rejected by administrator",
        }
      );
      await fetchTransactions();
      onTransactionUpdate?.();
    } catch (err: any) {
      console.error("❌ Reject transaction error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reject transaction"
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

  const getTypeColor = (type: string) => {
    return type === "INCOME" ? "text-green-600" : "text-red-600";
  };

  if (showTransactionForm) {
    return (
      <TransactionForm
        onSuccess={() => {
          setShowTransactionForm(false);
          fetchTransactions();
          onTransactionUpdate?.();
        }}
        onCancel={() => setShowTransactionForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transaction Management</h2>
          <p className="text-gray-600">
            Manage income and expense transactions
          </p>
        </div>
        <Button onClick={() => setShowTransactionForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex space-x-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Review and approve financial transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first transaction to get started.
              </p>
              <Button onClick={() => setShowTransactionForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Transaction
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        {new Date(
                          transaction.transactionDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center ${getTypeColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.type === "INCOME" ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          {transaction.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {transaction.category}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-xs truncate"
                          title={transaction.description}
                        >
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            transaction.type === "INCOME"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.type === "EXPENSE" && "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(transaction.approvalStatus)}
                        >
                          {transaction.approvalStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSelectedTransaction(transaction)
                                }
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                                <DialogDescription>
                                  Full details of the transaction
                                </DialogDescription>
                              </DialogHeader>
                              {selectedTransaction && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Type
                                      </label>
                                      <p
                                        className={`font-medium ${getTypeColor(
                                          selectedTransaction.type
                                        )}`}
                                      >
                                        {selectedTransaction.type}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Amount
                                      </label>
                                      <p className="font-medium">
                                        {formatCurrency(
                                          selectedTransaction.amount
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Category
                                      </label>
                                      <p>{selectedTransaction.category}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Payment Method
                                      </label>
                                      <p>{selectedTransaction.paymentMethod}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Date
                                      </label>
                                      <p>
                                        {new Date(
                                          selectedTransaction.transactionDate
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Status
                                      </label>
                                      <Badge
                                        className={getStatusColor(
                                          selectedTransaction.approvalStatus
                                        )}
                                      >
                                        {selectedTransaction.approvalStatus}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">
                                      Description
                                    </label>
                                    <p>{selectedTransaction.description}</p>
                                  </div>
                                  {selectedTransaction.vendor?.name && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Vendor
                                      </label>
                                      <p>{selectedTransaction.vendor.name}</p>
                                      {selectedTransaction.vendor.contact && (
                                        <p className="text-sm text-gray-600">
                                          {selectedTransaction.vendor.contact}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {selectedTransaction.referenceNumber && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Reference Number
                                      </label>
                                      <p>
                                        {selectedTransaction.referenceNumber}
                                      </p>
                                    </div>
                                  )}
                                  {selectedTransaction.tags &&
                                    selectedTransaction.tags.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">
                                          Tags
                                        </label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {selectedTransaction.tags.map(
                                            (tag, index) => (
                                              <Badge
                                                key={index}
                                                variant="outline"
                                              >
                                                {tag}
                                              </Badge>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">
                                      Created By
                                    </label>
                                    <p>
                                      {selectedTransaction.createdBy.firstName}{" "}
                                      {selectedTransaction.createdBy.lastName}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {transaction.approvalStatus === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() =>
                                  handleApproveTransaction(transaction._id)
                                }
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  handleRejectTransaction(transaction._id)
                                }
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
