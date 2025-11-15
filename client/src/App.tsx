import { Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

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
import NotFound from "@/pages/not-found";

import { AuthProvider } from "@/auth/AuthContext";
import PrivateRoute from "@/auth/PrivateRoute";
import LoadingScreen from "@/components/LoadingScreen";

import AdminDashboard from "@/pages/AdminDashboard";
import DevErrorBoundary from "./DevErrorBoundary";

// ---------------------------
// Router Component
// ---------------------------
const Router = () => {
  console.log("Router rendering");

  return (
    <>
      <Route path="/" component={Home} />
      <Route path="/invest" component={InvestPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/signal" component={Signal} />
      <Route path="/mentorship" component={MentorshipPage} />

      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected Routes */}
      <PrivateRoute path="/dashboard" component={Dashboard} />
      <PrivateRoute path="/admin" component={AdminDashboard} />

      {/* Catch-all */}
      <Route path="/:rest*" component={NotFound} />
    </>
  );
};

// ---------------------------
// Main App
// ---------------------------
const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TooltipProvider>
      <Toaster />

      {/* GLOBAL ERROR CATCHER */}
      <DevErrorBoundary>
        <AuthProvider>
          {loading ? <LoadingScreen /> : <Router />}
        </AuthProvider>
      </DevErrorBoundary>
    </TooltipProvider>
  );
};

export default App;
