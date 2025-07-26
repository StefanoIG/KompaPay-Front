import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInLeft,
    FadeInUp,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { ComponentStyles, FontSizes, GlobalStyles, KompaColors, Spacing } from '../constants/Styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = screenWidth > 768;

// Componente de Feature Card
const FeatureCard = ({ icon, title, description, delay = 0 }: {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}) => (
  <Animated.View 
    entering={FadeInUp.delay(delay).duration(800)}
    style={[styles.featureCard, isWeb && isLargeScreen && styles.featureCardWeb]}
  >
    <View style={styles.featureIcon}>
      <Text style={styles.featureIconText}>{icon}</Text>
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </Animated.View>
);

// Componente de Estadística
const StatCard = ({ number, label, delay = 0 }: {
  number: string;
  label: string;
  delay?: number;
}) => (
  <Animated.View 
    entering={FadeInUp.delay(delay).duration(800)}
    style={[styles.statCard, isWeb && isLargeScreen && styles.statCardWeb]}
  >
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Animated.View>
);

// Componente de Beneficio
const BenefitItem = ({ icon, text, delay = 0 }: {
  icon: string;
  text: string;
  delay?: number;
}) => (
  <Animated.View 
    entering={FadeInLeft.delay(delay).duration(600)}
    style={styles.benefitItem}
  >
    <View style={styles.benefitIcon}>
      <Text style={styles.benefitIconText}>{icon}</Text>
    </View>
    <Text style={styles.benefitText}>{text}</Text>
  </Animated.View>
);

