declare global {
  interface Window {
    _lastOtpUser?: any;
  }
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import PhoneInput from 'react-phone-input-2';
import '@/pages/auth-phone-input.css';
import { Calendar } from "lucide-react";
import OtpInput from "@/components/forms/otp-input";
import { formatPhoneNumber } from "@/lib/utils";

export default function AuthPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);
  const [phoneShake, setPhoneShake] = useState(false);
  
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
      setPhoneShake(true);
      setTimeout(() => setPhoneShake(false), 500);
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
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-blue-100 via-white to-indigo-100">

      <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl transition-all duration-300">

        {/* Logo and Header */}
        <div className="text-center mb-10">
  <div className="absolute left-0 right-0 top-0 h-48 bg-gradient-to-b from-blue-200 via-white/0 to-white/0 pointer-events-none -z-10" />
          <div className="absolute left-0 right-0 top-0 h-48 bg-gradient-to-b from-blue-200 via-white/0 to-white/0 pointer-events-none -z-10" />

          <div className="mx-auto h-24 w-24 bg-blue-500 rounded-full flex items-center justify-center mb-8 shadow-2xl ring-4 ring-blue-200 border-4 border-white" style={{background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)'}}>
  <Calendar className="text-white text-4xl drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-sm">SubTracker Pro</h1>
          <p className="text-gray-600 mt-4 text-lg md:text-xl">Easily track all your subscriptions and product warranties in one place.</p>
        </div>

        {/* Authentication Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-md rounded-2xl">

          <CardContent className="p-8 md:p-10">

            {step === "phone" && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in with your phone</h2>
                <p className="text-gray-500 text-base mb-6">Get instant access to your subscription and warranty tracking dashboard.</p>
                <form onSubmit={handlePhoneSubmit}>
                  <div className="mb-4">
                    <Label className="block text-lg font-bold text-gray-800 mb-2" htmlFor="phone-input">
  Phone Number
</Label>
                    <div className="mb-4">
                      <div className="relative w-full">
  {!phoneNumber && (
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
    </span>
  )}
  <PhoneInput
    country={'us'}
    value={countryCode + phoneNumber.replace(/\D/g, '')}
    onChange={phone => {
      // Split country code and phone number
      const match = phone.match(/^(\d{1,4})(.*)$/);
      if (match) {
        setCountryCode('+' + match[1]);
        setPhoneNumber(match[2]);
      } else {
        setCountryCode('+1');
        setPhoneNumber('');
      }
    }}
    inputClass={`w-full !pl-14 !h-12 !text-base !rounded-lg !shadow-md border ${!phoneNumber ? '!border-red-500 shake' : '!border-gray-300'} focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200 transition-all duration-200`}
    buttonClass="!h-12 !rounded-l-lg !cursor-pointer"
    containerClass="w-full !w-full"
    inputProps={{ required: true, name: 'phone', autoFocus: true, id: 'phone-input', 'aria-label': 'Phone Number' }}
    placeholder="Enter your phone number"
    enableSearch
    disableDropdown={false}
    countryCodeEditable={false}
    dropdownStyle={{ zIndex: 1000 }}
    dropdownClass="!rounded-lg !shadow-lg"
    specialLabel=""
    aria-label="Country code selector"
  />
</div>
{!phoneNumber && (
  <div className="text-red-500 text-sm mt-1 text-left" role="alert" aria-live="polite">
    Please enter your phone number.
  </div>
)}
                    </div>
                  </div>
                  <Button
  type="submit"
  className="w-full bg-blue-600 hover:bg-blue-700 hover:shadow-2xl active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-white font-semibold text-lg py-3 rounded-lg flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
  disabled={sendOtpMutation.isPending}
  aria-label="Send Verification Code"
>
  {sendOtpMutation.isPending ? (
    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"></path>
    </svg>
  ) : null}
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
