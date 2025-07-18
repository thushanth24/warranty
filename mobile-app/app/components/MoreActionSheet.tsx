import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

const options = [
  { label: 'Profile', route: '/(more-screens)/profile' },
  { label: 'Reminders', route: '/(more-screens)/reminders' },
  { label: 'Enhanced Warranty', route: '/(more-screens)/enhanced-warranty' },
  { label: 'Settings', route: '/(more-screens)/settings' },
];

export default function MoreActionSheet({ visible, onClose, onNavigate }: {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
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
              key={opt.label}
              style={styles.button}
              onPress={() => {
                onClose();
                onNavigate(opt.route);
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
