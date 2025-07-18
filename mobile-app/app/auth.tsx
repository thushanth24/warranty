import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import OtpInput from './components/OtpInput';
import CountryCodePicker from './components/CountryCodePicker';
import { BACKEND_URL } from '../config/config';
import styles from './auth.styles';

// You may want to replace this with your actual logo
const logo = { uri: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=96&h=96' };

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
    <LinearGradient
      colors={["#dbeafe", "#f8fafc", "#ede9fe"]}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={40}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            {/* Logo and Header */}
            <View style={styles.headerWrap}>
              <View style={styles.logoWrap}>
                <Image source={logo} style={styles.logo} />
              </View>
              <Text style={styles.title}>SubTracker Pro</Text>
              <Text style={styles.subtitle}>Easily track all your subscriptions and product warranties in one place.</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              {step === 'phone' ? (
                <>
                  <Text style={styles.formTitle}>Sign in with your phone</Text>
                  <Text style={styles.formSubtitle}>Get instant access to your subscription and warranty tracking dashboard.</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.phoneRow}>
                      <TouchableOpacity
                        style={styles.countryBtn}
                        onPress={() => setShowCountryModal(true)}
                      >
                        <Text style={styles.countryText}>{countryCode}</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#888"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        maxLength={12}
                        returnKeyType="done"
                        blurOnSubmit={true}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                    <CountryCodePicker
                      visible={showCountryModal}
                      onSelect={setCountryCode}
                      onClose={() => setShowCountryModal(false)}
                    />
                  </View>
                  {error ? (
                    <Text style={styles.error}>{error}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.formTitle}>Enter OTP</Text>
                  <OtpInput values={otpValues} onChange={handleOtpChange} length={6} />
                  {error ? (
                    <Text style={styles.error}>{error}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={handleResendOtp}
                    disabled={countdown > 0}
                  >
                    <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {/* Modal for feedback if needed in future */}
    </LinearGradient>
  );
}
