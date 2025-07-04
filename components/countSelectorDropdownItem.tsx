import { Count } from '../types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CountSelectorDropdownItem = ({
  count,
  isLast,
  onPress
}: {
  count: Count;
  isLast: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        ...styles.dropdownItem,
        borderBottomWidth: isLast ? 0 : 1
      }}
    >
      <View style={styles.dropdownItemFirstRow}>
        <Text style={styles.dropdownItemText}>{count.title}</Text>
        <Text style={styles.dropdownItemText}>{count.value}</Text>
      </View>
      <Text style={styles.dropdownItemSecondRowText}>
        Created{'  '}
        {new Date(count.createdAt || '').toLocaleString()}
      </Text>
      <Text style={styles.dropdownItemSecondRowText}>
        Updated {new Date(count.lastModified || '').toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdownItem: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingVertical: 18
  },
  dropdownItemFirstRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 18
  },
  dropdownItemSecondRowText: {
    color: '#ddd',
    fontSize: 15
  }
});
