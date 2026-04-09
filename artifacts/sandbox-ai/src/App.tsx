import { useEffect, useRef, useState, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from "@clerk/react";
import { SplashScreen } from "@/components/splash-screen";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Prompts from "@/pages/prompts";
import ChatLayout from "@/pages/chat-layout";
import Download from "@/pages/download";
import GetApp from "@/pages/get-app";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import Pricing from "@/pages/pricing";
import { OnboardingWizard } from "@/components/onboarding";
import Admin from "@/pages/admin";
import AuthCheck from "@/pages/auth-check";
import { usePermissions } from "@/hooks/use-permissions";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#00d0ff",
    colorBackground: "#1e1e2f",
    colorInputBackground: "#2a2a3f",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255,255,255,0.5)",
    colorNeutral: "#ffffff",
    borderRadius: "12px",
    fontFamily: "inherit",
  },
  elements: {
    card: {
      backgroundColor: "#1e1e2f",
      border: "1px solid rgba(0,208,255,0.15)",
      boxShadow: "0 0 60px rgba(0,208,255,0.1)",
    },
    headerTitle: { color: "#ffffff", fontWeight: "800" },
    headerSubtitle: { color: "rgba(255,255,255,0.5)" },
    socialButtonsBlockButton: {
      backgroundColor: "#2a2a3f",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#ffffff",
    },
    dividerLine: { backgroundColor: "rgba(255,255,255,0.08)" },
    dividerText: { color: "rgba(255,255,255,0.3)" },
    formFieldLabel: { color: "rgba(255,255,255,0.65)" },
    formFieldInput: {
      backgroundColor: "#2a2a3f",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#ffffff",
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #00d0ff, #00a3cc)",
      color: "#121212",
      fontWeight: "700",
    },
    footerActionText: { color: "rgba(255,255,255,0.4)" },
    footerActionLink: { color: "#00d0ff" },
    identityPreviewText: { color: "#ffffff" },
    identityPreviewEditButtonIcon: { color: "#00d0ff" },
  },
};

function SignInPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: "var(--sb-bg)" }}
    >
      <div className="mb-8 flex items-center gap-2.5">
        <svg width={28} height={28} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="16,2 28,8 28,24 16,30 4,24 4,8" stroke="url(#siLg)" strokeWidth="2" fill="none" />
          <polygon points="16,7 23,11 23,21 16,25 9,21 9,11" fill="url(#siLg)" opacity="0.25" />
          <defs>
            <linearGradient id="siLg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00d0ff" />
              <stop offset="100%" stopColor="#00a3cc" />
            </linearGradient>
          </defs>
        </svg>
        <span className="font-black text-lg tracking-tight" style={{ color: "var(--sb-accent)", textShadow: "0 0 14px rgba(0,208,255,0.5)" }}>
          SANDBOX.AI
        </span>
      </div>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/chat`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: "var(--sb-bg)" }}
    >
      <div className="mb-8 flex items-center gap-2.5">
        <svg width={28} height={28} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="16,2 28,8 28,24 16,30 4,24 4,8" stroke="url(#suLg)" strokeWidth="2" fill="none" />
          <polygon points="16,7 23,11 23,21 16,25 9,21 9,11" fill="url(#suLg)" opacity="0.25" />
          <defs>
            <linearGradient id="suLg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00d0ff" />
              <stop offset="100%" stopColor="#00a3cc" />
            </linearGradient>
          </defs>
        </svg>
        <span className="font-black text-lg tracking-tight" style={{ color: "var(--sb-accent)", textShadow: "0 0 14px rgba(0,208,255,0.5)" }}>
          SANDBOX.AI
        </span>
      </div>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/chat`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function ProtectedChat() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <AuthCheck />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return (
    <>
      <ChatLayout />
      <OnboardingWizard />
    </>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <AuthCheck />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

function DashboardRoute() {
  const { canUse, isLoaded } = usePermissions();
  if (!isLoaded) return null;
  if (!canUse("dashboard")) return <Redirect to="/pricing" />;
  return <Dashboard />;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/get-app" component={GetApp} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/auth-check" component={AuthCheck} />
      <Route path="/prompts">
        <ProtectedRoute><Prompts /></ProtectedRoute>
      </Route>
      <Route path="/download">
        <ProtectedRoute><Download /></ProtectedRoute>
      </Route>
      <Route path="/chat" component={ProtectedChat} />
      <Route path="/chat/:id" component={ProtectedChat} />
      <Route path="/dashboard">
        <ProtectedRoute><DashboardRoute /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><Settings /></ProtectedRoute>
      </Route>
      <Route path="/pricing" component={Pricing} />
      <Route path="/admin">
        <ProtectedRoute><Admin /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl || undefined}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (!clerkPubKey) {
    return (
      <div style={{ color: "#fff", padding: 24 }}>
        Missing VITE_CLERK_PUBLISHABLE_KEY — please check environment variables.
      </div>
    );
  }

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
    </>
  );
}

export default App;
