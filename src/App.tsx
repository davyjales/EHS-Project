
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WasteProvider } from "./contexts/WasteContext";
import { ChatProvider } from "./contexts/ChatContext";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import WasteDetails from "./pages/waste/WasteDetails";
import CreateWaste from "./pages/waste/CreateWaste";
import Profile from "./pages/Profile";
import UserContracts from "./pages/contracts/UserContracts";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WasteProvider>
        <ChatProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/waste/:id" element={<WasteDetails />} />
              <Route path="/waste/new" element={<CreateWaste />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contracts" element={<UserContracts />} />
              <Route path="/help" element={<Help />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </WasteProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
