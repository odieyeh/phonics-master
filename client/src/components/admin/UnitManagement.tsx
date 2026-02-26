import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Unit } from "@shared/types";

interface UnitManagementProps {
  onUnitSelect?: (unitId: number) => void;
}

export default function UnitManagement({ onUnitSelect }: UnitManagementProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", order: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();

  // Fetch units
  const { data: unitsData, isLoading: isLoadingUnits } = trpc.unit.list.useQuery({
    limit: 100,
    offset: 0,
  });

  React.useEffect(() => {
    if (unitsData) {
      setUnits(unitsData);
    }
  }, [unitsData]);

  // Create/Update mutation
  const createMutation = trpc.unit.create.useMutation({
    onSuccess: () => {
      toast.success("Unit created successfully!");
      utils.unit.list.invalidate();
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", order: 0 });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create unit");
    },
  });

  const updateMutation = trpc.unit.update.useMutation({
    onSuccess: () => {
      toast.success("Unit updated successfully!");
      utils.unit.list.invalidate();
      setIsDialogOpen(false);
      setEditingUnit(null);
      setFormData({ name: "", description: "", order: 0 });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update unit");
    },
  });

  const deleteMutation = trpc.unit.delete.useMutation({
    onSuccess: () => {
      toast.success("Unit deleted successfully!");
      utils.unit.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete unit");
    },
  });

  const handleOpenDialog = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        name: unit.name,
        description: unit.description || "",
        order: unit.order || 0,
      });
    } else {
      setEditingUnit(null);
      setFormData({ name: "", description: "", order: 0 });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Unit name is required");
      return;
    }

    setIsLoading(true);
    try {
      if (editingUnit) {
        await updateMutation.mutateAsync({
          id: editingUnit.id,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Units</h3>
        <Button
          onClick={() => handleOpenDialog()}
          className="gap-2"
          disabled={isLoadingUnits}
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </Button>
      </div>

      {isLoadingUnits ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : units.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground">No units yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50"
            >
              <div className="flex-1">
                <h4 className="font-semibold">{unit.name}</h4>
                {unit.description && (
                  <p className="text-sm text-muted-foreground">{unit.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(unit)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(unit.id)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? "Edit Unit" : "Create New Unit"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Unit 1: Basic Greetings"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for this unit"
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                disabled={isLoading}
              />
            </div>
          </form>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingUnit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
