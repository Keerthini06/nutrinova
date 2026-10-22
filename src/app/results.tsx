
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultsScreen() {
  const { image } = useLocalSearchParams<{ image?: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#214E34" />
          </Pressable>
          <Text style={styles.headerTitle}>Food Results</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.title}>Your Food Analysis</Text>
        <Text style={styles.subtitle}>
          Your selected food photo is ready.
        </Text>

        {typeof image === 'string' && image.length > 0 ? (
          <Image source={{ uri: image }} style={styles.foodImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="fast-food-outline" size={48} color="#6C8C70" />
            <Text style={styles.placeholderText}>No food photo received</Text>
          </View>
        )}

        <View style={styles.statusCard}>
          <Ionicons name="information-circle-outline" size={26} color="#39764D" />
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>Ready for food recognition</Text>
            <Text style={styles.statusDescription}>
              The screen works, but AI food recognition is not connected yet.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Nutrition Summary</Text>

        <View style={styles.calorieCard}>
          <Ionicons name="flame-outline" size={32} color="#FFFFFF" />
          <Text style={styles.calorieNumber}>--</Text>
          <Text style={styles.calorieLabel}>Calories (kcal)</Text>
        </View>

        <View style={styles.nutrients}>
          <View style={styles.nutrientCard}>
            <Text style={styles.nutrientValue}>-- g</Text>
            <Text style={styles.nutrientLabel}>Protein</Text>
          </View>
          <View style={styles.nutrientCard}>
            <Text style={styles.nutrientValue}>-- g</Text>
            <Text style={styles.nutrientLabel}>Carbs</Text>
          </View>
          <View style={styles.nutrientCard}>
            <Text style={styles.nutrientValue}>-- g</Text>
            <Text style={styles.nutrientLabel}>Fat</Text>
          </View>
        </View>

        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace('/')}
        >
          <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F0',
  },
  content: {
    padding: 22,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5EEDF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#214E34',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#214E34',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B786B',
    marginTop: 8,
    marginBottom: 20,
  },
  foodImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#E5EEDF',
    marginBottom: 20,
  },
  imagePlaceholder: {
    height: 180,
    borderRadius: 20,
    backgroundColor: '#E5EEDF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    marginTop: 10,
    color: '#52735A',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5EEDF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 26,
  },
  statusText: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#214E34',
  },
  statusDescription: {
    fontSize: 13,
    color: '#526653',
    marginTop: 5,
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#214E34',
    marginBottom: 14,
  },
  calorieCard: {
    backgroundColor: '#39764D',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 14,
  },
  calorieNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  calorieLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 2,
  },
  nutrients: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  nutrientCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#39764D',
  },
  nutrientLabel: {
    fontSize: 13,
    color: '#687568',
    marginTop: 6,
  },
  homeButton: {
    backgroundColor: '#214E34',
    borderRadius: 16,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
