import Snackbar from 'react-native-snackbar';
import { useSQLiteContext } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import type { Count, SetCount, SetShowSaveInputField, SetTitleToSave } from '../types';
import { StyleSheet, TextInput } from 'react-native';
import { useEffect, useRef } from 'react';

interface SaveCountInputFieldProps {
  count: Count;
  setCount: SetCount;
  setShowSaveInputField: SetShowSaveInputField;
  setTitleToSave: SetTitleToSave;
  showSaveInputField: boolean;
  titleToSave: string;
}

export const SaveCountInputField = ({
  count,
  setCount,
  setShowSaveInputField,
  setTitleToSave,
  showSaveInputField,
  titleToSave
}: SaveCountInputFieldProps) => {
  const db = useSQLiteContext();
  const saveInputFieldRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!showSaveInputField) return;
    saveInputFieldRef.current?.focus();
  }, [showSaveInputField]);

  const onSubmitEditing = async () => {
    const trimmed = titleToSave.trim();
    if (!trimmed) return;

    const id = uuid.v4();
    const now = new Date().toISOString();

    try {
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

      setTitleToSave('');
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

  return (
    <TextInput
      maxLength={36}
      onBlur={() => {
        if (titleToSave.trim()) return;
        setShowSaveInputField(false);
      }}
      onChangeText={setTitleToSave}
      onSubmitEditing={onSubmitEditing}
      placeholder={'Name'}
      placeholderTextColor={'#fff'}
      ref={saveInputFieldRef}
      returnKeyType='done'
      style={{ ...styles.saveInputField, display: showSaveInputField ? 'flex' : 'none' }}
      value={titleToSave}
    />
  );
};

const styles = StyleSheet.create({
  saveInputField: {
    borderColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    color: '#fff',
    fontSize: 18,
    padding: 10,
    width: '100%'
  }
});
