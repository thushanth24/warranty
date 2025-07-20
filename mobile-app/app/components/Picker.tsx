import React from 'react';
import { Picker as RNPicker } from '@react-native-picker/picker';
// If you see a module not found error for '@react-native-picker/picker', run:
//   npm install @react-native-picker/picker
// in your mobile-app directory.

export type PickerProps = React.ComponentProps<typeof RNPicker>;

export const Picker: React.FC<PickerProps> & { Item: typeof RNPicker.Item } = (props) => {
  return <RNPicker {...props} />;
};
// Attach Picker.Item for usage like <Picker.Item ... />
Picker.Item = RNPicker.Item;

export default Picker;
