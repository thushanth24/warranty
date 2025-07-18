import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface OtpInputProps {
  values: string[];
  onChange: (index: number, value: string) => void;
  length?: number;
}

export default function OtpInput({ values, onChange, length = 6 }: OtpInputProps) {
  const inputRefs = React.useRef<(TextInput | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '');
    onChange(i, digit);
    if (digit && i < length - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, i: number) => {
    if (e.nativeEvent.key === 'Backspace' && !values[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={ref => { inputRefs.current[i] = ref; }}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={1}
          value={values[i] || ''}
          onChangeText={val => handleChange(i, val)}
          onKeyPress={e => handleKeyPress(e, i)}
          autoFocus={i === 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: 40,
    height: 48,
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 4,
    color: '#222',
    backgroundColor: '#fff',
  },
});
