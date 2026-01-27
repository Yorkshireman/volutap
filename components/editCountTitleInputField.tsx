import { countsVar } from '../reactiveVars';
import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { sanitiseCountForTracking, track, updateCountInDb } from '../utils';
import { Screens, SetShowEditInputField, TrackingEventNames } from '../types';
import { StyleSheet, TextInput } from 'react-native';
import { useEffect, useRef } from 'react';

interface EditCountTitleInputFieldProps {
  setShowEditInputField: SetShowEditInputField;
  setTitleToSave: (title: string) => void;
  showEditInputField: boolean;
  titleToSave: string;
}

export const EditCountTitleInputField = ({
  setShowEditInputField,
  setTitleToSave,
  showEditInputField,
  titleToSave
}: EditCountTitleInputFieldProps) => {
  const counts = useReactiveVar(countsVar);
  const db = useSQLiteContext();
  const editInputFieldRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!showEditInputField) return;
    editInputFieldRef.current?.focus();
  }, [showEditInputField]);

  const count = counts.find(c => c.currentlyCounting);
  if (!count) return null;

  const onSubmit = async () => {
    const trimmed = titleToSave.trim();
    if (!trimmed) return;

    if (!count.id) {
      console.error('EditCountTitleInputField, onSubmit(): No count ID available.');
      return;
    }

    const updatedCount = { ...count, title: trimmed };
    const updatedCounts = counts.map(c => (c.id === count.id ? updatedCount : c));

    await updateCountInDb({
      db,
      successCallback: () => {
        countsVar(updatedCounts);
        setTitleToSave('');

        Snackbar.show({
          backgroundColor: '#758BFD',
          duration: Snackbar.LENGTH_LONG,
          text: 'Saved!',
          textColor: 'black'
        });

        track(
          TrackingEventNames.COUNT_TITLE_UPDATED,
          {
            count: sanitiseCountForTracking(updatedCount),
            screen: Screens.SINGLE,
            source: 'editCountTitleInputField'
          },
          'EditCountTitleInputField.tsx'
        );
      },
      updatedCount
    });
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
