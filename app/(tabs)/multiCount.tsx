import Ionicons from '@expo/vector-icons/Ionicons';
import { countChangeViaUserInteractionHasHappenedVar, savedCountsVar } from '../../reactiveVars';
import { useReactiveVar } from '@apollo/client';
import { useSetSavedCountValue } from '../../hooks';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Divider = () => <View style={styles.divider} />;

export default function MultiCount() {
  const savedCounts = useReactiveVar(savedCountsVar);
  const setSavedCountValue = useSetSavedCountValue();

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
                    countChangeViaUserInteractionHasHappenedVar(true);
                    setSavedCountValue(value - 1, id);
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
                  onPress={() => {
                    countChangeViaUserInteractionHasHappenedVar(true);
                    setSavedCountValue(value + 1, id);
                  }}
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
