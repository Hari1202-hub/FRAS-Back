
import { useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
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
import axios from "axios";
import { BASEURL } from "../../App";
import { BASEPATH } from "../../App";

const Resetpasswrod = () => {
  const location = useLocation(); // ✅ Correct: called at top level
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [credentials, setCredentials] = useState({
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const formdata = new FormData();
    formdata.append("token", token);
    formdata.append("email", credentials.email);
    formdata.append("password", credentials.password);
    formdata.append("password_confirmation", credentials.password_confirmation);
    if(credentials.password.length<6){
      toast.error("Password must be at least 6 characters");
    }
    else if(credentials.password!=credentials.password_confirmation){
      toast.error("Passwords don't match");
    }
    else{
      axios.post(BASEURL+'reset_password', formdata, {
        headers: { "Content-Type": "multipart/form-data" }
      })
        .then(response => {
          console.log(response.data);
          if (response.data.status==200) {
            // Store token in localStorage or cookie
            toast.success("Password Reset successful!");
            navigate("/login");
          }
        else{
          setError(response.data.message);
          toast.error(response.data.message);
        }
        }) .catch(error => {
          if (error.response && error.response.status === 400) {
            setError(error.response.message);
            toast.error(error.response.message);
          }
        })
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
   const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <a href="login"><img
            src={`${BASEPATH}lovable-uploads/05179fc8-d11b-4d37-bd27-20cd7447beaa.png`}
            alt="Tanseeq Investment Logo"
            className="h-12 w-12"
          /></a>
          <h2 className="text-2xl font-bold text-gray-900">
            Tanseeq Investment
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div >
            <div  className="relative">
              <Label htmlFor="Email">Email</Label>
              <Input
                  id="email"
                  type="text"
                  placeholder="Enter your Email"  name="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="mt-1"
                  required
                />
            </div>

            <div  className="relative">
              <Label htmlFor="Password">Password</Label>
              <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your Password"  name="password"
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
                  className="absolute right-3 top-3/4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
            </div>

            <div className="mt-3 mb-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Confirm Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter your Confirm Password"  name="password_confirmation"
                  value={credentials.password_confirmation}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password_confirmation: e.target.value })
                  }
                  className="mt-1"
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
              Reset Password
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            &copy; 2025 Tanseeq Investment
          </p>
        </div>
      </div>

    </div>
  );
};

export default Resetpasswrod;
