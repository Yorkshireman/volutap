import { countVar } from '../reactiveVars';
import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import type { SetShowSaveInputField, SetTitleToSave } from '../types';
import { StyleSheet, TextInput } from 'react-native';
import { useEffect, useRef } from 'react';

interface SaveCountInputFieldProps {
  setShowSaveInputField: SetShowSaveInputField;
  setTitleToSave: SetTitleToSave;
  showSaveInputField: boolean;
  titleToSave: string;
}

export const SaveCountInputField = ({
  setShowSaveInputField,
  setTitleToSave,
  showSaveInputField,
  titleToSave
}: SaveCountInputFieldProps) => {
  const count = useReactiveVar(countVar);
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
        'INSERT INTO savedCounts (alerts, value, createdAt, currentlyCounting, id, lastModified, title) VALUES (?, ?, ?, ?, ?, ?, ?)',
        JSON.stringify(count.alerts),
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
      countVar({
        // dry up?
        alerts: count.alerts,
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
