import Ionicons from '@expo/vector-icons/Ionicons';
import { onPressReset } from '../utils';
import { useSetCountOnVolumeChange } from '../hooks';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { count, setCount } = useSetCountOnVolumeChange();

  return (
    <View style={styles.container}>
      <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.count}>
        {count}
      </Text>
      <TouchableOpacity onPress={() => onPressReset(count, setCount)} style={{ padding: 5 }}>
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
