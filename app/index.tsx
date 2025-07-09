import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { CountingModeContext } from '../contexts';
import { countVar } from '../reactiveVars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReactiveVar } from '@apollo/client';
import {
  CountSelector,
  CountToolbar,
  EditCountTitleInputField,
  SaveCountInputField,
  SwitchCountModeButton
} from '../components';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import {
  useFetchAndSetCurrentCountAndIdOnMount,
  usePersistCurrentCount,
  useSetCountOnVolumeChange
} from '../hooks';

export default function Index() {
  const count = useReactiveVar(countVar);
  const { countingWithVolumeButtons } = useContext(CountingModeContext);
  const [isIpad, setIsIpad] = useState(false);
  const [showEditInputField, setShowEditInputField] = useState(false);
  const [showSaveInputField, setShowSaveInputField] = useState(false);
  const [titleToSave, setTitleToSave] = useState('');
  const [buttonHeight, setButtonHeight] = useState(0);
  useFetchAndSetCurrentCountAndIdOnMount();
  usePersistCurrentCount();
  useSetCountOnVolumeChange(countingWithVolumeButtons);

  useEffect(() => {
    setIsIpad(Device.deviceType === Device.DeviceType.TABLET);
  }, []);

  const onPressDecrementButton = () => {
    if (count.value === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    countVar({ ...count, value: count.value - 1 });
  };

  const onPressIncrementButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    countVar({ ...count, value: count.value + 1 });
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
          <CountSelector setShowSaveInputField={setShowSaveInputField} />
        )}
        <SaveCountInputField
          setShowSaveInputField={setShowSaveInputField}
          setTitleToSave={setTitleToSave}
          showSaveInputField={showSaveInputField}
          titleToSave={titleToSave}
        />
        <EditCountTitleInputField
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
          setShowEditInputField={setShowEditInputField}
          setShowSaveInputField={setShowSaveInputField}
          setTitleToSave={setTitleToSave}
        />
        <SwitchCountModeButton />
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
    flex: 2,
    flexDirection: 'row',
    gap: 30
  }
});
