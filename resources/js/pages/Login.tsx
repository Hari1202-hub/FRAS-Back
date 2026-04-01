import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BASEURL } from "../App";
import { BASEPATH } from "../App";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      credentials.email === "admin@tanseeq.com" &&
      credentials.password === "123456"
    ) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
      toast.error("Login failed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetEmailError("");

    if (!resetEmail) {
      setResetEmailError("Email is required");
      return;
    }

    if (!validateEmail(resetEmail)) {
      setResetEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const demoPassword = `PSCP@${Math.floor(1000 + Math.random() * 9000)}`;
    
    setIsLoading(false);
    setForgotPasswordOpen(false);
    setResetEmail("");

    toast.success("Password reset email sent successfully");
    toast("Demo Credentials", {
      description: `Email: ${resetEmail}\nPassword: ${demoPassword}`,
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <img
            src={`${BASEPATH}lovable-uploads/05179fc8-d11b-4d37-bd27-20cd7447beaa.png`}
            alt="Tanseeq Investment Logo"
            className="h-12 w-12"
          />
          <h2 className="text-2xl font-bold text-gray-900">
            Tanseeq Investment
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                className="mt-1"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm text-proscape hover:text-proscape-dark"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="mt-1"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 animate-fade-in">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-proscape hover:bg-proscape-dark text-white"
            >
              Sign in
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            &copy; 2025 Tanseeq Investment
          </p>
        </div>
      </div>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your registered email. We'll send you a system-generated password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email address</Label>
              <div className="relative">
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={resetEmailError ? "border-red-500" : ""}
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              </div>
              {resetEmailError && (
                <p className="text-sm text-red-500">{resetEmailError}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-proscape hover:bg-proscape-dark text-white"
              >
                {isLoading ? "Sending..." : "Send Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
