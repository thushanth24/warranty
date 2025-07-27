import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

const options = [
  { label: 'Add Warranty', key: 'warranty' },
  { label: 'Add Subscription', key: 'subscription' },
  { label: 'Add Reminder', key: 'reminder' },
];

export default function AddActionSheet({ visible, onClose, onSelect }: {
  visible: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={styles.button}
              onPress={() => {
                onClose();
                onSelect(opt.key);
              }}
            >
              <Text style={styles.buttonText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
            <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
  },
  button: {
    paddingVertical: 18,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  buttonText: {
    fontSize: 18,
    color: '#222',
  },
  cancel: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  cancelText: {
    color: '#e11d48',
    fontWeight: 'bold',
  },
});
