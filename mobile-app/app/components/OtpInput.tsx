import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface OtpInputProps {
  values: string[];
  onChange: (index: number, value: string) => void;
  length?: number;
}

export default function OtpInput({ values, onChange, length = 6 }: OtpInputProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={1}
          value={values[i] || ''}
          onChangeText={val => onChange(i, val.replace(/\D/g, ''))}
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
