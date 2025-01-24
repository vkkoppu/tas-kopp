import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        navigate("/");
      }
      // Handle authentication errors
      if (event === "USER_DELETED") {
        toast.error("Account has been deleted");
      }
      if (event === "SIGNED_OUT") {
        toast.error("You have been signed out");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleError = (error: Error) => {
    // Parse the error message from the JSON string if it exists
    try {
      const errorBody = JSON.parse(error.message);
      if (errorBody.message === "Invalid login credentials") {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(errorBody.message || "An error occurred during authentication");
      }
    } catch {
      // If parsing fails, show the original error message
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Family Tasks</h1>
          <p className="text-muted-foreground">Manage your family tasks efficiently</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--primary))',
                  brandAccent: 'rgb(var(--primary))',
                }
              }
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default AuthPage;