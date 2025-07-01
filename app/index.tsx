import { CountingModeContext } from '../contexts';
import Ionicons from '@expo/vector-icons/Ionicons';
import { onPressReset } from '../utils';
import { useContext } from 'react';
import { useSetCountOnVolumeChange } from '../hooks';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { count, setCount } = useSetCountOnVolumeChange();
  const { countingWithVolumeButtons, setCountingWithVolumeButtons } =
    useContext(CountingModeContext);

  const onPressSwitchCountModeButton = () => {
    setCountingWithVolumeButtons(!countingWithVolumeButtons);
  };

  return (
    <View style={styles.container}>
      <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.count}>
        {count}
      </Text>
      <TouchableOpacity onPress={() => onPressReset(count, setCount)} style={styles.refreshButton}>
        <Ionicons color={'#fff'} name='refresh-outline' size={72} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressSwitchCountModeButton} style={styles.switchCountModeButton}>
        <Text style={styles.switchCountModeButtonText}>
          {countingWithVolumeButtons
            ? 'Switch to using screen buttons'
            : 'Switch to using volume buttons'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#27187E',
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    maxWidth: 768,
    paddingHorizontal: 20
  },
  count: {
    color: '#fff',
    fontSize: 200
  },
  refreshButton: {
    padding: 5
  },
  switchCountModeButton: {
    borderColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    padding: 18
  },
  switchCountModeButtonText: {
    color: '#fff',
    fontSize: 18
  }
});
