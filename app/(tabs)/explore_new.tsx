import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  FadeIn,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
} from 'react-native-reanimated';
import { KompaColors, GlobalStyles, ComponentStyles, FontSizes, Spacing } from '../../constants/Styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = screenWidth > 768;

// Componente de Feature Showcase
const FeatureShowcase = ({ 
  icon, 
  title, 
  description, 
  features, 
  isActive, 
  onPress, 
  delay = 0 
}: {
  icon: string;
  title: string;
  description: string;
  features: string[];
  isActive: boolean;
  onPress: () => void;
  delay?: number;
}) => (
  <Animated.View 
    entering={FadeInLeft.delay(delay).duration(800)}
    style={[styles.showcaseCard, isActive && styles.showcaseCardActive]}
  >
    <TouchableOpacity onPress={onPress} style={styles.showcaseHeader}>
      <View style={[styles.showcaseIcon, { backgroundColor: KompaColors.primary }]}>
        <Ionicons name={icon as any} size={24} color={KompaColors.surface} />
      </View>
      <View style={styles.showcaseContent}>
        <Text style={styles.showcaseTitle}>{title}</Text>
        <Text style={styles.showcaseDescription}>{description}</Text>
      </View>
      <Ionicons 
        name={isActive ? "chevron-up" : "chevron-down"} 
        size={20} 
        color={KompaColors.textSecondary} 
      />
    </TouchableOpacity>
    
    {isActive && (
      <Animated.View 
        entering={FadeInUp.duration(300)}
        style={styles.showcaseFeatures}
      >
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={KompaColors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </Animated.View>
    )}
  </Animated.View>
);

// Componente de Estadística Interactiva
const StatisticCard = ({ 
  icon, 
  value, 
  label, 
  trend, 
  color, 
  delay = 0 
}: {
  icon: string;
  value: string;
  label: string;
  trend: string;
  color: string;
  delay?: number;
}) => {
  const scaleValue = useSharedValue(0.8);
  
  useEffect(() => {
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  return (
    <Animated.View 
      entering={FadeInUp.delay(delay).duration(800)}
      style={[animatedStyle, styles.statCard]}
    >
      <LinearGradient colors={[color, `${color}80`]} style={styles.statGradient}>
        <View style={styles.statIcon}>
          <Ionicons name={icon as any} size={24} color={KompaColors.surface} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statTrend}>{trend}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Componente de Capacidad
const CapabilityCard = ({ 
  icon, 
  title, 
  description, 
  isComingSoon = false, 
  delay = 0 
}: {
  icon: string;
  title: string;
  description: string;
  isComingSoon?: boolean;
  delay?: number;
}) => (
  <Animated.View 
    entering={FadeInUp.delay(delay).duration(800)}
    style={[styles.capabilityCard, isComingSoon && styles.capabilityCardSoon]}
  >
    <View style={[styles.capabilityIcon, isComingSoon && styles.capabilityIconSoon]}>
      <Ionicons 
        name={icon as any} 
        size={32} 
        color={isComingSoon ? KompaColors.textSecondary : KompaColors.primary} 
      />
    </View>
    <Text style={[styles.capabilityTitle, isComingSoon && styles.capabilityTitleSoon]}>
      {title}
    </Text>
    <Text style={[styles.capabilityDescription, isComingSoon && styles.capabilityDescriptionSoon]}>
      {description}
    </Text>
    {isComingSoon && (
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonText}>Próximamente</Text>
      </View>
    )}
  </Animated.View>
);

export default function ExploreScreen() {
  const router = useRouter();
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [currentStatPeriod, setCurrentStatPeriod] = useState('month');
  
  // Animación de pulsación para elementos interactivos
  const pulseValue = useSharedValue(1);
  
  useEffect(() => {
    pulseValue.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }]
  }));

  const showcaseData = [
    {
      icon: "people-circle",
      title: "Gestión de Grupos",
      description: "Crea y administra grupos de gastos con facilidad",
      features: [
        "Invitaciones automáticas por email o código QR",
        "Roles y permisos personalizables",
        "Chat integrado para cada grupo",
        "Historial completo de actividades",
        "Notificaciones inteligentes"
      ]
    },
    {
      icon: "card",
      title: "División Inteligente",
      description: "Divide gastos automáticamente con IA avanzada",
      features: [
        "Reconocimiento óptico de recibos (OCR)",
        "División por porcentajes o partes iguales",
        "Categorización automática de gastos",
        "Soporte para múltiples monedas",
        "Cálculo automático de propinas e impuestos"
      ]
    },
    {
      icon: "analytics",
      title: "Analytics Avanzado",
      description: "Obtén insights profundos sobre tus patrones de gasto",
      features: [
        "Reportes detallados por categoría y período",
        "Predicciones de gastos futuros",
        "Comparativas entre grupos y períodos",
        "Exportación a Excel y PDF",
        "Dashboard personalizable"
      ]
    },
    {
      icon: "shield-checkmark",
      title: "Seguridad Total",
      description: "Protección de datos de nivel bancario",
      features: [
        "Encriptación AES-256 de extremo a extremo",
        "Autenticación biométrica",
        "Backup automático en la nube",
        "Auditoría completa de transacciones",
        "Compliance con GDPR y PCI-DSS"
      ]
    }
  ];

  const statisticsData = [
    {
      icon: "trending-up",
      value: "2,847",
      label: "Gastos este mes",
      trend: "+12% vs mes anterior",
      color: KompaColors.success
    },
    {
      icon: "people",
      value: "23",
      label: "Grupos activos",
      trend: "+3 nuevos grupos",
      color: KompaColors.primary
    },
    {
      icon: "wallet",
      value: "$15,230",
      label: "Ahorros totales",
      trend: "+8% de eficiencia",
      color: KompaColors.secondary
    },
    {
      icon: "time",
      value: "4.8h",
      label: "Tiempo ahorrado",
      trend: "Esta semana",
      color: KompaColors.warning
    }
  ];

  const capabilitiesData = [
    {
      icon: "camera",
      title: "Escaneo de Recibos",
      description: "Digitaliza recibos instantáneamente con IA"
    },
    {
      icon: "globe",
      title: "Multi-moneda",
      description: "Soporte para 150+ monedas con cambio automático"
    },
    {
      icon: "cloud-offline",
      title: "Modo Offline",
      description: "Funciona sin internet, sincroniza después"
    },
    {
      icon: "notifications",
      title: "Recordatorios Smart",
      description: "Notificaciones inteligentes basadas en patrones"
    },
    {
      icon: "link",
      title: "Integraciones",
      description: "Conecta con bancos y apps de finanzas populares",
      isComingSoon: true
    },
    {
      icon: "chatbubbles",
      title: "Asistente IA",
      description: "Chatbot inteligente para consultas y consejos",
      isComingSoon: true
    }
  ];

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.Text 
            entering={FadeIn.delay(200).duration(800)}
            style={[ComponentStyles.textHero, styles.headerTitle]}
          >
            Explora KompaPay
          </Animated.Text>
          <Animated.Text 
            entering={FadeInUp.delay(400).duration(800)}
            style={[ComponentStyles.textSubtitle, styles.headerSubtitle]}
          >
            Descubre todas las funcionalidades que te ayudarán a gestionar tus gastos como un profesional
          </Animated.Text>
        </View>

        {/* Statistics Overview */}
        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(200).duration(800)}
            style={[ComponentStyles.textTitle, styles.sectionTitle]}
          >
            Tu Actividad
          </Animated.Text>
          
          <View style={[styles.statsGrid, isWeb && isLargeScreen && styles.statsGridWeb]}>
            {statisticsData.map((stat, index) => (
              <StatisticCard
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                trend={stat.trend}
                color={stat.color}
                delay={400 + index * 200}
              />
            ))}
          </View>
        </View>

        {/* Features Showcase */}
        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(200).duration(800)}
            style={[ComponentStyles.textTitle, styles.sectionTitle]}
          >
            Funcionalidades Principales
          </Animated.Text>
          
          <View style={styles.showcaseContainer}>
            {showcaseData.map((item, index) => (
              <FeatureShowcase
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                features={item.features}
                isActive={activeShowcase === index}
                onPress={() => setActiveShowcase(activeShowcase === index ? -1 : index)}
                delay={400 + index * 150}
              />
            ))}
          </View>
        </View>

        {/* Capabilities Grid */}
        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(200).duration(800)}
            style={[ComponentStyles.textTitle, styles.sectionTitle]}
          >
            Capacidades Avanzadas
          </Animated.Text>
          
          <View style={[styles.capabilitiesGrid, isWeb && isLargeScreen && styles.capabilitiesGridWeb]}>
            {capabilitiesData.map((capability, index) => (
              <CapabilityCard
                key={index}
                icon={capability.icon}
                title={capability.title}
                description={capability.description}
                isComingSoon={capability.isComingSoon}
                delay={400 + index * 100}
              />
            ))}
          </View>
        </View>

        {/* Call to Action */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(800)}
          style={styles.ctaSection}
        >
          <LinearGradient
            colors={[KompaColors.primary, KompaColors.secondary]}
            style={styles.ctaGradient}
          >
            <Animated.View style={pulseStyle}>
              <Text style={styles.ctaEmoji}>🚀</Text>
            </Animated.View>
            <Text style={styles.ctaTitle}>¿Listo para comenzar?</Text>
            <Text style={styles.ctaDescription}>
              Únete a miles de usuarios que ya optimizan sus finanzas con KompaPay
            </Text>
            
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.ctaButtonText}>Comenzar Ahora</Text>
              <Ionicons name="arrow-forward" size={20} color={KompaColors.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: Spacing.xl,
  },
  
  // Header
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: KompaColors.surface,
  },
  headerTitle: {
    color: KompaColors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  headerSubtitle: {
    textAlign: 'center',
    maxWidth: isWeb && isLargeScreen ? 600 : '90%',
  },
  
  // Sections
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    color: KompaColors.textPrimary,
  },
  
  // Statistics
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  statsGridWeb: {
    justifyContent: 'center',
  },
  statCard: {
    width: isWeb && isLargeScreen ? '23%' : '48%',
    minWidth: isWeb && isLargeScreen ? 200 : 150,
    borderRadius: GlobalStyles.borderRadius.lg,
    overflow: 'hidden',
    ...GlobalStyles.shadow.md,
  },
  statGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: KompaColors.surface,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: KompaColors.surface,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  statTrend: {
    fontSize: FontSizes.xs,
    color: KompaColors.surface,
    opacity: 0.7,
    textAlign: 'center',
  },
  
  // Showcase
  showcaseContainer: {
    gap: Spacing.md,
  },
  showcaseCard: {
    backgroundColor: KompaColors.surface,
    borderRadius: GlobalStyles.borderRadius.lg,
    padding: Spacing.lg,
    ...GlobalStyles.shadow.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  showcaseCardActive: {
    borderColor: KompaColors.primary,
  },
  showcaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showcaseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  showcaseContent: {
    flex: 1,
  },
  showcaseTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  showcaseDescription: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
  },
  showcaseFeatures: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: KompaColors.gray100,
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    flex: 1,
  },
  
  // Capabilities
  capabilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  capabilitiesGridWeb: {
    justifyContent: 'center',
  },
  capabilityCard: {
    backgroundColor: KompaColors.surface,
    borderRadius: GlobalStyles.borderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    width: isWeb && isLargeScreen ? '30%' : '48%',
    minWidth: isWeb && isLargeScreen ? 250 : 150,
    ...GlobalStyles.shadow.sm,
  },
  capabilityCardSoon: {
    opacity: 0.7,
    backgroundColor: KompaColors.gray50,
  },
  capabilityIcon: {
    width: 60,
    height: 60,
    backgroundColor: KompaColors.primaryLight,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  capabilityIconSoon: {
    backgroundColor: KompaColors.gray200,
  },
  capabilityTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  capabilityTitleSoon: {
    color: KompaColors.textSecondary,
  },
  capabilityDescription: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSizes.md * 1.4,
  },
  capabilityDescriptionSoon: {
    color: KompaColors.textSecondary,
  },
  comingSoonBadge: {
    backgroundColor: KompaColors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: GlobalStyles.borderRadius.sm,
    marginTop: Spacing.sm,
  },
  comingSoonText: {
    fontSize: FontSizes.xs,
    color: KompaColors.surface,
    fontWeight: '600',
  },
  
  // CTA Section
  ctaSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: GlobalStyles.borderRadius.xl,
    overflow: 'hidden',
    ...GlobalStyles.shadow.lg,
  },
  ctaGradient: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  ctaEmoji: {
    fontSize: 60,
    marginBottom: Spacing.lg,
  },
  ctaTitle: {
    fontSize: FontSizes.heading,
    fontWeight: 'bold',
    color: KompaColors.surface,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  ctaDescription: {
    fontSize: FontSizes.lg,
    color: KompaColors.surface,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    maxWidth: isWeb && isLargeScreen ? 500 : '90%',
    lineHeight: FontSizes.lg * 1.4,
  },
  ctaButton: {
    backgroundColor: KompaColors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: GlobalStyles.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...GlobalStyles.shadow.md,
  },
  ctaButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: KompaColors.primary,
  },
});