export default function HomePage() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Animaciones flotantes
  const floatingAnimation = useSharedValue(0);
  
  useEffect(() => {
    floatingAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const animatedFloatingStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(floatingAnimation.value, [0, 1], [0, -10])
        }
      ]
    };
  });

  // Datos de testimonios
  const testimonials = [
    {
      text: "KompaPay ha revolucionado cómo gestiono los gastos con mis compañeros de piso",
      author: "María González",
      role: "Estudiante"
    },
    {
      text: "Perfecto para organizar gastos familiares y viajes en grupo",
      author: "Carlos Ruiz",
      role: "Padre de familia"
    },
    {
      text: "La sincronización offline es increíble, nunca pierdo datos",
      author: "Ana López",
      role: "Profesional"
    }
  ];

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  const handleViewDemo = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[KompaColors.primary, KompaColors.secondary]}
          style={[styles.heroSection, isWeb && isLargeScreen && styles.heroSectionWeb]}
        >
          <View style={styles.heroContent}>
            <Animated.View 
              style={animatedFloatingStyle}
              entering={FadeIn.delay(200).duration(1000)}
            >
              <Text style={styles.heroEmoji}>💰</Text>
            </Animated.View>
            
            <Animated.Text 
              entering={FadeInUp.delay(400).duration(800)}
              style={[ComponentStyles.textHero, styles.heroTitle]}
            >
              KompaPay
            </Animated.Text>
            
            <Animated.Text 
              entering={FadeInUp.delay(600).duration(800)}
              style={[ComponentStyles.textSubtitle, styles.heroSubtitle]}
            >
              La forma más inteligente de gestionar gastos compartidos
            </Animated.Text>

            <Animated.View 
              entering={FadeInUp.delay(800).duration(800)}
              style={[styles.heroButtons, isWeb && isLargeScreen && styles.heroButtonsWeb]}
            >
              <TouchableOpacity 
                style={[ComponentStyles.button, styles.primaryButton]}
                onPress={handleGetStarted}
              >
                <Text style={styles.primaryButtonText}>Comenzar Ahora</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[ComponentStyles.buttonSecondary, styles.secondaryButton]}
                onPress={handleViewDemo}
              >
                <Text style={styles.secondaryButtonText}>Ver Funcionalidades</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Stats */}
            <Animated.View 
              entering={FadeInUp.delay(1000).duration(800)}
              style={[styles.statsContainer, isWeb && isLargeScreen && styles.statsContainerWeb]}
            >
              <StatCard number="50K+" label="Usuarios Activos" delay={1200} />
              <StatCard number="1M+" label="Gastos Gestionados" delay={1400} />
              <StatCard number="99.9%" label="Tiempo Activo" delay={1600} />
            </Animated.View>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(200).duration(800)}
            style={[ComponentStyles.textTitle, styles.sectionTitle]}
          >
            ¿Por qué elegir KompaPay?
          </Animated.Text>
          
          <View style={[styles.featuresGrid, isWeb && isLargeScreen && styles.featuresGridWeb]}>
            <FeatureCard
              icon="🤖"
              title="IA Inteligente"
              description="Categorización automática y detección de patrones de gasto"
              delay={400}
            />
            <FeatureCard
              icon="⚡"
              title="Tiempo Real"
              description="Sincronización instantánea entre todos los dispositivos"
              delay={600}
            />
            <FeatureCard
              icon="🔒"
              title="Seguridad Total"
              description="Encriptación de extremo a extremo y protección de datos"
              delay={800}
            />
            <FeatureCard
              icon="📱"
              title="Multi-plataforma"
              description="Disponible en iOS, Android y Web con experiencia nativa"
              delay={1000}
            />
            <FeatureCard
              icon="🌐"
              title="Offline First"
              description="Funciona perfectamente sin internet, sincroniza automáticamente"
              delay={1200}
            />
            <FeatureCard
              icon="📊"
              title="Analytics Avanzado"
              description="Reportes detallados y análisis de patrones de gasto"
              delay={1400}
            />
          </View>
        </View>

        {/* Benefits Section */}
        <LinearGradient
          colors={[KompaColors.gray50, KompaColors.surface]}
          style={styles.benefitsSection}
        >
          <View style={styles.container}>
            <Animated.Text 
              entering={FadeInUp.delay(200).duration(800)}
              style={[ComponentStyles.textTitle, styles.sectionTitle]}
            >
              Beneficios que marcan la diferencia
            </Animated.Text>
            
            <View style={[styles.benefitsList, isWeb && isLargeScreen && styles.benefitsListWeb]}>
              <BenefitItem 
                icon="⚡" 
                text="Ahorra tiempo con división automática de gastos" 
                delay={400}
              />
              <BenefitItem 
                icon="💡" 
                text="Evita conflictos con transparencia total" 
                delay={600}
              />
              <BenefitItem 
                icon="📈" 
                text="Optimiza tus finanzas con insights inteligentes" 
                delay={800}
              />
              <BenefitItem 
                icon="🎯" 
                text="Mantén el control con notificaciones inteligentes" 
                delay={1000}
              />
              <BenefitItem 
                icon="🤝" 
                text="Fortalece relaciones con gestión justa" 
                delay={1200}
              />
              <BenefitItem 
                icon="🌟" 
                text="Experiencia premium sin complicaciones" 
                delay={1400}
              />
            </View>
          </View>
        </LinearGradient>

        {/* CTA Section */}
        <View style={styles.section}>
          <Animated.View 
            entering={FadeInUp.delay(200).duration(800)}
            style={styles.ctaContainer}
          >
            <Text style={[ComponentStyles.textTitle, styles.ctaTitle]}>
              ¿Listo para simplificar tus gastos?
            </Text>
            <Text style={[ComponentStyles.textSubtitle, styles.ctaSubtitle]}>
              Únete a miles de usuarios que ya gestionan sus gastos de forma inteligente
            </Text>
            
            <TouchableOpacity 
              style={[ComponentStyles.button, styles.ctaButton]}
              onPress={handleGetStarted}
            >
              <Text style={styles.primaryButtonText}>Comenzar Gratis</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KompaColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Hero Section
  heroSection: {
    minHeight: isWeb ? (isLargeScreen ? screenHeight : screenHeight * 0.8) : screenHeight * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  heroSectionWeb: {
    minHeight: screenHeight,
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: isWeb && isLargeScreen ? 1200 : '90%',
    paddingHorizontal: Spacing.lg,
  },
  heroEmoji: {
    fontSize: isWeb && isLargeScreen ? 120 : 80,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    color: KompaColors.surface,
    marginBottom: Spacing.md,
  },
  heroSubtitle: {
    color: KompaColors.surface,
    opacity: 0.9,
    marginBottom: Spacing.xxl,
    maxWidth: isWeb && isLargeScreen ? 600 : '90%',
  },
  heroButtons: {
    flexDirection: isWeb && isLargeScreen ? 'row' : 'column',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  heroButtonsWeb: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButton: {
    minWidth: isWeb && isLargeScreen ? 200 : '80%',
    backgroundColor: KompaColors.surface,
  },
  primaryButtonText: {
    color: KompaColors.primary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  secondaryButton: {
    minWidth: isWeb && isLargeScreen ? 200 : '80%',
    backgroundColor: 'transparent',
    borderColor: KompaColors.surface,
  },
  secondaryButtonText: {
    color: KompaColors.surface,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 600,
  },
  statsContainerWeb: {
    maxWidth: 800,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statCardWeb: {
    paddingHorizontal: Spacing.lg,
  },
  statNumber: {
    fontSize: isWeb && isLargeScreen ? FontSizes.xxxl : FontSizes.xxl,
    fontWeight: 'bold',
    color: KompaColors.surface,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: KompaColors.surface,
    opacity: 0.8,
    textAlign: 'center',
  },
  
  // Sections
  section: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    maxWidth: isWeb && isLargeScreen ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    fontSize: isWeb && isLargeScreen ? FontSizes.heading : FontSizes.title,
  },
  
  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  featuresGridWeb: {
    justifyContent: 'center',
  },
  featureCard: {
    backgroundColor: KompaColors.surface,
    borderRadius: GlobalStyles.borderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    width: isWeb && isLargeScreen ? '30%' : '100%',
    minWidth: isWeb && isLargeScreen ? 280 : undefined,
    marginBottom: Spacing.lg,
    ...GlobalStyles.shadow.md,
  },
  featureCardWeb: {
    width: '30%',
    minWidth: 300,
  },
  featureIcon: {
    width: 60,
    height: 60,
    backgroundColor: KompaColors.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSizes.md * 1.4,
  },
  
  // Benefits
  benefitsSection: {
    paddingVertical: Spacing.xxxl,
  },
  benefitsList: {
    gap: Spacing.lg,
  },
  benefitsListWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KompaColors.background,
    padding: Spacing.lg,
    borderRadius: GlobalStyles.borderRadius.md,
    ...GlobalStyles.shadow.sm,
    width: isWeb && isLargeScreen ? '48%' : '100%',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    backgroundColor: KompaColors.primaryLight,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  benefitIconText: {
    fontSize: 18,
  },
  benefitText: {
    fontSize: FontSizes.md,
    color: KompaColors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  
  // CTA
  ctaContainer: {
    backgroundColor: KompaColors.surface,
    borderRadius: GlobalStyles.borderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...GlobalStyles.shadow.lg,
  },
  ctaTitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  ctaSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    maxWidth: isWeb && isLargeScreen ? 500 : '100%',
  },
  ctaButton: {
    minWidth: isWeb && isLargeScreen ? 250 : '80%',
    paddingVertical: Spacing.lg,
  },
});
