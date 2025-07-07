import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import type { Count } from '../types';
import { CountingModeContext } from '../contexts';
import { initializeApp } from 'firebase/app';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CountSelector,
  CountToolbar,
  EditCountTitleInputField,
  SaveCountInputField
} from '../components';
import { getDatabase, ref, runTransaction } from 'firebase/database';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import {
  useFetchAndSetCurrentCountAndIdOnMount,
  usePersistCurrentCount,
  useSetCountOnVolumeChange
} from '../hooks';

const firebaseConfig = {
  apiKey: 'AIzaSyA4ugb38YbH64adnBR2wvDXaltzaIMeZuc',
  appId: '1:929009834313:web:e70f631e187a65597fa298',
  authDomain: 'counter-7b22f.firebaseapp.com',
  databaseURL: 'https://counter-7b22f-default-rtdb.firebaseio.com',
  messagingSenderId: '929009834313',
  projectId: 'counter-7b22f',
  storageBucket: 'counter-7b22f.firebasestorage.app'
};

const app = initializeApp(firebaseConfig);
const firebaseDb = getDatabase(app);

export default function Index() {
  const [count, setCount] = useState<Count>({ value: 0 });
  const { countingWithVolumeButtons, setCountingWithVolumeButtons } =
    useContext(CountingModeContext);
  const [isIpad, setIsIpad] = useState(false);
  const [showEditInputField, setShowEditInputField] = useState(false);
  const [showSaveInputField, setShowSaveInputField] = useState(false);
  const [titleToSave, setTitleToSave] = useState('');
  const [buttonHeight, setButtonHeight] = useState(0);
  useFetchAndSetCurrentCountAndIdOnMount(setCount);
  usePersistCurrentCount(count);
  useSetCountOnVolumeChange(countingWithVolumeButtons, count, setCount);

  const roomsRef = ref(firebaseDb, 'rooms/global/count');

  useEffect(() => {
    setIsIpad(Device.deviceType === Device.DeviceType.TABLET);
  }, []);

  useEffect(() => {
    runTransaction(roomsRef, () => count.value);
  }, [count, roomsRef]);

  const onPressDecrementButton = () => {
    if (count.value === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(prev => ({ ...prev, value: prev.value - 1 }));
  };

  const onPressIncrementButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(prev => ({ ...prev, value: prev.value + 1 }));
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
        {!showSaveInputField && !showEditInputField && (
          <CountSelector
            count={count}
            setCount={setCount}
            setShowSaveInputField={setShowSaveInputField}
          />
        )}
        <SaveCountInputField
          count={count}
          setCount={setCount}
          setShowSaveInputField={setShowSaveInputField}
          setTitleToSave={setTitleToSave}
          showSaveInputField={showSaveInputField}
          titleToSave={titleToSave}
        />
        <EditCountTitleInputField
          count={count}
          setCount={setCount}
          setShowEditInputField={setShowEditInputField}
          setTitleToSave={setTitleToSave}
          showEditInputField={showEditInputField}
          titleToSave={titleToSave}
        />
        <Text
          adjustsFontSizeToFit={isIpad ? false : true}
          numberOfLines={1}
          style={{ ...styles.count, fontSize: isIpad ? 300 : 200 }}
        >
          {count.value}
        </Text>
        <CountToolbar
          count={count}
          setCount={setCount}
          setShowEditInputField={setShowEditInputField}
          setShowSaveInputField={setShowSaveInputField}
          setTitleToSave={setTitleToSave}
        />
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
          <View
            style={styles.countButtonsWrapper}
            onLayout={e => setButtonHeight(e.nativeEvent.layout.height)}
          >
            <TouchableOpacity onPress={onPressDecrementButton} style={styles.countButton}>
              <Ionicons
                color={'#fff'}
                name='remove-outline'
                size={Math.min(buttonHeight ? buttonHeight * 0.4 : 72, 72)}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressIncrementButton} style={styles.countButton}>
              <Ionicons
                color={'#fff'}
                name='add-outline'
                size={Math.min(buttonHeight ? buttonHeight * 0.4 : 72, 72)}
              />
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
    alignSelf: 'center',
    backgroundColor: '#27187E',
    flex: 1,
    gap: 25,
    justifyContent: 'space-between',
    maxWidth: 768,
    paddingBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%'
  },
  count: {
    color: '#fff'
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
