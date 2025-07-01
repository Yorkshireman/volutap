import * as Haptics from 'expo-haptics';
import { CountingModeContext } from '../contexts';
import Ionicons from '@expo/vector-icons/Ionicons';
import { onPressReset } from '../utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { useSetCountOnVolumeChange } from '../hooks';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { countingWithVolumeButtons, setCountingWithVolumeButtons } =
    useContext(CountingModeContext);
  const { count, setCount } = useSetCountOnVolumeChange(countingWithVolumeButtons);

  const onPressDecrementButton = () => {
    if (count === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(prev => prev - 1);
  };

  const onPressIncrementButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(prev => prev + 1);
  };

  const onPressSwitchCountModeButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCountingWithVolumeButtons(!countingWithVolumeButtons);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#27187E', flex: 1 }}>
      <View
        style={{
          ...styles.container,
          justifyContent: countingWithVolumeButtons ? 'center' : 'space-between'
        }}
      >
        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.count}>
          {count}
        </Text>
        <TouchableOpacity
          onPress={() => onPressReset(count, setCount)}
          style={styles.refreshButton}
        >
          <Ionicons color={'#fff'} name='refresh-outline' size={72} />
        </TouchableOpacity>
        <View style={styles.switchCountModeButtonWrapper}>
          <TouchableOpacity
            onPress={onPressSwitchCountModeButton}
            style={styles.switchCountModeButton}
          >
            <Text style={styles.switchCountModeButtonText}>
              {countingWithVolumeButtons
                ? 'Switch to using screen buttons'
                : 'Switch to using volume buttons'}
            </Text>
          </TouchableOpacity>
        </View>
        {!countingWithVolumeButtons && (
          <View style={styles.countButtonsWrapper}>
            <TouchableOpacity onPress={onPressIncrementButton} style={styles.countButton}>
              <Text style={styles.countButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressDecrementButton} style={styles.countButton}>
              <Text style={styles.countButtonText}>-</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#27187E',
    flex: 1,
    gap: 20,
    justifyContent: 'space-between',
    maxWidth: 768,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  count: {
    color: '#fff',
    fontSize: 200
  },
  countButton: {
    alignItems: 'center',
    borderColor: '#fff',
    borderRadius: 50,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  countButtonText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold'
  },
  countButtonsWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: 30
  },
  refreshButton: {
    padding: 5
  },
  switchCountModeButton: {
    borderColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18
  },
  switchCountModeButtonText: {
    color: '#fff',
    fontSize: 18
  },
  switchCountModeButtonWrapper: {
    flex: 1,
    justifyContent: 'flex-end'
  }
});
