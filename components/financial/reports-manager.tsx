"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Download,
  FileText,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2,
  CheckCircle,
} from "lucide-react";
import apiClient from "@/lib/api";

interface ReportsManagerProps {
  onReportGenerated?: () => void;
}

interface ReportConfig {
  startDate: string;
  endDate: string;
  format: "PDF" | "CSV" | "EXCEL";
  includeCharts: boolean;
}

export function ReportsManager({ onReportGenerated }: ReportsManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    format: "PDF",
    includeCharts: true,
  });

  const generateReport = async (
    reportType: string,
    customConfig?: Partial<ReportConfig>
  ) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const config = { ...reportConfig, ...customConfig };

      let data: any = {};
      let filename = "";
      let title = "";

      switch (reportType) {
        case "payment-report":
          title = "Payment Report";
          filename = `payment-report-${config.startDate}-to-${config.endDate}`;

          // Get payments data
          const paymentsResponse = await apiClient.getPayments({
            startDate: config.startDate,
            endDate: config.endDate,
            limit: 1000,
          });

          // Get payment stats
          const statsResponse = await apiClient.getPaymentStats(
            config.startDate,
            config.endDate
          );

          data = {
            title,
            period: `${config.startDate} to ${config.endDate}`,
            payments: paymentsResponse.payments || [],
            stats: statsResponse,
            summary: {
              totalPayments: paymentsResponse.payments?.length || 0,
              totalRevenue: statsResponse?.totalRevenue || 0,
              byType: statsResponse?.byType || [],
            },
          };
          break;

        case "financial-summary":
          title = "Financial Summary";
          filename = `financial-summary-${config.startDate}-to-${config.endDate}`;

          const summaryResponse = await apiClient.getFinancialSummary(
            config.startDate,
            config.endDate
          );

          data = {
            title,
            period: `${config.startDate} to ${config.endDate}`,
            transactions: summaryResponse.transactions || {},
            payments: summaryResponse.payments || {},
            netIncome:
              (summaryResponse.transactions?.income || 0) -
              (summaryResponse.transactions?.expenses || 0),
            totalRevenue: summaryResponse.payments?.totalRevenue || 0,
          };
          break;

        case "member-contributions":
          title = "Member Contributions Report";
          filename = `member-contributions-${config.startDate}-to-${config.endDate}`;

          // Get all members
          const membersResponse = await apiClient.getMembers({ limit: 1000 });

          // Get payments for each member
          const memberPayments = await Promise.all(
            (membersResponse.members || []).map(async (member) => {
              try {
                const memberPaymentsResponse = await apiClient.getPayments({
                  memberId: member.id,
                  startDate: config.startDate,
                  endDate: config.endDate,
                  limit: 1000,
                });

                const totalContributions = (
                  memberPaymentsResponse.payments || []
                ).reduce((sum, payment) => sum + payment.amount, 0);

                return {
                  member,
                  contributions: memberPaymentsResponse.payments || [],
                  totalContributions,
                  paymentCount: memberPaymentsResponse.payments?.length || 0,
                };
              } catch (err) {
                return {
                  member,
                  contributions: [],
                  totalContributions: 0,
                  paymentCount: 0,
                };
              }
            })
          );

          data = {
            title,
            period: `${config.startDate} to ${config.endDate}`,
            memberPayments: memberPayments.filter(
              (mp) => mp.totalContributions > 0
            ),
            summary: {
              totalMembers: memberPayments.length,
              contributingMembers: memberPayments.filter(
                (mp) => mp.totalContributions > 0
              ).length,
              totalContributions: memberPayments.reduce(
                (sum, mp) => sum + mp.totalContributions,
                0
              ),
              averageContribution:
                memberPayments.length > 0
                  ? memberPayments.reduce(
                      (sum, mp) => sum + mp.totalContributions,
                      0
                    ) / memberPayments.length
                  : 0,
            },
          };
          break;

        case "monthly-report":
          title = "Monthly Report";
          const monthStart = new Date(config.startDate);
          const monthEnd = new Date(
            monthStart.getFullYear(),
            monthStart.getMonth() + 1,
            0
          );
          filename = `monthly-report-${monthStart.getFullYear()}-${String(
            monthStart.getMonth() + 1
          ).padStart(2, "0")}`;

          const monthlyFinancial = await apiClient.getFinancialSummary(
            monthStart.toISOString().split("T")[0],
            monthEnd.toISOString().split("T")[0]
          );

          const monthlyPayments = await apiClient.getPayments({
            startDate: monthStart.toISOString().split("T")[0],
            endDate: monthEnd.toISOString().split("T")[0],
            limit: 1000,
          });

          const monthlyTransactions = await apiClient.getTransactions({
            startDate: monthStart.toISOString().split("T")[0],
            endDate: monthEnd.toISOString().split("T")[0],
            limit: 1000,
          });

          data = {
            title,
            period: `${monthStart.toLocaleDateString()} to ${monthEnd.toLocaleDateString()}`,
            financial: monthlyFinancial,
            payments: monthlyPayments.payments || [],
            transactions: monthlyTransactions.transactions || [],
            summary: {
              totalIncome: monthlyFinancial.transactions?.income || 0,
              totalExpenses: monthlyFinancial.transactions?.expenses || 0,
              netIncome:
                (monthlyFinancial.transactions?.income || 0) -
                (monthlyFinancial.transactions?.expenses || 0),
              totalRevenue: monthlyFinancial.payments?.totalRevenue || 0,
              paymentCount: monthlyPayments.payments?.length || 0,
              transactionCount: monthlyTransactions.transactions?.length || 0,
            },
          };
          break;

        default:
          throw new Error("Invalid report type");
      }

      // Generate the report based on format
      await downloadReport(data, filename, config.format);

      setSuccess(`${title} has been generated and downloaded successfully.`);
      onReportGenerated?.();
    } catch (err: any) {
      console.error("❌ Report generation error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to generate report"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (
    data: any,
    filename: string,
    format: string
  ) => {
    if (format === "CSV") {
      downloadCSV(data, filename);
    } else if (format === "EXCEL") {
      downloadExcel(data, filename);
    } else {
      downloadPDF(data, filename);
    }
  };

  const downloadCSV = (data: any, filename: string) => {
    let csv = "";

    // Add header
    csv += `${data.title}\n`;
    csv += `Period: ${data.period}\n\n`;

    if (data.payments) {
      csv += "Payments\n";
      csv += "Date,Member,Type,Amount,Method,Status\n";
      data.payments.forEach((payment: any) => {
        csv += `${payment.paymentDate},${payment.member?.firstName} ${payment.member?.lastName},${payment.type},${payment.amount},${payment.method},${payment.status}\n`;
      });
      csv += "\n";
    }

    if (data.transactions) {
      csv += "Transactions Summary\n";
      csv += `Total Income,${data.transactions.income || 0}\n`;
      csv += `Total Expenses,${data.transactions.expenses || 0}\n`;
      csv += `Net Income,${data.transactions.netIncome || 0}\n`;
      csv += "\n";
    }

    if (data.memberPayments) {
      csv += "Member Contributions\n";
      csv += "Member,Total Contributions,Payment Count\n";
      data.memberPayments.forEach((mp: any) => {
        csv += `${mp.member.firstName} ${mp.member.lastName},${mp.totalContributions},${mp.paymentCount}\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadExcel = (data: any, filename: string) => {
    // For now, we'll download as CSV with .xlsx extension
    // In a real implementation, you'd use a library like xlsx-js-style or exceljs
    downloadCSV(data, filename);
  };

  const downloadPDF = (data: any, filename: string) => {
    // Create a simple HTML report and convert to PDF
    // In a real implementation, you'd use a library like jsPDF or html2pdf
    let html = `
      <html>
        <head>
          <title>${data.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .positive { color: green; }
            .negative { color: red; }
          </style>
        </head>
        <body>
          <h1>${data.title}</h1>
          <p><strong>Period:</strong> ${data.period}</p>
    `;

    if (data.summary) {
      html += `
        <div class="summary">
          <h2>Summary</h2>
      `;
      Object.entries(data.summary).forEach(([key, value]: [string, any]) => {
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        const formattedValue =
          (typeof value === "number" && key.includes("total")) ||
          key.includes("revenue") ||
          key.includes("income") ||
          key.includes("contribution")
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(value)
            : value;
        html += `<p><strong>${formattedKey}:</strong> ${formattedValue}</p>`;
      });
      html += `</div>`;
    }

    if (data.payments && data.payments.length > 0) {
      html += `
        <h2>Payments</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Member</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      data.payments.forEach((payment: any) => {
        html += `
          <tr>
            <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
            <td>${payment.member?.firstName} ${payment.member?.lastName}</td>
            <td>${payment.type}</td>
            <td>${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(payment.amount)}</td>
            <td>${payment.method}</td>
            <td>${payment.status}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
    }

    if (data.memberPayments && data.memberPayments.length > 0) {
      html += `
        <h2>Member Contributions</h2>
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Total Contributions</th>
              <th>Payment Count</th>
            </tr>
          </thead>
          <tbody>
      `;
      data.memberPayments.forEach((mp: any) => {
        html += `
          <tr>
            <td>${mp.member.firstName} ${mp.member.lastName}</td>
            <td>${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(mp.totalContributions)}</td>
            <td>${mp.paymentCount}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
    }

    html += `</body></html>`;

    // Create a blob and download
    const blob = new Blob([html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `${filename}.html`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reportTypes = [
    {
      id: "payment-report",
      title: "Payment Report",
      description: "Detailed list of all payments received",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "financial-summary",
      title: "Financial Summary",
      description: "Overview of income, expenses, and net position",
      icon: BarChart3,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "member-contributions",
      title: "Member Contributions",
      description: "Individual member contribution analysis",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "monthly-report",
      title: "Monthly Report",
      description: "Comprehensive monthly financial overview",
      icon: Calendar,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <p className="text-gray-600">
          Generate and download comprehensive financial reports
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>
            Set the date range and format for your reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={reportConfig.startDate}
                onChange={(e) =>
                  setReportConfig((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={reportConfig.endDate}
                onChange={(e) =>
                  setReportConfig((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="format">Format</Label>
              <Select
                value={reportConfig.format}
                onValueChange={(value: "PDF" | "CSV" | "EXCEL") =>
                  setReportConfig((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="EXCEL">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                  );
                  const lastDay = new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0
                  );
                  setReportConfig((prev) => ({
                    ...prev,
                    startDate: firstDay.toISOString().split("T")[0],
                    endDate: lastDay.toISOString().split("T")[0],
                  }));
                }}
              >
                This Month
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((reportType) => {
          const Icon = reportType.icon;
          return (
            <Card
              key={reportType.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${reportType.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {reportType.title}
                </CardTitle>
                <CardDescription>{reportType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generateReport(reportType.id)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Generate common reports with preset configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() =>
                generateReport("financial-summary", {
                  startDate: new Date(new Date().getFullYear(), 0, 1)
                    .toISOString()
                    .split("T")[0],
                  endDate: new Date().toISOString().split("T")[0],
                })
              }
              disabled={loading}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Year-to-Date Summary
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                generateReport("monthly-report", {
                  startDate: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1
                  )
                    .toISOString()
                    .split("T")[0],
                  endDate: new Date().toISOString().split("T")[0],
                })
              }
              disabled={loading}
            >
              <Calendar className="w-4 h-4 mr-2" />
              This Month Report
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                generateReport("member-contributions", {
                  startDate: new Date(new Date().getFullYear(), 0, 1)
                    .toISOString()
                    .split("T")[0],
                  endDate: new Date().toISOString().split("T")[0],
                })
              }
              disabled={loading}
            >
              <Users className="w-4 h-4 mr-2" />
              Annual Contributions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

