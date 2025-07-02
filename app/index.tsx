import * as Haptics from 'expo-haptics';
import { CountingModeContext } from '../contexts';
import Ionicons from '@expo/vector-icons/Ionicons';
import { onPressReset } from '../utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  useFetchAndSetCurrentCountOnMount,
  usePersistCurrentCount,
  useSetCountOnVolumeChange
} from '../hooks';

export default function Index() {
  const { countingWithVolumeButtons, setCountingWithVolumeButtons } =
    useContext(CountingModeContext);
  const { count, setCount } = useSetCountOnVolumeChange(countingWithVolumeButtons);
  useFetchAndSetCurrentCountOnMount(setCount);
  usePersistCurrentCount(count);

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
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => onPressReset(count, setCount)}
            style={styles.refreshButton}
          >
            <Ionicons color={'#fff'} name='refresh-outline' size={72} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => null} style={styles.saveButton}>
            <Ionicons color={'#fff'} name='save-outline' size={72} />
          </TouchableOpacity>
        </View>
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
            <TouchableOpacity onPress={onPressDecrementButton} style={styles.countButton}>
              <Ionicons color={'#fff'} name='remove-outline' size={72} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressIncrementButton} style={styles.countButton}>
              <Ionicons color={'#fff'} name='add-outline' size={72} />
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
    gap: 25,
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
  saveButton: {
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
    fontSize: 18,
    textAlign: 'center'
  },
  switchCountModeButtonWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%'
  }
});
