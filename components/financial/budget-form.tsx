"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Loader2,
  PlusCircle,
  Trash2,
  Calculator,
  CheckCircle,
} from "lucide-react";
import apiClient from "@/lib/api";

const budgetCategorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  budgetedAmount: z.number().min(0, "Amount must be non-negative"),
  notes: z.string().optional(),
});

const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  description: z.string().optional(),
  fiscalYear: z.number().min(2000).max(2100),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  categories: z
    .array(budgetCategorySchema)
    .min(1, "At least one category is required"),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetCategory {
  _id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color?: string;
}

interface BudgetFormProps {
  onSuccess?: (budget: any) => void;
  onCancel?: () => void;
}

export function BudgetForm({ onSuccess, onCancel }: BudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(
    []
  );

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      fiscalYear: new Date().getFullYear(),
      startDate: `${new Date().getFullYear()}-01-01`,
      endDate: `${new Date().getFullYear()}-12-31`,
      categories: [
        {
          categoryId: "",
          budgetedAmount: 0,
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categories",
  });

  useEffect(() => {
    fetchBudgetCategories();
  }, []);

  const fetchBudgetCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await apiClient.get("/api/financial/budget-categories");
      if (response.data?.success) {
        setBudgetCategories(response.data.data.categories || []);
      }
    } catch (err: any) {
      console.error("❌ Budget categories fetch error:", err);
      setError(
        "Failed to load budget categories. Please refresh and try again."
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  const onSubmit = async (data: BudgetFormData) => {
    try {
      setIsLoading(true);
      setError("");

      const budgetData = {
        name: data.name,
        description: data.description,
        fiscalYear: data.fiscalYear,
        startDate: data.startDate,
        endDate: data.endDate,
        categories: data.categories,
      };

      const response = await apiClient.post(
        "/api/financial/budgets",
        budgetData
      );

      if (response.data?.success) {
        setSuccess(true);
        form.reset();
        onSuccess?.(response.data.data.budget);
      } else {
        setError(response.data?.message || "Failed to create budget");
      }
    } catch (err: any) {
      console.error("❌ Budget creation error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to create budget"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalBudgetedAmount = () => {
    return form.watch("categories").reduce((total, category) => {
      return total + (category.budgetedAmount || 0);
    }, 0);
  };

  const getIncomeTotal = () => {
    return form.watch("categories").reduce((total, category) => {
      const budgetCategory = budgetCategories.find(
        (bc) => bc._id === category.categoryId
      );
      if (budgetCategory?.type === "INCOME") {
        return total + (category.budgetedAmount || 0);
      }
      return total;
    }, 0);
  };

  const getExpenseTotal = () => {
    return form.watch("categories").reduce((total, category) => {
      const budgetCategory = budgetCategories.find(
        (bc) => bc._id === category.categoryId
      );
      if (budgetCategory?.type === "EXPENSE") {
        return total + (category.budgetedAmount || 0);
      }
      return total;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Budget Created Successfully
            </h3>
            <p className="text-gray-600 mb-4">
              The budget has been created and is ready for approval.
            </p>
            <div className="space-x-2">
              <Button onClick={() => setSuccess(false)}>
                Create Another Budget
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
          <Calculator className="w-5 h-5" />
          Create Budget
        </CardTitle>
        <CardDescription>
          Create a new annual budget with income and expense categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 2024 Annual Budget"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fiscalYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiscal Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2000"
                        max="2100"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseInt(e.target.value) || new Date().getFullYear()
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the budget"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Budget Categories</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      categoryId: "",
                      budgetedAmount: 0,
                      notes: "",
                    })
                  }
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>

              {categoriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading categories...
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const selectedCategory = budgetCategories.find(
                      (bc) =>
                        bc._id === form.watch(`categories.${index}.categoryId`)
                    );

                    return (
                      <div
                        key={field.id}
                        className="flex items-end space-x-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`categories.${index}.categoryId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {budgetCategories.map((category) => (
                                      <SelectItem
                                        key={category._id}
                                        value={category._id}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <span
                                            className={`w-3 h-3 rounded-full ${
                                              category.type === "INCOME"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                            }`}
                                          ></span>
                                          <span>
                                            {category.name} ({category.type})
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`categories.${index}.budgetedAmount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Amount ($)
                                  {selectedCategory && (
                                    <span
                                      className={`ml-2 text-xs px-2 py-1 rounded ${
                                        selectedCategory.type === "INCOME"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {selectedCategory.type}
                                    </span>
                                  )}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`categories.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Budget notes"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Budget Summary */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Budget Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Income</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(getIncomeTotal())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(getExpenseTotal())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Budget</p>
                    <p
                      className={`text-lg font-semibold ${
                        getIncomeTotal() - getExpenseTotal() >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(getIncomeTotal() - getExpenseTotal())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(getTotalBudgetedAmount())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading || categoriesLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Budget
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

