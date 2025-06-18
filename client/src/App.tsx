import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Forms from "@/pages/forms";
import FormBuilder from "@/pages/form-builder";
import FormEditor from "@/pages/form-editor";
import FormView from "@/pages/form-view";
import ApiKeys from "@/pages/api-keys";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { selectedProject, setSelectedProject } = useProject();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          selectedProject={selectedProject || undefined}
          onProjectChange={setSelectedProject}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public form route - accessible without authentication */}
      <Route path="/form/:projectId/:formName" component={FormView} />

      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </Route>
          <Route path="/projects">
            <AuthenticatedLayout>
              <Projects />
            </AuthenticatedLayout>
          </Route>
          <Route path="/forms">
            <AuthenticatedLayout>
              <Forms />
            </AuthenticatedLayout>
          </Route>
          <Route path="/form-builder/:id?">
            <AuthenticatedLayout>
              <FormBuilder />
            </AuthenticatedLayout>
          </Route>
          <Route path="/form-editor/:projectId?">
            <AuthenticatedLayout>
              <FormEditor />
            </AuthenticatedLayout>
          </Route>
          <Route path="/api-keys">
            <AuthenticatedLayout>
              <ApiKeys />
            </AuthenticatedLayout>
          </Route>
          <Route path="/settings">
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="formfy-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
