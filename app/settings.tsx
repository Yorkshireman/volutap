import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.description}>
        This is the settings page. You can customize your app here.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => console.log('Settings saved!')}>
        <Text style={styles.buttonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 15
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    flex: 1,
    justifyContent: 'center'
  },
  description: {
    color: '#333',
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center'
  },
  title: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  }
});
