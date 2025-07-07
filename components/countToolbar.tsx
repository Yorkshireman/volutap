import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import Snackbar from 'react-native-snackbar';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import type {
  Count,
  DbCount,
  SetCount,
  SetShowEditInputField,
  SetShowSaveInputField,
  SetTitleToSave
} from '../types';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { onPressDelete, onPressReset, onPressStartNewCountButton } from '../utils';

const screenWidth = Dimensions.get('window').width;
const TOOLBAR_ICON_SIZE = screenWidth < 400 ? 48 : screenWidth < 430 ? 54 : 64;

interface CountToolbarProps {
  count: Count;
  setCount: SetCount;
  setShowEditInputField: SetShowEditInputField;
  setShowSaveInputField: SetShowSaveInputField;
  setTitleToSave: SetTitleToSave;
}

export const CountToolbar = ({
  count,
  setCount,
  setShowEditInputField,
  setShowSaveInputField,
  setTitleToSave
}: CountToolbarProps) => {
  const db = useSQLiteContext();
  const [infoSnackbarIsOpen, setInfoSnackbarIsOpen] = useState(false);

  const onPressEditButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditInputField(true);
    setTitleToSave(count.title || 'Name');
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
        onPress: () => {
          Snackbar.dismiss();
          setInfoSnackbarIsOpen(false);
        },
        text: 'Dismiss',
        textColor: 'black'
      },
      backgroundColor: '#758BFD',
      duration: Snackbar.LENGTH_INDEFINITE,
      text:
        `Created  ${new Date(dbCount.createdAt || '').toLocaleString(undefined, {
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          second: '2-digit',
          weekday: 'short',
          year: 'numeric'
        })}\n` +
        `Updated ${new Date(dbCount.lastModified || '').toLocaleString(undefined, {
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          second: '2-digit',
          weekday: 'short',
          year: 'numeric'
        })}`,
      textColor: 'black'
    });

    setInfoSnackbarIsOpen(true);
  };

  const onPressSaveButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSaveInputField(true);
  };

  return (
    <View style={{ gap: 10 }}>
      {count.id && (
        <View style={{ flexDirection: 'row', gap: 20 }}>
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
            <Ionicons color={'#fff'} name='information-circle-outline' size={TOOLBAR_ICON_SIZE} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressEditButton} style={styles.refreshButton}>
            <Ionicons color={'#fff'} name='pencil' size={TOOLBAR_ICON_SIZE} />
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <TouchableOpacity
          onPress={() => onPressReset(count, setCount)}
          style={styles.refreshButton}
        >
          <Ionicons color={'#fff'} name='refresh-outline' size={TOOLBAR_ICON_SIZE} />
        </TouchableOpacity>
        {count.id && (
          <>
            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.refreshButton}>
              <Ionicons color={'#fff'} name='settings-outline' size={TOOLBAR_ICON_SIZE} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressStartNewCountButton(count, db, setCount)}
              style={styles.refreshButton}
            >
              <Ionicons color={'#fff'} name='create-outline' size={TOOLBAR_ICON_SIZE} />
            </TouchableOpacity>
          </>
        )}
        {!count.id && (
          <TouchableOpacity onPress={onPressSaveButton} style={styles.saveButton}>
            <Ionicons color={'#fff'} name='save-outline' size={TOOLBAR_ICON_SIZE} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  refreshButton: {
    padding: 5
  },
  saveButton: {
    padding: 5
  }
});
