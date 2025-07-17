import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import OtpInput from './components/OtpInput';
import CountryCodePicker from './components/CountryCodePicker';
import { BACKEND_URL } from '../config/config';

export default function AuthScreen() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isValidPhone = (num: string) => {
    const digits = num.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 12 && !/^0/.test(digits);
  };

  const getFullPhone = () => countryCode + phoneNumber.replace(/\D/g, '');

  const handleSendOtp = async () => {
    setError('');
    if (!isValidPhone(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: getFullPhone() }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setStep('otp');
      setCountdown(30);
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      setError('Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: getFullPhone(), otp }),
      });
      if (!res.ok) throw new Error('Invalid OTP');
      const data = await res.json();
      if (!data.user) throw new Error('No user returned');
      login(data.user);
      // Use expo-router navigation
      if (data.user.profileCompleted) {
        router.replace('/dashboard');
      } else {
        router.replace('/profile-setup');
      }
    } catch (e: any) {
      setError(e.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const next = [...otpValues];
    next[index] = value;
    setOtpValues(next);
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  React.useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#222' }}>Sign In</Text>
      <View style={{ width: 300, maxWidth: '90%' }}>
        {step === 'phone' ? (
          <>
            <Text style={{ marginBottom: 4, color: '#222' }}>Phone Number</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity
                style={{ borderWidth: 1, borderColor: '#2563eb', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, marginRight: 8, backgroundColor: '#e8f0fe' }}
                onPress={() => setShowCountryModal(true)}
              >
                <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16 }}>{countryCode}</Text>
              </TouchableOpacity>
              <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, color: '#222', backgroundColor: '#fff' }}
                placeholder="Enter your phone number"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={12}
              />
            </View>
            <CountryCodePicker
              visible={showCountryModal}
              onSelect={setCountryCode}
              onClose={() => setShowCountryModal(false)}
            />
            {error ? (
              <Text style={{ marginBottom: 8, color: 'red', textAlign: 'center' }}>{error}</Text>
            ) : null}
            <TouchableOpacity
              style={{ backgroundColor: '#2563eb', borderRadius: 6, paddingVertical: 12, marginTop: 4, alignItems: 'center', opacity: loading ? 0.7 : 1 }}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ marginBottom: 4, color: '#222' }}>Enter OTP</Text>
            <OtpInput values={otpValues} onChange={handleOtpChange} length={6} />
            {error ? (
              <Text style={{ marginBottom: 8, color: 'red', textAlign: 'center' }}>{error}</Text>
            ) : null}
            <TouchableOpacity
              style={{ backgroundColor: '#2563eb', borderRadius: 6, paddingVertical: 12, marginTop: 12, alignItems: 'center', opacity: loading ? 0.7 : 1 }}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Verify OTP</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 16, alignItems: 'center' }}
              onPress={handleResendOtp}
              disabled={countdown > 0}
            >
              <Text style={{ color: countdown > 0 ? '#888' : '#2563eb', fontWeight: 'bold' }}>
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
