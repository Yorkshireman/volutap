import { useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

export default function Settings() {
  const {
    params: { id }
  } = useRoute() as { params: { id: string } };
  console.log({ id });
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.subHeading}>Changes here only apply to the current Count</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // backgroundColor: '#333',
    backgroundColor: '#FAFAFA',
    flex: 1,
    gap: 10,
    padding: 20
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
