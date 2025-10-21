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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Search,
  Filter,
  Upload,
  Calendar,
  User,
  Eye,
  Folder,
  File,
  Image,
  FileSpreadsheet,
  Presentation,
  Loader2,
  AlertCircle,
} from "lucide-react";
import apiClient from "@/lib/api";

interface Document {
  _id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  visibility: string;
  tags: string[];
  version: number;
  downloadCount: number;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
  approvalStatus: string;
  createdAt: string;
  expiryDate?: string;
}

interface DocumentCategory {
  _id: string;
  count: number;
  totalSize: number;
}

export function DocumentLibrary() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "50");

      const response = await apiClient.get<{ documents: any[] }>(
        `/api/member-portal/documents?${params}`
      );

      if (response.success && response.data) {
        setDocuments((response.data as { documents: any[] }).documents);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get<{ categories: DocumentCategory[] }>(
        "/api/member-portal/documents/categories"
      );

      if (response.success && response.data) {
        setCategories(
          (response.data as { categories: DocumentCategory[] }).categories
        );
      }
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      // Use fetch directly for blob downloads since apiClient.get doesn't support responseType
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/member-portal/documents/${documentId}/download`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();

      // Create blob link to download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Refresh documents to update download count
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to download document");
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className='w-5 h-5' />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return <FileSpreadsheet className='w-5 h-5' />;
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return <Presentation className='w-5 h-5' />;
    if (mimeType === "application/pdf")
      return <FileText className='w-5 h-5 text-red-500' />;
    return <File className='w-5 h-5' />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "POLICY":
        return "bg-blue-100 text-blue-800";
      case "FORM":
        return "bg-green-100 text-green-800";
      case "BULLETIN":
        return "bg-purple-100 text-purple-800";
      case "NEWSLETTER":
        return "bg-yellow-100 text-yellow-800";
      case "FINANCIAL":
        return "bg-red-100 text-red-800";
      case "LEGAL":
        return "bg-gray-100 text-gray-800";
      case "MINISTRY":
        return "bg-indigo-100 text-indigo-800";
      case "EVENT":
        return "bg-pink-100 text-pink-800";
      case "PERSONAL":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return "🌍";
      case "MEMBERS_ONLY":
        return "👥";
      case "ADMIN_ONLY":
        return "🔒";
      case "PRIVATE":
        return "🔐";
      default:
        return "📄";
    }
  };

  const isExpired = (expiryDate?: string) => {
    return expiryDate ? new Date(expiryDate) < new Date() : false;
  };

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Document Library</h1>
          <p className='text-gray-600'>Access church documents and resources</p>
        </div>
        <Button
          onClick={() => setShowUploadDialog(true)}
          className='w-full sm:w-auto'
        >
          <Upload className='w-4 h-4 mr-2' />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search documents...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className='w-full md:w-48'>
                <SelectValue placeholder='All Categories' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                <SelectItem value='POLICY'>Policy</SelectItem>
                <SelectItem value='FORM'>Forms</SelectItem>
                <SelectItem value='BULLETIN'>Bulletins</SelectItem>
                <SelectItem value='NEWSLETTER'>Newsletters</SelectItem>
                <SelectItem value='FINANCIAL'>Financial</SelectItem>
                <SelectItem value='LEGAL'>Legal</SelectItem>
                <SelectItem value='MINISTRY'>Ministry</SelectItem>
                <SelectItem value='EVENT'>Events</SelectItem>
                <SelectItem value='PERSONAL'>Personal</SelectItem>
                <SelectItem value='OTHER'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='documents' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='documents'>All Documents</TabsTrigger>
          <TabsTrigger value='categories'>By Category</TabsTrigger>
          <TabsTrigger value='my-documents'>My Documents</TabsTrigger>
        </TabsList>

        <TabsContent value='documents' className='space-y-4'>
          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <Loader2 className='w-8 h-8 animate-spin' />
            </div>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className='pt-6'>
                <div className='text-center py-8'>
                  <FileText className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    No Documents Found
                  </h3>
                  <p className='text-gray-600'>
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search or filters."
                      : "No documents are available at this time."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-4'>
              {documents.map((document) => (
                <Card
                  key={document._id}
                  className={
                    isExpired(document.expiryDate) ? "border-red-200" : ""
                  }
                >
                  <CardContent className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start space-x-4 flex-1'>
                        <div className='flex-shrink-0 mt-1'>
                          {getFileIcon(document.mimeType)}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <h3 className='font-semibold text-lg mb-1 flex items-center gap-2'>
                                {document.title}
                                {isExpired(document.expiryDate) && (
                                  <Badge
                                    variant='destructive'
                                    className='text-xs'
                                  >
                                    Expired
                                  </Badge>
                                )}
                              </h3>
                              {document.description && (
                                <p className='text-gray-600 mb-2'>
                                  {document.description}
                                </p>
                              )}
                              <div className='flex flex-wrap items-center gap-2 mb-2'>
                                <Badge
                                  className={getCategoryColor(
                                    document.category
                                  )}
                                >
                                  {document.category}
                                </Badge>
                                {document.subcategory && (
                                  <Badge variant='outline'>
                                    {document.subcategory}
                                  </Badge>
                                )}
                                <span className='text-sm text-gray-500'>
                                  {getVisibilityIcon(document.visibility)}{" "}
                                  {document.visibility}
                                </span>
                                {document.version > 1 && (
                                  <Badge variant='outline'>
                                    v{document.version}
                                  </Badge>
                                )}
                              </div>
                              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
                                <div className='flex items-center gap-1'>
                                  <User className='w-3 h-3' />
                                  {document.uploadedBy.firstName}{" "}
                                  {document.uploadedBy.lastName}
                                </div>
                                <div className='flex items-center gap-1'>
                                  <Calendar className='w-3 h-3' />
                                  {new Date(
                                    document.createdAt
                                  ).toLocaleDateString()}
                                </div>
                                <span>{formatFileSize(document.fileSize)}</span>
                                <div className='flex items-center gap-1'>
                                  <Download className='w-3 h-3' />
                                  {document.downloadCount} downloads
                                </div>
                              </div>
                              {document.tags.length > 0 && (
                                <div className='mt-2 flex flex-wrap gap-1'>
                                  {document.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-col gap-2 ml-4'>
                        <Button
                          size='sm'
                          onClick={() =>
                            handleDownload(
                              document._id,
                              document.originalFileName
                            )
                          }
                          disabled={isExpired(document.expiryDate)}
                        >
                          <Download className='w-4 h-4 mr-2' />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='categories' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {categories.map((category) => (
              <Card
                key={category._id}
                className='cursor-pointer hover:shadow-md transition-shadow'
              >
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Folder className='w-5 h-5' />
                      {category._id}
                    </div>
                    <Badge>{category.count}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {formatFileSize(category.totalSize)} total
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='my-documents' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>My Uploaded Documents</CardTitle>
              <CardDescription>
                Documents you have uploaded to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-center text-gray-500 py-8'>
                This feature will show documents you&apos;ve uploaded
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the church library
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Document upload functionality will be implemented here.
            </p>
            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowUploadDialog(false)}>Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
