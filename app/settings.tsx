import { AlertSettings } from '../components';
import type { Count } from '../types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';

export default function Settings() {
  // const [count, setCount] = useState<Count | null>(null);
  const db = useSQLiteContext();
  const router = useRouter();
  const {
    params: { id }
  } = useRoute() as { params: { id: string } };

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const savedCount = await db.getFirstAsync<Count>(`SELECT * FROM savedCounts WHERE id = ?`, [
  //         id
  //       ]);

  //       if (!savedCount) {
  //         console.error('Settings: No Count found with the provided ID.');
  //         return;
  //       }

  //       setCount(savedCount);
  //     } catch (error) {
  //       console.error('Settings: Error fetching current Count from DB:', error);
  //     }
  //   })();
  // }, [db, id]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeIconWrapper}>
        <Ionicons name='close-circle-sharp' size={40} color='#222' style={styles.closeIcon} />
      </TouchableOpacity>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.subHeading}>Changes here only apply to the current Count.</Text>
      <AlertSettings />
    </View>
  );
}

const styles = StyleSheet.create({
  closeIcon: {
    backgroundColor: '#FAFAFA',
    color: '#27187E'
  },
  closeIconWrapper: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 20,
    top: 20
  },
  container: {
    alignItems: 'center',
    // backgroundColor: '#333',
    backgroundColor: '#FAFAFA',
    flex: 1,
    gap: 10,
    padding: 20
  },
  heading: {
    alignSelf: 'flex-start',
    color: '#222',
    fontSize: 32,
    fontWeight: 'bold'
  },
  subHeading: {
    alignSelf: 'flex-start',
    color: '#222',
    fontSize: 18
  },
  text: {
    color: '#222',
    fontSize: 18,
    textAlign: 'center'
  }
});
