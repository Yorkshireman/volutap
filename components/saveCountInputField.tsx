import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import { countVar, savedCountsVar } from '../reactiveVars';
import type { SavedCount, SetShowSaveInputField, SetTitleToSave } from '../types';
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
  const savedCounts = useReactiveVar(savedCountsVar);
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
    const updatedCount: SavedCount = {
      alerts: count.alerts,
      createdAt: now,
      currentlyCounting: true,
      id,
      lastModified: now,
      title: trimmed,
      value: count.value
    };

    try {
      await db.runAsync(
        'INSERT INTO savedCounts (alerts, value, createdAt, currentlyCounting, id, lastModified, title) VALUES (?, ?, ?, ?, ?, ?, ?)',
        JSON.stringify(count.alerts),
        updatedCount.value,
        updatedCount.createdAt,
        updatedCount.currentlyCounting,
        updatedCount.id,
        updatedCount.lastModified,
        updatedCount.title
      );

      Snackbar.show({
        backgroundColor: '#758BFD',
        duration: Snackbar.LENGTH_LONG,
        text: 'Saved!',
        textColor: 'black'
      });

      setTitleToSave('');
      countVar(updatedCount);
      savedCountsVar([...(savedCounts || []), updatedCount]);
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
