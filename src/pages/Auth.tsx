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
      if (event === "SIGNED_OUT") {
        toast.error("You have been signed out");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-purple to-pastel-blue p-4">
      <div className="w-full max-w-md space-y-4 bg-white/90 p-8 rounded-xl shadow-lg backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-tertiary">Welcome to Family Tasks</h1>
          <p className="text-neutral-mediumGray">Manage your family tasks efficiently</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#9B87F5',
                  brandAccent: '#7E69AB',
                  inputBackground: 'rgb(229, 222, 255, 0.3)',
                  inputText: '#1A1F2C',
                  inputBorder: '#D6BCFA',
                  inputBorderFocus: '#9B87F5',
                }
              }
            },
            className: {
              container: 'bg-pastel-purple/10 p-4 rounded-lg',
              button: 'bg-purple-primary hover:bg-purple-secondary text-white',
              input: 'bg-pastel-blue/30 border-purple-light focus:border-purple-primary',
              label: 'text-purple-tertiary',
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default AuthPage;