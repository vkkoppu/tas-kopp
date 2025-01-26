import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import Profile from "./pages/Profile";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message.includes('refresh_token_not_found')) {
            console.log('No refresh token found, user needs to login');
            setUser(null);
          } else {
            console.error('Auth error:', error.message);
            toast.error(`Authentication error: ${error.message}`);
            setUser(null);
          }
        } else if (session?.user) {
          console.log('Session found:', session);
          setUser(session.user);
          toast.success("Welcome back!");
        } else {
          console.log('No active session');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error("Failed to check authentication status");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user);
        setUser(session?.user ?? null);
        toast.success("Successfully signed in!");
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        toast.info("You have been signed out.");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed:', session?.user);
        setUser(session?.user ?? null);
      } else if (event === 'USER_UPDATED') {
        console.log('User updated:', session?.user);
        setUser(session?.user ?? null);
        toast.success("Profile updated successfully!");
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial session check
        if (session?.user) {
          console.log('Initial session found:', session.user);
          setUser(session.user);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter basename="/">
          <Routes>
            <Route
              path="/"
              element={user ? <Index /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/auth"
              element={!user ? <AuthPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/auth" replace />}
            />
          </Routes>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;