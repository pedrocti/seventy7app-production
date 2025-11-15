import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./auth/AuthContext"; // <-- import the AuthProvider

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark">
    <AuthProvider>  {/* <-- wrap your App with AuthProvider */}
      <App />
    </AuthProvider>
  </ThemeProvider>
);
