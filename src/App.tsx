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

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth error:', error.message);
          toast.error(`Authentication error: ${error.message}`);
          setUser(null);
        } else if (session?.user) {
          console.log('Session found:', session);
          setUser(session.user);
        } else {
          console.log('No active session');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error("Authentication error. Please try logging in again.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      switch (event) {
        case 'SIGNED_OUT':
          console.log('User signed out');
          setUser(null);
          toast.info("You have been signed out.");
          break;
        case 'SIGNED_IN':
          console.log('User signed in:', session?.user);
          setUser(session?.user ?? null);
          toast.success("Successfully signed in!");
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed:', session?.user);
          setUser(session?.user ?? null);
          toast.success("Session refreshed successfully!");
          break;
        case 'USER_UPDATED':
          console.log('User updated:', session?.user);
          setUser(session?.user ?? null);
          toast.success("Profile updated successfully!");
          break;
        case 'USER_DELETED':
          console.log('User deleted');
          setUser(null);
          toast.info("Account deleted.");
          break;
        default:
          console.log('Unhandled auth event:', event);
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
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;