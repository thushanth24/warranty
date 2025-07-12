import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import OtpInput from "@/components/forms/otp-input";
import { formatPhoneNumber } from "@/lib/utils";

export default function AuthPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);
  
  const { login } = useAuth();
  const { toast } = useToast();

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => apiRequest("POST", "/api/auth/send-otp", { phoneNumber: phone }),
    onSuccess: () => {
      setStep("otp");
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast({ title: "OTP Sent", description: "Verification code sent to your phone" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to send OTP. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", { phoneNumber: phone, otp });
      return res.json(); // Parse the response as JSON
    },
    onSuccess: (response: any) => {
      console.log("OTP Verification Success:", response);
      try {
        window._lastOtpUser = response.user;
        console.log("Set window._lastOtpUser:", window._lastOtpUser);
        localStorage.setItem('lastOtpUser', JSON.stringify(response.user));
        console.log("Set localStorage['lastOtpUser']");
        login(response.user);
        console.log("Called login()");
      } catch (e) {
        console.error("Error in onSuccess handler:", e);
      }
      toast({ title: "Welcome!", description: "Successfully authenticated" });
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
    onError: () => {
      toast({ 
        title: "Invalid OTP", 
        description: "Please check your code and try again.",
        variant: "destructive" 
      });
    },
  });

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({ 
        title: "Phone Required", 
        description: "Please enter your phone number",
        variant: "destructive" 
      });
      return;
    }
    const fullPhone = countryCode + phoneNumber.replace(/\D/g, '');
    sendOtpMutation.mutate(fullPhone);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpValues.join("");
    if (otp.length !== 6) {
      toast({ 
        title: "Invalid OTP", 
        description: "Please enter all 6 digits",
        variant: "destructive" 
      });
      return;
    }
    const fullPhone = countryCode + phoneNumber.replace(/\D/g, '');
    verifyOtpMutation.mutate({ phone: fullPhone, otp });
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    const fullPhone = countryCode + phoneNumber.replace(/\D/g, '');
    sendOtpMutation.mutate(fullPhone);
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(formatPhoneNumber(value));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Calendar className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SubTracker Pro</h1>
          <p className="text-gray-600 mt-2">Manage your subscriptions and warranties</p>
        </div>

        {/* Authentication Form */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            {step === "phone" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in with your phone</h2>
                <form onSubmit={handlePhoneSubmit}>
                  <div className="mb-4">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </Label>
                    <div className="flex space-x-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                          <SelectItem value="+91">+91</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={sendOtpMutation.isPending}
                  >
                    {sendOtpMutation.isPending ? "Sending..." : "Send Verification Code"}
                  </Button>
                </form>
              </div>
            )}

            {step === "otp" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter verification code</h2>
                <p className="text-gray-600 mb-6">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium">{countryCode} {phoneNumber}</span>
                </p>
                <form onSubmit={handleOtpSubmit}>
                  <div className="mb-6">
                    <OtpInput value={otpValues} onChange={setOtpValues} />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full mb-4"
                    disabled={verifyOtpMutation.isPending}
                  >
                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || sendOtpMutation.isPending}
                  >
                    {countdown > 0 
                      ? `Resend code in ${countdown}s`
                      : sendOtpMutation.isPending 
                        ? "Sending..."
                        : "Resend code"
                    }
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
