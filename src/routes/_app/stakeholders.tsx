import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { StakeholderRow, useStakeholders } from "@/hooks/use-modules";
import { Building2, Users, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_app/stakeholders")({
  head: () => ({ meta: [{ title: "Stakeholders · Agrofeed Sukuk" }, { name: "description", content: "Organisation views and stakeholder activity." }] }),
  component: Stakeholders,
});

function StakeholderDialog({ 
  initialData, 
  open, 
  onOpenChange,
  trigger 
}: { 
  initialData?: StakeholderRow; 
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  const [org, setOrg] = useState(initialData?.org || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [contactEmail, setContactEmail] = useState(initialData?.contact_email || "");
  const queryClient = useQueryClient();

  const isEdit = !!initialData;

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const { error } = await supabase.from("stakeholders").update({
          org,
          role: role || null,
          contact_email: contactEmail || null,
        }).eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("stakeholders").insert({
          org,
          role: role || null,
          contact_email: contactEmail || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakeholders"] });
      toast.success(isEdit ? "Stakeholder updated successfully." : "Stakeholder added successfully.");
      setIsOpen(false);
      if (!isEdit) {
        setOrg("");
        setRole("");
        setContactEmail("");
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to ${isEdit ? 'update' : 'add'} stakeholder: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) {
      toast.error("Organization name is required.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Stakeholder' : 'Add Stakeholder'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the details for this organization.' : 'Add a new organization to the stakeholder portal.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org">Organization Name <span className="text-destructive">*</span></Label>
            <Input
              id="org"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g., Acme Corp"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Legal Advisor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@acmecorp.com"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : (isEdit ? "Update Stakeholder" : "Add Stakeholder")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteStakeholderDialog({ 
  stakeholder, 
  open, 
  onOpenChange 
}: { 
  stakeholder: StakeholderRow; 
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("stakeholders").delete().eq("id", stakeholder.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakeholders"] });
      toast.success("Stakeholder deleted successfully.");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete stakeholder: ${error.message}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Stakeholder</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {stakeholder.org}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="!bg-red-500 hover:!bg-red-600 !text-white" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stakeholders() {
  const { data: STAKEHOLDERS = [] } = useStakeholders();
  const [editStakeholder, setEditStakeholder] = useState<StakeholderRow | null>(null);
  const [deleteStakeholder, setDeleteStakeholder] = useState<StakeholderRow | null>(null);

  return (
    <>
      <PageHeader 
        title="Stakeholder Portal" 
        subtitle="Organisation-specific views for Agrofeed, Tesserant, Al Huda CIBE, Sharia Board & External Legal" 
        actions={
          <StakeholderDialog trigger={
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" /> Add Stakeholder
            </Button>
          } />
        }
      />
      
      {editStakeholder && (
        <StakeholderDialog 
          initialData={editStakeholder} 
          open={true} 
          onOpenChange={(isOpen) => !isOpen && setEditStakeholder(null)} 
        />
      )}
      
      {deleteStakeholder && (
        <DeleteStakeholderDialog 
          stakeholder={deleteStakeholder} 
          open={true} 
          onOpenChange={(isOpen) => !isOpen && setDeleteStakeholder(null)} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {STAKEHOLDERS.map((s) => (
          <Card key={s.id} className="relative overflow-hidden">
            <div className="absolute right-2 top-2 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-50 hover:opacity-100">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditStakeholder(s)} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteStakeholder(s)} className="text-destructive focus:text-destructive cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full gradient-gold opacity-10" />
            <div className="flex items-start gap-3 relative mt-1">
              <div className="h-11 w-11 rounded-xl gradient-emerald flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold pr-6">{s.org}</div>
                <div className="text-[11px] text-muted-foreground">{s.role}</div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <Pill tone="warning">{s.pending} pending</Pill>
                  <Pill tone="success">{s.completed} done</Pill>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Users className="h-3 w-3" />{s.users} users</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
