import { countVar } from '../reactiveVars';
import { useReactiveVar } from '@apollo/client';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const Alert = () => {
  const { alerts, value } = useReactiveVar(countVar);
  const triggers = alerts.map(alert => alert.at);

  // if (!triggers.includes(value)) {
  //   return null; // No alert to show
  // }

  return (
    <View style={styles.container}>
      <Text style={{ color: 'white', fontSize: 24 }}>ALERT!</Text>
      <TouchableOpacity
        onPress={() => {
          console.log('Alert dismissed or action taken');
        }}
      >
        <Text style={styles.dismissButton}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 50,
    flexDirection: 'row',
    height: 150,
    justifyContent: 'space-between',
    left: '3%',
    paddingHorizontal: 40,
    paddingVertical: 30,
    position: 'absolute',
    right: 0,
    top: 60,
    width: '94%',
    zIndex: 1000
  },
  dismissButton: {
    backgroundColor: '#FF8600',
    borderRadius: 30,
    color: 'white',
    fontSize: 18,
    padding: 20
  }
});
