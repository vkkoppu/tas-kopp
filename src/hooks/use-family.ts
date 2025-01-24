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
      console.log("Fetching family data...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No authenticated user found");
        throw new Error("No authenticated user");
      }

      console.log("User ID:", user.id);

      // First, fetch the most recent family data
      const { data: familyData, error: familyError } = await supabase
        .from("families")
        .select("*")
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (familyError) {
        console.error("Error fetching family:", familyError);
        toast.error("Error loading family data");
        throw familyError;
      }

      console.log("Family data:", familyData);

      if (!familyData) {
        console.log("No family data found");
        return null;
      }

      // Then, fetch the family members
      const { data: members, error: membersError } = await supabase
        .from("family_members")
        .select("*")
        .eq("family_id", familyData.id);

      if (membersError) {
        console.error("Error fetching family members:", membersError);
        toast.error("Error loading family members");
        throw membersError;
      }

      console.log("Family members:", members);

      return {
        ...familyData,
        members: members || [],
      };
    },
    retry: 1,
  });

  const createFamily = useMutation({
    mutationFn: async (newFamily: Family) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: familyData, error: familyError } = await supabase
        .from("families")
        .insert([{ 
          name: newFamily.name,
          created_by: user.id 
        }])
        .select()
        .single();

      if (familyError) {
        console.error("Error creating family:", familyError);
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
        console.error("Error adding family members:", membersError);
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
        console.error("Error updating family:", familyError);
        toast.error("Error updating family");
        throw familyError;
      }

      // Delete existing members
      const { error: deleteError } = await supabase
        .from("family_members")
        .delete()
        .eq("family_id", family.id);

      if (deleteError) {
        console.error("Error deleting family members:", deleteError);
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
        console.error("Error updating family members:", membersError);
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