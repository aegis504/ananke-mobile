import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native';
import { Colors } from '../theme';

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/icon.png')} 
        style={styles.logoImage} 
        resizeMode="contain"
      />
      <Text style={styles.name}>Ananke</Text>
      <ActivityIndicator size="small" color={Colors.primary} style={styles.spinner} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 32,
    letterSpacing: 1,
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
