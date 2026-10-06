// client/src/App.tsx
import { Route, Switch, Router, Redirect } from "wouter";
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
import AdminRoute from "@/auth/AdminRoute";
import LoadingScreen from "@/components/LoadingScreen";
import DevErrorBoundary from "./DevErrorBoundary";
import { useEffect, useState } from "react";
import VerifyEmail from "@/pages/VerifyEmail";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";

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
          {loading ? (
            <LoadingScreen />
          ) : (
            <div className="min-h-screen bg-[#0B1120] text-white">
              <Router>
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
                  <Route path="/verify-email" component={VerifyEmail} />

                  {/* Blog */}
                  <Route path="/blog" component={BlogPage} />
                  <Route path="/blog/:slug" component={BlogPostPage} />

                  {/* Learning lives inside the dashboard — redirect any direct
                      /learning URL hits to the dashboard's learning tab        */}
                  <Route path="/learning/:rest*">
                    <Redirect to="/dashboard?tab=learning" />
                  </Route>

                  {/* Private routes */}
                  <Route path="/dashboard">
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  </Route>
                  <Route path="/admin">
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  </Route>

                  <Route path="/:rest*" component={NotFound} />
                </Switch>
              </Router>
            </div>
          )}
        </DevErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  );
};

export default App;