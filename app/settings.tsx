import { AlertSettings } from '../components';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Settings() {
  const router = useRouter();

  return (
    <ScrollView>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeIconWrapper}>
          <Ionicons name='close-circle-sharp' size={40} color='#222' style={styles.closeIcon} />
        </TouchableOpacity>
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.subHeading}>Changes here only apply to the current Count.</Text>
        <AlertSettings />
      </View>
    </ScrollView>
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
    backgroundColor: '#FAFAFA',
    gap: 10,
    padding: 20,
    paddingBottom: 50
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
