import * as Haptics from 'expo-haptics';
import type { Count } from '../types';
import { CountingModeContext } from '../contexts';
import Ionicons from '@expo/vector-icons/Ionicons';
import { onPressReset } from '../utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useContext, useRef, useState } from 'react';
import {
  useFetchAndSetCurrentCountAndIdOnMount,
  usePersistCurrentCountAndId,
  useSetCountOnVolumeChange
} from '../hooks';

export default function Index() {
  const [count, setCount] = useState<Count>({ value: 0 });
  const { countingWithVolumeButtons, setCountingWithVolumeButtons } =
    useContext(CountingModeContext);
  const db = useSQLiteContext();
  const saveInputFieldRef = useRef<TextInput>(null);
  const [showSaveInputField, setShowSaveInputField] = useState(false);
  const [titleToSave, onChangeTitleToSave] = useState('');
  useFetchAndSetCurrentCountAndIdOnMount(setCount);
  usePersistCurrentCountAndId(count, count.id);
  useSetCountOnVolumeChange(countingWithVolumeButtons, count, setCount);

  const onPressDecrementButton = () => {
    if (count.value === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(prev => ({ ...prev, value: prev.value - 1 }));
  };

  const onPressIncrementButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(prev => ({ ...prev, value: prev.value + 1 }));
  };

  const onPressSaveButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSaveInputField(true);
    saveInputFieldRef.current?.focus();
  };

  const onPressSwitchCountModeButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCountingWithVolumeButtons(!countingWithVolumeButtons);
  };

  const onSubmitEditing = async () => {
    const trimmed = titleToSave.trim();
    if (!trimmed) return;

    const id = uuid.v4();
    const now = new Date().toISOString();

    try {
      console.log(
        `Adding a new Count to the database, createdAt: ${now}, title: ${trimmed}, id: ${id}.`
      );

      await db.runAsync(
        'INSERT INTO savedCounts (count, createdAt, currentlyCounting, id, lastModified, title) VALUES (?, ?, ?, ?, ?, ?)',
        count.value,
        now,
        true,
        id,
        now,
        trimmed
      );

      onChangeTitleToSave('');
      setCount({
        createdAt: now,
        currentlyCounting: true,
        id,
        lastModified: now,
        title: trimmed,
        value: count.value
      });
    } catch (e) {
      console.error('DB error: ', e);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#27187E', flex: 1 }}>
      <View
        style={{
          ...styles.container,
          justifyContent: countingWithVolumeButtons ? 'center' : 'space-between'
        }}
      >
        <Text style={{ color: 'white' }}>{count.title}</Text>
        <TextInput
          ref={saveInputFieldRef}
          returnKeyType='done'
          style={{ ...styles.saveInputField, display: showSaveInputField ? 'flex' : 'none' }}
          onBlur={() => !titleToSave && setShowSaveInputField(false)}
          placeholderTextColor={'#fff'}
          onChangeText={onChangeTitleToSave}
          onSubmitEditing={onSubmitEditing}
          value={titleToSave}
          placeholder={'Name'}
        />
        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.count}>
          {count.value}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => onPressReset(count, setCount)}
            style={styles.refreshButton}
          >
            <Ionicons color={'#fff'} name='refresh-outline' size={72} />
          </TouchableOpacity>
          {!count.id && (
            <TouchableOpacity onPress={onPressSaveButton} style={styles.saveButton}>
              <Ionicons color={'#fff'} name='save-outline' size={72} />
            </TouchableOpacity>
          )}
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
  saveInputField: {
    borderColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    color: '#fff',
    fontSize: 18,
    padding: 10,
    width: '100%'
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
