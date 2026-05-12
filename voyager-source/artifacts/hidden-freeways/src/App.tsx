import * as React from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Invite from "@/pages/invite";
import Category from "@/pages/category";
import State from "@/pages/state";
import LocationDetail from "@/pages/location";
import ThreadDetail from "@/pages/thread";
import NewThread from "@/pages/new-thread";
import Admin from "@/pages/admin";
import ChatIndex from "@/pages/chat";
import ChatRoom from "@/pages/chat-room";
import CrewsPage from "@/pages/crews";
import MessagesPage from "@/pages/messages";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Auth wrapper
function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { data: user, isLoading, error } = useGetCurrentUser();
  const [, setLocation] = useLocation();

  const needsLogin = !isLoading && (error || !user);
  const needsHome = !isLoading && !!user && adminOnly && user.role !== "admin";

  React.useEffect(() => {
    if (needsLogin) setLocation("/login");
    else if (needsHome) setLocation("/");
  }, [needsLogin, needsHome, setLocation]);

  if (isLoading || needsLogin || needsHome) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Skeleton className="w-16 h-16 rounded-none bg-primary/20" />
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/invite" component={Invite} />
      <Route path="/invite/:code" component={Invite} />

      <Route path="/">
        <Layout>
          <ProtectedRoute component={Home} />
        </Layout>
      </Route>
      
      <Route path="/category/:slug">
        <Layout>
          <ProtectedRoute component={Category} />
        </Layout>
      </Route>
      
      <Route path="/state/:slug">
        <Layout>
          <ProtectedRoute component={State} />
        </Layout>
      </Route>
      
      <Route path="/location/:id">
        <Layout>
          <ProtectedRoute component={LocationDetail} />
        </Layout>
      </Route>
      
      <Route path="/thread/:id">
        <Layout>
          <ProtectedRoute component={ThreadDetail} />
        </Layout>
      </Route>
      
      <Route path="/new-thread">
        <Layout>
          <ProtectedRoute component={NewThread} />
        </Layout>
      </Route>
      
      <Route path="/admin">
        <Layout>
          <ProtectedRoute component={Admin} adminOnly={true} />
        </Layout>
      </Route>

      <Route path="/chat">
        <Layout>
          <ProtectedRoute component={ChatIndex} />
        </Layout>
      </Route>

      <Route path="/chat/:slug">
        <Layout>
          <ProtectedRoute component={ChatRoom} />
        </Layout>
      </Route>

      <Route path="/crews">
        <Layout>
          <ProtectedRoute component={CrewsPage} />
        </Layout>
      </Route>

      <Route path="/messages">
        <Layout>
          <ProtectedRoute component={MessagesPage} />
        </Layout>
      </Route>
      
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
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
