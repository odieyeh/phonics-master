import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Loader2, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import VocabularyTable from "@/components/admin/VocabularyTable";
import BulkUploadDialog from "@/components/admin/BulkUploadDialog";
import EditVocabularyDialog from "@/components/admin/EditVocabularyDialog";
import UnitManagement from "@/components/admin/UnitManagement";
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-cute">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cute">
      {/* Header */}
      <div className="border-b border-primary/10 bg-white/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-[700] text-primary">
              Admin Panel
            </h1>
            <div className="flex items-center gap-2">
              <Button
                className="btn-cute-secondary gap-2 h-8 text-xs"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </Button>
              <Button
                className="btn-cute-primary gap-2 h-8 text-xs"
                onClick={() => setLocation("/")}
              >
                <Home className="h-3 w-3" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 border border-primary/10 rounded-lg p-1">
            <TabsTrigger 
              value="units"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-white text-sm"
            >
              Units
            </TabsTrigger>
            <TabsTrigger 
              value="manage"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-white text-sm"
            >
              Words
            </TabsTrigger>
            <TabsTrigger 
              value="upload"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-white text-sm"
            >
              Upload
            </TabsTrigger>
          </TabsList>

          {/* Manage Units Tab */}
          <TabsContent value="units" className="space-y-4 mt-4">
            <UnitManagement />
          </TabsContent>

          {/* Manage Vocabularies Tab */}
          <TabsContent value="manage" className="space-y-4 mt-4">
            <div className="flex justify-between items-center gap-4 mb-4">
              <h2 className="text-lg font-[700] text-primary">
                Vocabulary Management
              </h2>
              <Button
                onClick={() => {
                  setSelectedVocab(null as any);
                  setShowEditDialog(true);
                }}
                className="btn-cute-primary gap-2 h-8 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add Word
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
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="card-cute">
              <h2 className="text-lg font-[700] text-primary mb-3">
                Bulk Upload
              </h2>
              <p className="text-sm text-foreground/70 mb-4">
                Upload a CSV file with columns: word, ipa, exampleSentence, difficulty (optional)
              </p>
              <Button
                onClick={() => setShowBulkUpload(true)}
                className="btn-cute-primary gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose CSV File
              </Button>
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
            toast.success(selectedVocab ? "Word updated!" : "Word added!");
          }}
        />
      )}
    </div>
  );
}
