import { countsVar } from '../reactiveVars';
import { saveCountToDb } from '../utils';
import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
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
  const counts = useReactiveVar(countsVar);
  const db = useSQLiteContext();
  const saveInputFieldRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!showSaveInputField) return;
    saveInputFieldRef.current?.focus();
  }, [showSaveInputField]);

  const count = counts.find(c => c.currentlyCounting);
  if (!count) return null;

  const onSubmitEditing = async () => {
    const trimmed = titleToSave.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();
    const updatedCount = {
      ...count,
      createdAt: now,
      lastModified: now,
      saved: 1 as const,
      title: trimmed
    };

    await saveCountToDb(updatedCount, db);

    Snackbar.show({
      backgroundColor: '#758BFD',
      duration: Snackbar.LENGTH_LONG,
      text: 'Saved!',
      textColor: 'black'
    });

    setTitleToSave('');
    const updatedCounts = [updatedCount, ...counts.filter(c => c.id !== count.id)];
    countsVar(updatedCounts);
    setShowSaveInputField(false);
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
