import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SearchProvider } from "@/lib/searchContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import PatientDetail from "@/pages/patient-detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pacientes/:slug" component={PatientDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </SearchProvider>
    </QueryClientProvider>
  );
}

export default App;
