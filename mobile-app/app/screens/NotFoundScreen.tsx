import React from 'react';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <Text className="text-xl font-bold text-black dark:text-white">Not Found</Text>
    </View>
  );
}
