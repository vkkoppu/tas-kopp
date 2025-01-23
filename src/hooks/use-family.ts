import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface FamilyMember {
  id?: string;
  name: string;
  role: string;
}

interface Family {
  id?: string;
  name: string;
  members: FamilyMember[];
}

export const useFamily = () => {
  const queryClient = useQueryClient();

  const { data: family, isLoading } = useQuery({
    queryKey: ["family"],
    queryFn: async () => {
      const { data: familyData, error: familyError } = await supabase
        .from("families")
        .select("id, name")
        .single();

      if (familyError) {
        if (familyError.code !== "PGRST116") { // No data found
          toast.error("Error loading family data");
          throw familyError;
        }
        return null;
      }

      if (!familyData) return null;

      const { data: members, error: membersError } = await supabase
        .from("family_members")
        .select("id, name, role")
        .eq("family_id", familyData.id);

      if (membersError) {
        toast.error("Error loading family members");
        throw membersError;
      }

      return {
        ...familyData,
        members: members || [],
      };
    },
  });

  const createFamily = useMutation({
    mutationFn: async (newFamily: Family) => {
      const { data: familyData, error: familyError } = await supabase
        .from("families")
        .insert([{ name: newFamily.name }])
        .select()
        .single();

      if (familyError) {
        toast.error("Error creating family");
        throw familyError;
      }

      const membersToInsert = newFamily.members.map((member) => ({
        family_id: familyData.id,
        name: member.name,
        role: member.role,
      }));

      const { error: membersError } = await supabase
        .from("family_members")
        .insert(membersToInsert);

      if (membersError) {
        toast.error("Error adding family members");
        throw membersError;
      }

      return { ...familyData, members: newFamily.members };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
      toast.success("Family created successfully");
    },
  });

  const updateFamily = useMutation({
    mutationFn: async (updatedFamily: Family) => {
      if (!family?.id) throw new Error("No family ID found");

      const { error: familyError } = await supabase
        .from("families")
        .update({ name: updatedFamily.name })
        .eq("id", family.id);

      if (familyError) {
        toast.error("Error updating family");
        throw familyError;
      }

      // Delete existing members
      const { error: deleteError } = await supabase
        .from("family_members")
        .delete()
        .eq("family_id", family.id);

      if (deleteError) {
        toast.error("Error updating family members");
        throw deleteError;
      }

      // Insert new members
      const membersToInsert = updatedFamily.members.map((member) => ({
        family_id: family.id,
        name: member.name,
        role: member.role,
      }));

      const { error: membersError } = await supabase
        .from("family_members")
        .insert(membersToInsert);

      if (membersError) {
        toast.error("Error updating family members");
        throw membersError;
      }

      return { ...updatedFamily, id: family.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
      toast.success("Family updated successfully");
    },
  });

  return {
    family,
    isLoading,
    createFamily,
    updateFamily,
  };
};