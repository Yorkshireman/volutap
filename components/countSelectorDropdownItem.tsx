import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const CountSelectorDropdownItem = ({
  isLast,
  onPress,
  title
}: {
  isLast: boolean;
  onPress: () => void;
  title?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        ...styles.dropdownItem,
        borderBottomWidth: isLast ? 0 : 1
      }}
    >
      <Text style={styles.dropdownItemText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdownItem: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingVertical: 18
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 18
  }
});
