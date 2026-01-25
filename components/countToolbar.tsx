import * as Haptics from 'expo-haptics';
import { countsVar } from '../reactiveVars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Menu } from 'react-native-paper';
import { router } from 'expo-router';
import Snackbar from 'react-native-snackbar';
import { track } from '@amplitude/analytics-react-native';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { onPressDelete, onPressReset, onPressStartNewCountButton } from '../utils';
import type { SetShowEditInputField, SetShowSaveInputField, SetTitleToSave } from '../types';

const screenWidth = Dimensions.get('window').width;
const TOOLBAR_ICON_SIZE = screenWidth < 400 ? 48 : screenWidth < 430 ? 54 : 64;

interface CountToolbarProps {
  setShowEditInputField: SetShowEditInputField;
  setShowSaveInputField: SetShowSaveInputField;
  setTitleToSave: SetTitleToSave;
}

export const CountToolbar = ({
  setShowEditInputField,
  setShowSaveInputField,
  setTitleToSave
}: CountToolbarProps) => {
  const counts = useReactiveVar(countsVar);
  const db = useSQLiteContext();
  const [infoSnackbarIsOpen, setInfoSnackbarIsOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const count = counts.find(c => c.currentlyCounting);
  if (!count) return null;

  const onPressEditButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditInputField(true);
    setShowOptionsMenu(false);
    setTitleToSave(count.title || 'Name');
  };

  const onPressInfo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (infoSnackbarIsOpen) {
      Snackbar.dismiss();
      setInfoSnackbarIsOpen(false);
      track('count_info_dismissed', { source: 'button' });
      return;
    }

    Snackbar.show({
      action: {
        onPress: () => {
          Snackbar.dismiss();
          setInfoSnackbarIsOpen(false);
          track('count_info_dismissed', { source: 'button' });
        },
        text: 'Dismiss',
        textColor: 'black'
      },
      backgroundColor: '#758BFD',
      duration: Snackbar.LENGTH_INDEFINITE,
      text:
        `Created  ${new Date(count.createdAt).toLocaleString(undefined, {
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          second: '2-digit',
          weekday: 'short',
          year: 'numeric'
        })}\n` +
        `Updated ${new Date(count.lastModified).toLocaleString(undefined, {
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
    track('count_info_opened', { source: 'button' });
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
    router.push('/settings');
  };

  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      {count.id && (
        <TouchableOpacity onPress={() => count.id && onPressInfo()} style={styles.icon}>
          <Ionicons color={'#fff'} name='information-circle-outline' size={TOOLBAR_ICON_SIZE} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => onPressReset(count, countsVar, db)} style={styles.icon}>
        <Ionicons color={'#fff'} name='refresh-outline' size={TOOLBAR_ICON_SIZE} />
      </TouchableOpacity>
      {!Boolean(count.saved) && (
        <TouchableOpacity onPress={onPressSaveButton} style={styles.icon}>
          <Ionicons color={'#fff'} name='save-outline' size={TOOLBAR_ICON_SIZE} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onPressSettingsButton} style={styles.icon}>
        <Ionicons color={'#fff'} name='settings-outline' size={TOOLBAR_ICON_SIZE} />
      </TouchableOpacity>
      {Boolean(count.saved) && (
        <>
          <TouchableOpacity
            onPress={() => onPressStartNewCountButton(count, countsVar, db)}
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
              onPress={() => onPressDelete(count, countsVar, db, setShowOptionsMenu)}
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
