import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import type { Count, DbCount } from '../../types';
import { countVar, savedCountsVar } from '../../reactiveVars';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

export default function MultiCount() {
  const count = useReactiveVar(countVar);
  const db = useSQLiteContext();
  const [savedCounts, setSavedCounts] = useState<Count[] | null>(null);

  useEffect(() => {
    if (!savedCounts) return;

    const counts: Count[] = savedCounts.map(savedCount =>
      savedCount.id === count.id ? count : savedCount
    );

    setSavedCounts(counts);
  }, [count]);

  useFocusEffect(
    useCallback(() => {
      const fetchSavedCounts = async () => {
        console.log('-------------------- fetchSavedCounts()');
        try {
          const savedCounts = await db.getAllAsync<DbCount>('SELECT * FROM savedCounts');
          if (!savedCounts || !savedCounts.length) {
            console.log('No saved counts found in the database.');
            setSavedCounts(null);
            return;
          }

          const counts: Count[] = savedCounts.map(c => {
            return {
              ...c,
              alerts: JSON.parse(c.alerts)
            };
          });

          setSavedCounts(counts);
        } catch (error) {
          console.error('Error fetching saved counts from the database: ', error);
        }
      };

      fetchSavedCounts();
    }, [db])
  );

  const Divider = () => <View style={styles.divider} />;

  const incrementCount = async (id: Count['id'], newValue: number) => {
    if (!id) {
      console.error('No ID provided for incrementing count.');
      return;
    }

    if (id === count.id) {
      countVar({ ...count, value: newValue });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }

    const now = new Date().toISOString();
    try {
      await db.runAsync(`UPDATE savedCounts SET lastModified = ?, value = ? WHERE id = ?`, [
        now,
        newValue,
        id
      ]);

      const updatedCounts = savedCounts?.map(savedCount =>
        savedCount.id === id ? { ...savedCount, lastModified: now, value: newValue } : savedCount
      );

      setSavedCounts(updatedCounts || null);
      savedCountsVar(updatedCounts);
    } catch (error) {
      console.error('Error incrementing count:', error);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#27187E', flex: 1 }}>
      {!savedCounts?.length && (
        <View style={styles.noSavedCountsContainer}>
          <Text style={styles.noCountsText}>
            You haven&apos;t saved any counts yet. Get counting!
          </Text>
        </View>
      )}
      {savedCounts?.length && (
        <View style={styles.container}>
          <FlatList
            data={savedCounts}
            renderItem={({ item: { value, title, id } }) => (
              <View style={styles.savedCount}>
                <TouchableOpacity
                  onPress={() => {
                    if (value === 0) return;
                    incrementCount(id, value - 1);
                  }}
                  disabled={value === 0}
                  style={styles.countButtonWrapper}
                >
                  <Ionicons
                    color={'#fff'}
                    name='remove-circle'
                    style={{ ...styles.countButton, opacity: value === 0 ? 0.5 : 1 }}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    alignItems: 'center',
                    flex: 1,
                    flexDirection: 'row',
                    paddingHorizontal: 10
                  }}
                >
                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    <Text numberOfLines={2} style={styles.savedCountTitle}>
                      {title}
                    </Text>
                  </View>
                  <View style={{ minWidth: 10 }}>
                    <Text style={{ ...styles.text, color: '#fff' }}>{value}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => incrementCount(id, value + 1)}
                  style={styles.countButtonWrapper}
                >
                  <Ionicons color={'#fff'} name='add-circle' style={styles.countButton} />
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <Divider />}
            style={styles.list}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20
  },
  countButton: {
    fontSize: 50,
    padding: 5
  },
  countButtonWrapper: {
    alignItems: 'center',
    minWidth: 40
  },
  divider: {
    backgroundColor: '#fff',
    height: StyleSheet.hairlineWidth,
    width: '100%'
  },
  list: {
    alignSelf: 'stretch'
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
    marginBottom: 20
  },
  noCountsText: {
    color: '#fff',
    fontSize: 18
  },
  noSavedCountsContainer: {
    alignItems: 'center',
    padding: 20
  },
  savedCount: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    paddingVertical: 20
  },
  savedCountTitle: {
    color: '#fff',
    fontSize: 24
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  weekButton: {
    padding: 10
  }
});
