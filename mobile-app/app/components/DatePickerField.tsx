import React from 'react';
import { Platform, TouchableOpacity, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerFieldProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  maximumDate?: Date;
}

export default function DatePickerField({ value, onChange, label, maximumDate }: DatePickerFieldProps) {
  const [show, setShow] = React.useState(false);

  function handleChange(event: any, selectedDate?: Date) {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      onChange(iso);
    }
  }

  return (
    <View style={{ marginBottom: 16 }}>
      {label && <Text style={{ marginBottom: 4 }}>{label}</Text>}
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8 }}
      >
        <Text style={{ color: value ? '#222' : '#888' }}>{value || 'Select Date'}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={maximumDate || new Date()}
        />
      )}
    </View>
  );
}
