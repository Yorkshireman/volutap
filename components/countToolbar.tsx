import * as Haptics from 'expo-haptics';
import { countVar } from '../reactiveVars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Menu } from 'react-native-paper';
import { router } from 'expo-router';
import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, Dimensions, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import type {
  Count,
  DbCount,
  SetShowEditInputField,
  SetShowSaveInputField,
  SetTitleToSave
} from '../types';
import { onPressDelete, onPressReset, onPressStartNewCountButton } from '../utils';

const screenWidth = Dimensions.get('window').width;
// fix for different screen sizes
const TOOLBAR_ICON_SIZE = screenWidth < 400 ? 48 : screenWidth < 430 ? 54 : 54;

interface CountToolbarProps {
  count: Count;
  setShowEditInputField: SetShowEditInputField;
  setShowSaveInputField: SetShowSaveInputField;
  setTitleToSave: SetTitleToSave;
}

export const CountToolbar = ({
  setShowEditInputField,
  setShowSaveInputField,
  setTitleToSave
}: CountToolbarProps) => {
  const count = useReactiveVar(countVar);
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

    const dbCount = await db.getFirstAsync<DbCount>('SELECT * FROM savedCounts WHERE id = ?', [id]);

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
        `Created ${new Date(dbCount.createdAt || '').toLocaleString(undefined, {
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
    router.push('/settings');
  };

  const onPressShareButton = async () => {
    try {
      const createdAt = `Started on ${new Date(count.createdAt || '').toLocaleString(undefined, {
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        second: '2-digit',
        weekday: 'short',
        year: 'numeric'
      })}`;
      // get a proper app name and a link to the app store later
      const appName = 'Counter';
      const url = 'https://counterapp.io';
      await Share.share({
        message: `I counted ${count.value} ${count.title?.toLowerCase()}!
        ${createdAt ? `\n${createdAt}` : ''}
        \nGet ${appName} to keep track of your counts: ${url}
        `
      });
    } catch (e) {
      console.error('countToolbar.tsx, error sharing count: ', e);
      Alert.alert('Error', 'An unknown error occurred.');
    }
  };

  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      {count.id && (
        <TouchableOpacity onPress={() => count.id && onPressInfo(count.id)} style={styles.icon}>
          <Ionicons color={'#fff'} name='information-circle-outline' size={TOOLBAR_ICON_SIZE} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => onPressReset(count, countVar)} style={styles.icon}>
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
        <TouchableOpacity
          onPress={() => onPressStartNewCountButton(count, countVar, db)}
          style={styles.icon}
        >
          <Ionicons color={'#fff'} name='create-outline' size={TOOLBAR_ICON_SIZE} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onPressShareButton} style={styles.icon}>
        <Ionicons color={'#fff'} name='share-outline' size={TOOLBAR_ICON_SIZE} />
      </TouchableOpacity>
      {count.id && (
        <Menu
          anchor={
            <TouchableOpacity onPress={onPressOptionsButton} style={styles.icon}>
              <Ionicons color={'#fff'} name='ellipsis-horizontal-circle' size={TOOLBAR_ICON_SIZE} />
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
            onPress={() => onPressDelete(count, countVar, db, setShowOptionsMenu)}
            title='Delete'
            titleStyle={styles.menuItemTitleStyle}
          />
        </Menu>
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
