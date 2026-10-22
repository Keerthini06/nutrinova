import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [foodImage, setFoodImage] = useState<string | null>(null);
  const router = useRouter();

  const pickFoodImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setFoodImage(result.assets[0].uri);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Unable to open the photo picker. Please try again.');
      } else {
        Alert.alert('Photo picker error', 'Please try selecting a photo again.');
      }
    }
  };

  const removeFoodImage = () => {
    setFoodImage(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F0" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={25} color="#FFFFFF" />
          </View>
          <View style={styles.brandText}>
            <Text style={styles.brandName}>NutriNova</Text>
            <Text style={styles.brandSubtitle}>YOUR DAILY NUTRITION PARTNER</Text>
          </View>
          <View style={styles.profileIcon}>
            <Ionicons name="person-outline" size={22} color="#245C45" />
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hello, Food Explorer! 👋</Text>
          <Text style={styles.welcomeTitle}>Eat better, feel better.</Text>
          <Text style={styles.welcomeDescription}>
            Discover what's on your plate and make every bite count.
          </Text>
        </View>

        {/* Food Photo Card */}
        <View style={styles.scanCard}>
          <View style={styles.scanCardHeader}>
            <View style={styles.scanIconCircle}>
              <Ionicons name="camera-outline" size={27} color="#245C45" />
            </View>
            <View style={styles.scanHeaderText}>
              <Text style={styles.scanTitle}>Scan your food</Text>
              <Text style={styles.scanDescription}>
                Choose a photo of your meal to get started.
              </Text>
            </View>
          </View>

          {foodImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: foodImage }} style={styles.foodPreview} />
              <View style={styles.previewLabel}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.previewLabelText}>Photo selected</Text>
              </View>
              <Pressable
                style={styles.removeButton}
                onPress={removeFoodImage}
                accessibilityLabel="Remove selected food photo"
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image-outline" size={43} color="#779481" />
              <Text style={styles.uploadTitle}>Your meal goes here</Text>
              <Text style={styles.uploadSubtitle}>
                Select a clear photo of your food
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.scanButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={pickFoodImage}
          >
            <Ionicons name="images-outline" size={21} color="#FFFFFF" />
            <Text style={styles.scanButtonText}>
              {foodImage ? 'Choose Another Photo' : 'Choose Food Photo'}
            </Text>
          </Pressable>

          {foodImage && (
  <Pressable
    style={styles.scanButton}
    onPress={() =>
      router.push({
        pathname: '/analyze',
        params: { image: foodImage },
      })
    }
  >
    <Ionicons name="scan-outline" size={21} color="#FFFFFF" />
    <Text style={styles.scanButtonText}>Continue to Analysis</Text>
  </Pressable>
      )}

        </View>
        {/* Daily Calories */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieTopRow}>
            <View>
              <Text style={styles.sectionEyebrow}>YOUR DAILY PROGRESS</Text>
              <Text style={styles.calorieTitle}>Calories tracked</Text>
            </View>
            <View style={styles.calorieIcon}>
              <Ionicons name="flame-outline" size={25} color="#D98C45" />
            </View>
          </View>

          <View style={styles.calorieNumberRow}>
            <Text style={styles.calorieNumber}>0</Text>
            <Text style={styles.calorieUnit}>kcal</Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressCaption}>
            Start by selecting a photo of your meal.
          </Text>
        </View>

        {/* Nutrition Cards */}
        <Text style={styles.sectionTitle}>Your nutrition</Text>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionCard}>
            <View style={[styles.nutritionIcon, { backgroundColor: '#E4F1E4' }]}>
              <Ionicons name="fitness-outline" size={22} color="#397C50" />
            </View>
            <Text style={styles.nutritionValue}>0 g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>

          <View style={styles.nutritionCard}>
            <View style={[styles.nutritionIcon, { backgroundColor: '#FBEBD8' }]}>
              <Ionicons name="nutrition-outline" size={22} color="#C17A35" />
            </View>
            <Text style={styles.nutritionValue}>0 g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>

          <View style={styles.nutritionCard}>
            <View style={[styles.nutritionIcon, { backgroundColor: '#F5E4E8' }]}>
              <Ionicons name="water-outline" size={22} color="#B85B76" />
            </View>
            <Text style={styles.nutritionValue}>0 g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb-outline" size={23} color="#B57C2B" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>A little healthy tip</Text>
            <Text style={styles.tipDescription}>
              Add a variety of colorful fruits and vegetables to your meals
              for a wider range of nutrients.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Small steps make a healthier you. 🌱
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F7F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F7F0',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 35,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#245C45',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    marginLeft: 11,
    flex: 1,
  },
  brandName: {
    color: '#245C45',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    color: '#829084',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 3,
  },
  profileIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE4D9',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  welcomeSection: {
    marginBottom: 23,
  },
  greeting: {
    fontSize: 14,
    color: '#66806D',
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeTitle: {
    color: '#1D4936',
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  welcomeDescription: {
    color: '#758477',
    fontSize: 14,
    lineHeight: 21,
  },
  scanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E9EDE4',
    marginBottom: 19,
  },
  scanCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },
  scanIconCircle: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: '#E9F2E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  scanTitle: {
    color: '#244B37',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  scanDescription: {
    color: '#849084',
    fontSize: 12,
    lineHeight: 17,
  },
  uploadPlaceholder: {
    height: 172,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C8D8C8',
    backgroundColor: '#F7FAF4',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadTitle: {
    color: '#355C43',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  uploadSubtitle: {
    color: '#8A978B',
    fontSize: 12,
    marginTop: 5,
  },
  previewContainer: {
    height: 230,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#E9EFE6',
  },
  foodPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewLabel: {
    position: 'absolute',
    left: 11,
    bottom: 11,
    backgroundColor: 'rgba(36,92,69,0.92)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previewLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  removeButton: {
    position: 'absolute',
    right: 11,
    top: 11,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: 'rgba(25,40,30,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#245C45',
    borderRadius: 15,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  nextStepNotice: {
    marginTop: 13,
    backgroundColor: '#EFF6EC',
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  nextStepText: {
    color: '#42654A',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  calorieCard: {
    backgroundColor: '#EAF2E6',
    borderRadius: 23,
    padding: 19,
    marginBottom: 25,
  },
  calorieTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionEyebrow: {
    color: '#6C866E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  calorieTitle: {
    color: '#244B37',
    fontSize: 17,
    fontWeight: '800',
  },
  calorieIcon: {
    height: 43,
    width: 43,
    borderRadius: 14,
    backgroundColor: '#FFF3E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 15,
    marginBottom: 15,
  },
  calorieNumber: {
    fontSize: 40,
    color: '#214C36',
    fontWeight: '800',
    letterSpacing: -1,
  },
  calorieUnit: {
    color: '#718471',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 7,
  },
  progressBackground: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#D6E4D1',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#43835A',
    borderRadius: 8,
  },
  progressCaption: {
    color: '#6F846F',
    fontSize: 12,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#244B37',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 14,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  nutritionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEDE5',
  },
  nutritionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },
  nutritionValue: {
    color: '#294C37',
    fontSize: 17,
    fontWeight: '800',
  },
  nutritionLabel: {
    color: '#849084',
    fontSize: 12,
    marginTop: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF4E2',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5E8CE',
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFE8BC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    color: '#805B2D',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  tipDescription: {
    color: '#94794F',
    fontSize: 12,
    lineHeight: 19,
  },
  footerText: {
    color: '#879385',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 22,
  },
});
