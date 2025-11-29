import { Button } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SettingsTroubleshooting() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
        onPress={navigation.goBack}
      />
      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.heading}>Vibration not working?</Text>
          <Text style={styles.bodyText}>
            Settings {'>'} Sounds & Haptics {'>'} Haptics
          </Text>
          <Text style={styles.bodyText}>
            The Vibration may not work if &quot;Don&apos;t Play in Silent Mode&quot; or &quot;Never
            Play&quot; is selected.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Can&apos;t hear the alarm?</Text>
          <Text style={styles.bodyText}>
            First check your volume isn&apos;t muted or too low. Then:
          </Text>
          <Text style={styles.bodyText}>Settings {'>'} Sounds & Haptics</Text>
          <Text style={styles.bodyText}>Ensure Silent Mode is off.</Text>
        </View>
        <Button style={{ alignSelf: 'flex-end' }} onPress={navigation.goBack}>
          Okay
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    fontSize: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 3,
    gap: 10,
    maxWidth: 400,
    padding: 16,
    width: '90%'
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  section: {
    gap: 5
  }
});
