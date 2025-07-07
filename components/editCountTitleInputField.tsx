import Snackbar from 'react-native-snackbar';
import { useSQLiteContext } from 'expo-sqlite';
import type { Count, SetCount, SetShowEditInputField } from '../types';
import { StyleSheet, TextInput } from 'react-native';
import { useEffect, useRef } from 'react';

interface EditCountTitleInputFieldProps {
  count: Count;
  setCount: SetCount;
  setShowEditInputField: SetShowEditInputField;
  setTitleToSave: (title: string) => void;
  showEditInputField: boolean;
  titleToSave: string;
}

export const EditCountTitleInputField = ({
  count,
  setCount,
  setShowEditInputField,
  setTitleToSave,
  showEditInputField,
  titleToSave
}: EditCountTitleInputFieldProps) => {
  const db = useSQLiteContext();
  const editInputFieldRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!showEditInputField) return;
    editInputFieldRef.current?.focus();
  }, [showEditInputField]);

  const onSubmit = async () => {
    const trimmed = titleToSave.trim();
    if (!trimmed) return;

    if (!count.id) {
      console.error('EditCountTitleInputField, onSubmit(): No count ID available.');
      return;
    }

    try {
      await db.runAsync('UPDATE savedCounts SET title = ? WHERE id = ?', [trimmed, count.id]);
      Snackbar.show({
        backgroundColor: '#758BFD',
        duration: Snackbar.LENGTH_LONG,
        text: 'Saved!',
        textColor: 'black'
      });

      setTitleToSave('');
      setCount(prev => ({ ...prev, title: trimmed }));
    } catch (e) {
      console.error('DB error: ', e);
    }
  };
  return (
    <TextInput
      maxLength={36}
      onBlur={() => {
        if (titleToSave.trim()) return;
        setShowEditInputField(false);
      }}
      onChangeText={setTitleToSave}
      onSubmitEditing={onSubmit}
      placeholderTextColor={'#fff'}
      ref={editInputFieldRef}
      returnKeyType='done'
      style={{ ...styles.saveInputField, display: showEditInputField ? 'flex' : 'none' }}
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
