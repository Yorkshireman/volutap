import * as Device from 'expo-device';
import { CountingModeContext } from '../../contexts';
import { countsVar } from '../../reactiveVars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReactiveVar } from '@apollo/client';
import {
  CountingButtons,
  CountSelector,
  CountToolbar,
  EditCountTitleInputField,
  SaveCountInputField,
  SwitchCountModeButton
} from '../../components';
import { StyleSheet, Text, View } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import {
  useFetchAndSetCountsOnMount,
  usePersistCurrentCount,
  useSetCountOnVolumeChange
} from '../../hooks';

export default function Index() {
  const counts = useReactiveVar(countsVar);
  const { countingWithVolumeButtons } = useContext(CountingModeContext);
  const [isIpad, setIsIpad] = useState(false);
  const [showEditInputField, setShowEditInputField] = useState(false);
  const [showSaveInputField, setShowSaveInputField] = useState(false);
  const [titleToSave, setTitleToSave] = useState('');
  // useFetchAndSetCountsOnMount();
  // usePersistCurrentCount();
  // useSetCountOnVolumeChange(countingWithVolumeButtons);

  useEffect(() => {
    setIsIpad(Device.deviceType === Device.DeviceType.TABLET);
  }, []);

  const currentCount = counts.find(count => count.currentlyCounting);
  if (!currentCount) return null;

  return (
    <SafeAreaView style={{ backgroundColor: '#27187E', flex: 1 }}>
      <View
        style={{
          ...styles.container,
          justifyContent: countingWithVolumeButtons ? 'center' : 'space-between'
        }}
      >
        {/* {!showSaveInputField && !showEditInputField && (
          <CountSelector setShowSaveInputField={setShowSaveInputField} />
        )} */}
        {/* <SaveCountInputField
          setShowSaveInputField={setShowSaveInputField}
          setTitleToSave={setTitleToSave}
          showSaveInputField={showSaveInputField}
          titleToSave={titleToSave}
        /> */}
        {/* <EditCountTitleInputField
          setShowEditInputField={setShowEditInputField}
          setTitleToSave={setTitleToSave}
          showEditInputField={showEditInputField}
          titleToSave={titleToSave}
        /> */}
        <Text
          adjustsFontSizeToFit={isIpad ? false : true}
          numberOfLines={1}
          style={{ ...styles.count, fontSize: isIpad ? 300 : 200 }}
        >
          {currentCount.value}
        </Text>
        {/* <CountToolbar
          count={currentCount}
          setShowEditInputField={setShowEditInputField}
          setShowSaveInputField={setShowSaveInputField}
          setTitleToSave={setTitleToSave}
        /> */}
        <SwitchCountModeButton />
        {!countingWithVolumeButtons && <CountingButtons />}
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
  }
});
