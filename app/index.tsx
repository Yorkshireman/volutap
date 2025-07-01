import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSetCountOnVolumeChange } from '../hooks';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { count, setCount } = useSetCountOnVolumeChange();

  const onPressReset = () => {
    if (count === 0) return;
    Alert.alert(
      'Reset',
      'Are you sure you want to reset the counter to zero? This cannot be undone.',
      [
        {
          style: 'cancel',
          text: 'Cancel'
        },
        {
          onPress: async () => {
            setCount(0);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          },
          text: 'OK'
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.count}>
        {count}
      </Text>
      <TouchableOpacity onPress={onPressReset} style={{ padding: 5 }}>
        <Ionicons color={'#fff'} name='refresh-outline' size={72} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#27187E',
    flex: 1,
    justifyContent: 'center',
    maxWidth: 768,
    paddingHorizontal: 20
  },
  count: {
    color: '#fff',
    fontSize: 200
  }
});
