import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Edit2, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import VocabularyTable from "@/components/admin/VocabularyTable";
import BulkUploadDialog from "@/components/admin/BulkUploadDialog";
import EditVocabularyDialog from "@/components/admin/EditVocabularyDialog";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("manage");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<any>(null);

  // Redirect if not admin
  if (!loading && user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="gradient-text text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage vocabularies and content</p>
            </div>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manage">Manage Vocabularies</TabsTrigger>
            <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Manage Vocabularies Tab */}
          <TabsContent value="manage" className="space-y-4">
            <div className="flex justify-between gap-4">
              <h2 className="text-2xl font-bold">Vocabulary Management</h2>
              <Button
              onClick={() => {
                setSelectedVocab(null as any);
                setShowEditDialog(true);
              }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Vocabulary
              </Button>
            </div>
            <VocabularyTable
              onEdit={(vocab: any) => {
                setSelectedVocab(vocab);
                setShowEditDialog(true);
              }}
            />
          </TabsContent>

          {/* Bulk Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div className="card-elegant">
              <h2 className="mb-4 text-2xl font-bold">Bulk Upload Vocabularies</h2>
              <p className="mb-6 text-muted-foreground">
                Upload a CSV file with the following columns: word, ipa, exampleSentence, difficulty (optional)
              </p>
              <Button
                onClick={() => setShowBulkUpload(true)}
                size="lg"
                className="gap-2"
              >
                <Upload className="h-5 w-5" />
                Choose CSV File
              </Button>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="card-elegant text-center">
                <p className="mb-2 text-sm text-muted-foreground">Total Vocabularies</p>
                <p className="text-4xl font-bold text-primary">-</p>
              </div>
              <div className="card-elegant text-center">
                <p className="mb-2 text-sm text-muted-foreground">Beginner Level</p>
                <p className="text-4xl font-bold text-secondary">-</p>
              </div>
              <div className="card-elegant text-center">
                <p className="mb-2 text-sm text-muted-foreground">Advanced Level</p>
                <p className="text-4xl font-bold text-accent">-</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {showBulkUpload && (
        <BulkUploadDialog
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            setShowBulkUpload(false);
            setActiveTab("manage");
            toast.success("Vocabularies uploaded successfully!");
          }}
        />
      )}

      {showEditDialog && (
        <EditVocabularyDialog
          vocabulary={selectedVocab}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedVocab(null);
          }}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedVocab(null);
            toast.success("Vocabulary saved successfully!");
          }}
        />
      )}
    </div>
  );
}
