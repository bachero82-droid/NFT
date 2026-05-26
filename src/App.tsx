import React, { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import { Layout } from "@/components/layout";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getAuthToken } from "./lib/auth";

import Dashboard from "@/pages/dashboard";
import Cards from "@/pages/cards";
import CardsCreate from "@/pages/cards-create";
import Marketplace from "@/pages/marketplace";
import Games from "@/pages/games";
import GamesCoinflip from "@/pages/games-coinflip";
import GamesCrash from "@/pages/games-crash";
import Transactions from "@/pages/transactions";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

// Set auth token getter for custom fetch
setAuthTokenGetter(getAuthToken);

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const [location, setLocation] = useLocation();
  const token = getAuthToken();

  useEffect(() => {
    if (!token) {
      setLocation("/");
    }
  }, [token, setLocation]);

  if (!token) return null;

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  const [location, setLocation] = useLocation();
  const token = getAuthToken();

  useEffect(() => {
    if (location === "/" && token) {
      setLocation("/dashboard");
    }
  }, [location, token, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/cards" component={() => <ProtectedRoute component={Cards} />} />
      <Route path="/cards/create" component={() => <ProtectedRoute component={CardsCreate} />} />
      <Route path="/marketplace" component={() => <ProtectedRoute component={Marketplace} />} />
      <Route path="/games" component={() => <ProtectedRoute component={Games} />} />
      <Route path="/games/coinflip" component={() => <ProtectedRoute component={GamesCoinflip} />} />
      <Route path="/games/crash" component={() => <ProtectedRoute component={GamesCrash} />} />
      <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;