import { CountSelectorDropdownItem } from './countSelectorDropdownItem';
import Ionicons from '@expo/vector-icons/Ionicons';
import { onSelectCount } from '../utils';
import { usePopulateCountSelector } from '../hooks';
import { useSQLiteContext } from 'expo-sqlite';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useAnimatedValue,
  View
} from 'react-native';
import type { Count, SetCount, SetShowSaveInputField } from '../types';
import { useEffect, useState } from 'react';

export const CountSelector = ({
  count,
  setCount,
  setShowSaveInputField
}: {
  count: Count;
  setCount: SetCount;
  setShowSaveInputField: SetShowSaveInputField;
}) => {
  const [counts, setCounts] = useState<Count[]>();
  const db = useSQLiteContext();
  const dropdownIconRotationAnim = useAnimatedValue(0);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCount, setSelectedCount] = useState<Count | null>(null);
  usePopulateCountSelector(count, db, setCounts, setSelectedCount);

  const rotate = dropdownIconRotationAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg']
  });

  useEffect(() => {
    const rotateDropdownIconUp = () => {
      Animated.timing(dropdownIconRotationAnim, {
        duration: 175,
        toValue: isDropdownVisible ? 180 : 0,
        useNativeDriver: true
      }).start();
    };

    rotateDropdownIconUp();
  }, [dropdownIconRotationAnim, isDropdownVisible, selectedCount]);

  if (!counts?.length) return null;

  const shouldEnableDropdown = !selectedCount || counts.length > 1;

  return (
    <View style={styles.container}>
      <View style={styles.innerWrapper}>
        <Pressable
          onPress={() => shouldEnableDropdown && setDropdownVisible(!isDropdownVisible)}
          style={{
            ...styles.selector,
            borderBottomLeftRadius: isDropdownVisible ? 0 : 8,
            borderBottomRightRadius: isDropdownVisible ? 0 : 8,
            borderBottomWidth: isDropdownVisible ? 0 : 1
          }}
        >
          <View style={styles.titleWrapper}>
            <Text style={styles.text}>{selectedCount?.title}</Text>
          </View>
          {shouldEnableDropdown ? (
            <Animated.View
              style={[
                styles.dropdownIconWrapper,
                {
                  transform: [{ rotate }]
                }
              ]}
            >
              <Ionicons color='#fff' name={'chevron-down-outline'} size={24} />
            </Animated.View>
          ) : null}
        </Pressable>
        {isDropdownVisible && (
          <ScrollView indicatorStyle='white' style={styles.dropdown}>
            {counts
              .filter(({ id }) => id !== selectedCount?.id)
              .map((count, i) => {
                const isLast = i === counts.length - 1;
                const onPress = () =>
                  onSelectCount({
                    count,
                    db,
                    id: count.id,
                    selectedCount,
                    setCount,
                    setDropdownVisible,
                    setShowSaveInputField
                  });

                return (
                  <CountSelectorDropdownItem
                    count={count}
                    key={count.id}
                    isLast={isLast}
                    onPress={onPress}
                  />
                );
              })}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  dropdown: {
    backgroundColor: '#27187E',
    borderColor: '#fff',
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
    borderWidth: 1,
    left: 0,
    maxHeight: 500,
    paddingHorizontal: 15,
    position: 'absolute',
    right: 0,
    shadowColor: '#ccc',
    shadowOffset: { height: 6, width: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    top: 42,
    zIndex: 100
  },
  dropdownIconWrapper: {
    position: 'absolute',
    right: 10,
    top: 10
  },
  innerWrapper: {
    width: '100%'
  },
  selector: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10
  },
  text: {
    color: '#fff',
    fontSize: 18
  },
  titleWrapper: {
    alignItems: 'center',
    flex: 1
  }
});
