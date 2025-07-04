import * as Haptics from 'expo-haptics';
import type { Count, DbCount } from '../types';
import { CountingModeContext } from '../contexts';
import { CountSelector } from '../components';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Snackbar from 'react-native-snackbar';
import { useSQLiteContext } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import { onPressDelete, onPressReset, onPressStartNewCountButton } from '../utils';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  useFetchAndSetCurrentCountAndIdOnMount,
  usePersistCurrentCountAndId,
  useSetCountOnVolumeChange
} from '../hooks';

const TOOLBAR_ICON_SIZE = 64;

export default function Index() {
  const [count, setCount] = useState<Count>({ value: 0 });
  const { countingWithVolumeButtons, setCountingWithVolumeButtons } =
    useContext(CountingModeContext);
  const db = useSQLiteContext();
  const editInputFieldRef = useRef<TextInput>(null);
  const saveInputFieldRef = useRef<TextInput>(null);
  const [infoSnackbarIsOpen, setInfoSnackbarIsOpen] = useState(false);
  const [showEditInputField, setShowEditInputField] = useState(false);
  const [showSaveInputField, setShowSaveInputField] = useState(false);
  const [titleToSave, onChangeTitleToSave] = useState('');
  useFetchAndSetCurrentCountAndIdOnMount(setCount);
  usePersistCurrentCountAndId(count, count.id);
  useSetCountOnVolumeChange(countingWithVolumeButtons, count, setCount);

  useEffect(() => {
    if (!showEditInputField) return;
    editInputFieldRef.current?.focus();
  }, [showEditInputField]);

  useEffect(() => {
    if (!showSaveInputField) return;
    saveInputFieldRef.current?.focus();
  }, [showSaveInputField]);

  const onPressDecrementButton = () => {
    if (count.value === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(prev => ({ ...prev, value: prev.value - 1 }));
  };

  const onPressEditButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditInputField(true);
    onChangeTitleToSave(count.title || 'Name');
  };

  const onPressIncrementButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(prev => ({ ...prev, value: prev.value + 1 }));
  };

  const onPressInfo = async (id: Count['id']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (infoSnackbarIsOpen) {
      Snackbar.dismiss();
      setInfoSnackbarIsOpen(false);
      return;
    }

    if (!id) {
      console.error('onPressInfo(): No ID provided for count info.');
      return;
    }

    const dbCount: DbCount | null = await db.getFirstAsync(
      'SELECT * FROM savedCounts WHERE id = ?',
      [id]
    );

    if (!dbCount) {
      console.error(`onPressInfo(): No count found with ID ${id}.`);
      return;
    }

    Snackbar.show({
      action: {
        text: 'Dismiss',
        textColor: 'black',
        onPress: () => {
          Snackbar.dismiss();
          setInfoSnackbarIsOpen(false);
        }
      },
      backgroundColor: '#758BFD',
      duration: Snackbar.LENGTH_INDEFINITE,
      text:
        `Created on ${new Date(dbCount.createdAt || '').toLocaleString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}\n` +
        `Last modified on ${new Date(dbCount.lastModified || '').toLocaleString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
      textColor: 'black'
    });

    setInfoSnackbarIsOpen(true);
  };

  const onPressSaveButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSaveInputField(true);
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
        'INSERT INTO savedCounts (value, createdAt, currentlyCounting, id, lastModified, title) VALUES (?, ?, ?, ?, ?, ?)',
        count.value,
        now,
        true,
        id,
        now,
        trimmed
      );

      Snackbar.show({
        backgroundColor: '#758BFD',
        duration: Snackbar.LENGTH_LONG,
        text: 'Saved!',
        textColor: 'black'
      });

      onChangeTitleToSave('');
      setCount({
        // dry up?
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

  const onSubmitEditingExistingCountTitle = async () => {
    const trimmed = titleToSave.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();

    if (!count.id) {
      console.error('onSubmitEditingExistingCountTitle(): No count ID available.');
      return;
    }

    try {
      console.log(`Updating Count title in the DB, title: ${trimmed}, id: ${count.id}.`);
      await db.runAsync('UPDATE savedCounts SET title = ? WHERE id = ?', [trimmed, count.id]);
      Snackbar.show({
        backgroundColor: '#758BFD',
        duration: Snackbar.LENGTH_LONG,
        text: 'Saved!',
        textColor: 'black'
      });

      onChangeTitleToSave('');
      setCount(prev => ({ ...prev, title: trimmed }));
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
        {!showSaveInputField && !showEditInputField && (
          <CountSelector
            count={count}
            setCount={setCount}
            setShowSaveInputField={setShowSaveInputField}
          />
        )}
        <TextInput
          maxLength={36}
          onBlur={() => {
            if (titleToSave.trim()) return;
            setShowSaveInputField(false);
          }}
          onChangeText={onChangeTitleToSave}
          onSubmitEditing={onSubmitEditing}
          placeholder={'Name'}
          placeholderTextColor={'#fff'}
          ref={saveInputFieldRef}
          returnKeyType='done'
          style={{ ...styles.saveInputField, display: showSaveInputField ? 'flex' : 'none' }}
          value={titleToSave}
        />
        <TextInput
          maxLength={36}
          onBlur={() => {
            if (titleToSave.trim()) return;
            setShowEditInputField(false);
          }}
          onChangeText={onChangeTitleToSave}
          onSubmitEditing={onSubmitEditingExistingCountTitle}
          placeholderTextColor={'#fff'}
          ref={editInputFieldRef}
          returnKeyType='done'
          style={{ ...styles.saveInputField, display: showEditInputField ? 'flex' : 'none' }}
          value={titleToSave}
        />
        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.count}>
          {count.value}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {count.id && (
            <>
              <TouchableOpacity
                onPress={() => onPressDelete(count, db, setCount)}
                style={styles.refreshButton}
              >
                <Ionicons color={'#fff'} name='trash-outline' size={TOOLBAR_ICON_SIZE} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => count.id && onPressInfo(count.id)}
                style={styles.refreshButton}
              >
                <Ionicons
                  color={'#fff'}
                  name='information-circle-outline'
                  size={TOOLBAR_ICON_SIZE}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onPressEditButton} style={styles.refreshButton}>
                <Ionicons color={'#fff'} name='pencil' size={TOOLBAR_ICON_SIZE} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            onPress={() => onPressReset(count, setCount)}
            style={styles.refreshButton}
          >
            <Ionicons color={'#fff'} name='refresh-outline' size={TOOLBAR_ICON_SIZE} />
          </TouchableOpacity>
          {count.id && (
            <TouchableOpacity
              onPress={() => onPressStartNewCountButton(count, db, setCount)}
              style={styles.refreshButton}
            >
              <Ionicons color={'#fff'} name='create-outline' size={TOOLBAR_ICON_SIZE} />
            </TouchableOpacity>
          )}
          {!count.id && (
            <TouchableOpacity onPress={onPressSaveButton} style={styles.saveButton}>
              <Ionicons color={'#fff'} name='save-outline' size={TOOLBAR_ICON_SIZE} />
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
