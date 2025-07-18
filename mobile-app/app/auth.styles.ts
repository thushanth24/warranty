import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrap: {
    backgroundColor: '#2563eb',
    borderRadius: 60,
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: 48,
    height: 48,
    tintColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22223b',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6366f1',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  card: {
    width: 340,
    maxWidth: '90%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22223b',
    marginBottom: 4,
    textAlign: 'center',
  },
  formSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    fontSize: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  countryBtn: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#e0e7ff',
  },
  countryText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 17,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#222',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    alignItems: 'center',
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  resendBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  resendText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
  resendDisabled: {
    color: '#9ca3af',
  },
  error: {
    marginBottom: 8,
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default styles;
