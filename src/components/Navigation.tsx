import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";
import { useToast } from "./ui/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-4 p-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate("/profile")}
        className="rounded-full"
      >
        <UserCircle className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleLogout}
        className="rounded-full"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};