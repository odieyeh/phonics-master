import React, { useState } from "react";
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cute">
      {/* Header */}
      <div className="border-b-2 border-primary/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl animate-bounce-gentle">⚙️</div>
              <div>
                <h1 className="text-3xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-foreground/70 mt-1">
                  Manage units, vocabularies and content 📚
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="btn-cute-secondary gap-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                className="btn-cute-primary gap-2"
                onClick={() => setLocation("/")}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 border-2 border-primary/20 rounded-2xl p-1">
            <TabsTrigger 
              value="units"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
            >
              📚 Units
            </TabsTrigger>
            <TabsTrigger 
              value="manage"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
            >
              📝 Vocabularies
            </TabsTrigger>
            <TabsTrigger 
              value="upload"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
            >
              📤 Upload
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white"
            >
              📊 Stats
            </TabsTrigger>
          </TabsList>

          {/* Manage Units Tab */}
          <TabsContent value="units" className="space-y-4 mt-6">
            <UnitManagement />
          </TabsContent>

          {/* Manage Vocabularies Tab */}
          <TabsContent value="manage" className="space-y-4 mt-6">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📝</span>
                <h2 className="text-2xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Vocabulary Management
                </h2>
              </div>
              <Button
                onClick={() => {
                  setSelectedVocab(null as any);
                  setShowEditDialog(true);
                }}
                className="btn-cute-primary gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Word
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
          <TabsContent value="upload" className="space-y-4 mt-6">
            <div className="card-cute border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📤</span>
                <h2 className="text-2xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Bulk Upload Vocabularies
                </h2>
              </div>
              <p className="mb-6 text-foreground/70 leading-relaxed">
                Upload a CSV file with the following columns: <span className="font-semibold text-primary">word, ipa, exampleSentence, difficulty (optional)</span>
              </p>
              <Button
                onClick={() => setShowBulkUpload(true)}
                size="lg"
                className="btn-cute-primary gap-2"
              >
                <Upload className="h-5 w-5" />
                Choose CSV File
              </Button>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📊</span>
              <h2 className="text-2xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Statistics
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card-cute border-2 border-primary/20 text-center">
                <div className="text-4xl mb-3">📚</div>
                <p className="mb-2 text-sm font-[700] text-primary/70 uppercase tracking-wider">Total Vocabularies</p>
                <p className="text-5xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">-</p>
              </div>
              <div className="card-cute border-2 border-secondary/20 text-center">
                <div className="text-4xl mb-3">🟢</div>
                <p className="mb-2 text-sm font-[700] text-secondary/70 uppercase tracking-wider">Beginner Level</p>
                <p className="text-5xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">-</p>
              </div>
              <div className="card-cute border-2 border-accent/20 text-center">
                <div className="text-4xl mb-3">🔴</div>
                <p className="mb-2 text-sm font-[700] text-accent/70 uppercase tracking-wider">Advanced Level</p>
                <p className="text-5xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">-</p>
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
            toast.success("Vocabularies uploaded successfully! 🎉");
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
            toast.success("Vocabulary saved successfully! ✅");
          }}
        />
      )}
    </div>
  );
}
