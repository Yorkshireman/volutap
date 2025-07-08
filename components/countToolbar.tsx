import * as Haptics from 'expo-haptics';
import { countVar } from '../reactiveVars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Menu } from 'react-native-paper';
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
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const onPressEditButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditInputField(true);
    setShowOptionsMenu(false);
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

  const onPressOptionsButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowOptionsMenu(prev => !prev);
  };

  const onPressSaveButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSaveInputField(true);
  };

  const onPressSettingsButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    countVar({ ...count, alerts: [] });
    router.push(`/settings?id=${count.id}`);
  };

  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      {count.id && (
        <TouchableOpacity onPress={() => count.id && onPressInfo(count.id)} style={styles.icon}>
          <Ionicons color={'#fff'} name='information-circle-outline' size={TOOLBAR_ICON_SIZE} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => onPressReset(count, setCount)} style={styles.icon}>
        <Ionicons color={'#fff'} name='refresh-outline' size={TOOLBAR_ICON_SIZE} />
      </TouchableOpacity>
      {!count.id && (
        <TouchableOpacity onPress={onPressSaveButton} style={styles.icon}>
          <Ionicons color={'#fff'} name='save-outline' size={TOOLBAR_ICON_SIZE} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onPressSettingsButton} style={styles.icon}>
        <Ionicons color={'#fff'} name='settings-outline' size={TOOLBAR_ICON_SIZE} />
      </TouchableOpacity>
      {count.id && (
        <>
          <TouchableOpacity
            onPress={() => onPressStartNewCountButton(count, db, setCount)}
            style={styles.icon}
          >
            <Ionicons color={'#fff'} name='create-outline' size={TOOLBAR_ICON_SIZE} />
          </TouchableOpacity>
          <Menu
            anchor={
              <TouchableOpacity onPress={onPressOptionsButton} style={styles.icon}>
                <Ionicons
                  color={'#fff'}
                  name='ellipsis-horizontal-circle'
                  size={TOOLBAR_ICON_SIZE}
                />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContentStyle}
            visible={showOptionsMenu}
            onDismiss={() => setShowOptionsMenu(false)}
          >
            <Menu.Item
              leadingIcon={() => <Ionicons color='#fff' name='pencil' size={24} />}
              onPress={onPressEditButton}
              title='Edit Name'
              titleStyle={styles.menuItemTitleStyle}
            />
            <Menu.Item
              leadingIcon={() => <Ionicons color='#fff' name='trash-outline' size={24} />}
              onPress={() => onPressDelete(count, db, setCount, setShowOptionsMenu)}
              title='Delete'
              titleStyle={styles.menuItemTitleStyle}
            />
          </Menu>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    padding: 5
  },
  menuContentStyle: {
    backgroundColor: '#27187E',
    borderColor: '#fff',
    borderWidth: 1,
    shadowColor: '#fff',
    shadowOffset: { height: 3, width: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  menuItemTitleStyle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
