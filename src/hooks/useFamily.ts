import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  name: string;
  role: string;
}

interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
}

export const useFamily = () => {
  const user = useUser();
  const queryClient = useQueryClient();

  const { data: family, isLoading: isFamilyLoading } = useQuery({
    queryKey: ["family"],
    queryFn: async () => {
      if (!user) return null;

      const { data: families, error } = await supabase
        .from("families")
        .select(`
          id,
          name,
          family_members (
            id,
            name,
            role
          )
        `)
        .eq("created_by", user.id)
        .single();

      if (error) throw error;

      if (!families) return null;

      return {
        id: families.id,
        name: families.name,
        members: families.family_members,
      };
    },
    enabled: !!user,
  });

  const createFamily = useMutation({
    mutationFn: async ({
      familyName,
      members,
    }: {
      familyName: string;
      members: { name: string; role: string }[];
    }) => {
      if (!user) throw new Error("No user found");

      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({
          name: familyName,
          created_by: user.id,
        })
        .select()
        .single();

      if (familyError) throw familyError;

      const { error: membersError } = await supabase.from("family_members").insert(
        members.map((member) => ({
          family_id: family.id,
          name: member.name,
          role: member.role,
        }))
      );

      if (membersError) throw membersError;

      return family;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
      toast.success("Family created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create family: " + error.message);
    },
  });

  const updateFamily = useMutation({
    mutationFn: async ({
      familyName,
      members,
    }: {
      familyName: string;
      members: { id?: string; name: string; role: string }[];
    }) => {
      if (!user || !family) throw new Error("No user or family found");

      const { error: familyError } = await supabase
        .from("families")
        .update({ name: familyName })
        .eq("id", family.id);

      if (familyError) throw familyError;

      // Delete existing members
      const { error: deleteError } = await supabase
        .from("family_members")
        .delete()
        .eq("family_id", family.id);

      if (deleteError) throw deleteError;

      // Insert new members
      const { error: membersError } = await supabase.from("family_members").insert(
        members.map((member) => ({
          family_id: family.id,
          name: member.name,
          role: member.role,
        }))
      );

      if (membersError) throw membersError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
      toast.success("Family updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update family: " + error.message);
    },
  });

  return {
    family,
    isFamilyLoading,
    createFamily,
    updateFamily,
  };
};