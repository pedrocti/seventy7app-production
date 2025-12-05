import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/auth/AuthContext";

import Home from "@/pages/Home";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Disclaimer from "@/pages/Disclaimer";
import InvestPage from "@/pages/InvestPage";
import PortfolioPage from "@/pages/PortfolioPage";
import Signal from "@/pages/Signal";
import MentorshipPage from "@/pages/MentorshipPage";
import Login from "@/auth/Login";
import Register from "@/auth/Register";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

import PrivateRoute from "@/auth/PrivateRoute";
import LoadingScreen from "@/components/LoadingScreen";
import DevErrorBoundary from "./DevErrorBoundary";
import { useEffect, useState } from "react";

const Router = () => (
  <Switch>
    <Route path="/" component={Home} />
    <Route path="/invest" component={InvestPage} />
    <Route path="/portfolio" component={PortfolioPage} />
    <Route path="/signal" component={Signal} />
    <Route path="/mentorship" component={MentorshipPage} />
    <Route path="/privacy-policy" component={PrivacyPolicy} />
    <Route path="/terms-of-service" component={TermsOfService} />
    <Route path="/disclaimer" component={Disclaimer} />
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />

    {/* FIXED PRIVATE ROUTES */}
    <Route path="/dashboard">
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    </Route>

    <Route path="/admin">
      <PrivateRoute>
        <AdminDashboard />
      </PrivateRoute>
    </Route>

    <Route path="/:rest*" component={NotFound} />
  </Switch>
);


const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <DevErrorBoundary>
        {loading ? <LoadingScreen /> : <Router />}
      </DevErrorBoundary>
    </TooltipProvider>
      </AuthProvider>
  );
};

export default App;
