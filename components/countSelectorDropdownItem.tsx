import { Count } from '../types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CountSelectorDropdownItem = ({
  createdAt,
  lastModified,
  isLast,
  onPress,
  title,
  value
}: {
  createdAt?: Count['createdAt'];
  lastModified?: Count['lastModified'];
  isLast: boolean;
  onPress: () => void;
  title: Count['title'];
  value: Count['value'];
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
        <Text style={styles.dropdownItemText}>{title}</Text>
        <Text style={styles.dropdownItemText}>{value}</Text>
      </View>
      <Text style={styles.dropdownItemSecondRowText}>
        Created{'  '}
        {new Date(createdAt || '').toLocaleString()}
      </Text>
      <Text style={styles.dropdownItemSecondRowText}>
        Updated {new Date(lastModified || '').toLocaleString()}
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
  dropdownItemSecondRowText: {
    color: '#ddd',
    fontSize: 15
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 18
  }
});
