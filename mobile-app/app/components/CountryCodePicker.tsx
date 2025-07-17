import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

const COUNTRY_CODES = [
  { code: '+1', country: 'United States' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+91', country: 'India' },
  { code: '+971', country: 'UAE' },
  { code: '+61', country: 'Australia' },
  // Add more as needed
];

interface CountryCodePickerProps {
  visible: boolean;
  onSelect: (code: string) => void;
  onClose: () => void;
}

export default function CountryCodePicker({ visible, onSelect, onClose }: CountryCodePickerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <FlatList
            data={COUNTRY_CODES}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => { onSelect(item.code); onClose(); }}>
                <Text style={styles.code}>{item.code}</Text>
                <Text style={styles.country}>{item.country}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: 320,
    maxHeight: 400,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  code: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
    width: 50,
  },
  country: {
    color: '#222',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#e8f0fe',
  },
});
