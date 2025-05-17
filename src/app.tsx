import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "./providers/auth-provider";
import Header from "@/components/globals/header";
import Landing from "@/pages/landing";
import Auth from "./pages/auth";
import Contact from "./pages/contact";
import Footer from "@/components/globals/footer";
import ToastContainer from "./components/toasts/toast-container";
import { ToastProvider } from "./providers/toast-provider";
import "@/styles/globals.css";

function App() {
  return (
    <ToastProvider>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/reset-password" element={<Auth />} />
              <Route path="/change-password" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </Router>
      <ToastContainer />
    </ToastProvider>
  );
}
<Footer />;

export default App;
