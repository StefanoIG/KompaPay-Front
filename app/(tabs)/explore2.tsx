import { FontSizes, GlobalStyles, KompaColors, Spacing } from '@/constants/Styles';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function ExploreScreen() {
  const { user } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState(0);
  
  const demos = [
    {
      title: 'Crear un Grupo',
      description: 'Aprende cómo crear y gestionar grupos de gastos compartidos',
      icon: 'people-circle',
      color: KompaColors.primary,
      steps: [
        'Toca el botón "Nuevo Grupo"',
        'Agrega un nombre descriptivo',
        'Invita miembros por email',
        '¡Listo para empezar!',
      ],
    },
    {
      title: 'Agregar un Gasto',
      description: 'Descubre cómo registrar gastos y dividirlos automáticamente',
      icon: 'card',
      color: KompaColors.secondary,
      steps: [
        'Selecciona "Nuevo Gasto"',
        'Ingresa descripción y monto',
        'Elige cómo dividir (equitativo/personalizado)',
        'Los miembros reciben notificación',
      ],
    },
    {
      title: 'Resolver Conflictos',
      description: 'Sistema inteligente para manejar discrepancias automáticamente',
      icon: 'shield-checkmark',
      color: KompaColors.warning,
      steps: [
        'Detecta discrepancias automáticamente',
        'Notifica a todos los involucrados',
        'Permite resolución colaborativa',
        'Mantiene historial de cambios',
      ],
    },
    {
      title: 'Modo Offline',
      description: 'Funciona perfectamente sin conexión a internet',
      icon: 'cloud-offline',
      color: KompaColors.info,
      steps: [
        'Todos los datos se guardan localmente',
        'Funciona sin internet',
        'Sincroniza al conectarse',
        'Resuelve conflictos automáticamente',
      ],
    },
  ];

  const features = [
    {
      title: 'Multi-plataforma',
      description: 'Disponible en iOS, Android y Web',
      icon: 'phone-portrait',
      value: '3 Plataformas',
    },
    {
      title: 'Tiempo Real',
      description: 'Sincronización instantánea entre dispositivos',
      icon: 'flash',
      value: '<1 seg',
    },
    {
      title: 'Seguridad',
      description: 'Encriptación end-to-end de todos tus datos',
      icon: 'lock-closed',
      value: '256-bit',
    },
    {
      title: 'Disponibilidad',
      description: 'Servicio confiable con alta disponibilidad',
      icon: 'checkmark-circle',
      value: '99.9%',
    },
  ];

  const handleDemoSelection = (index: number) => {
    setSelectedDemo(index);
  };

  const startDemo = () => {
    Alert.alert(
      'Demo Interactiva',
      `¿Te gustaría ver cómo ${demos[selectedDemo].title.toLowerCase()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, ver demo', onPress: () => alert('Demo en desarrollo') },
      ]
    );
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <LinearGradient
        colors={[KompaColors.background, KompaColors.gray50]}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={GlobalStyles.containerPadded}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Explora KompaPay</Text>
            <Text style={styles.headerSubtitle}>
              Descubre todas las características que hacen único a KompaPay
            </Text>
          </View>

          {/* Demo Interactive Section */}
          <View style={styles.demoSection}>
            <Text style={styles.sectionTitle}>Demos Interactivas</Text>
            <Text style={styles.sectionSubtitle}>
              Aprende cómo usar KompaPay paso a paso
            </Text>

            {/* Demo Selector */}
            <View style={styles.demoSelector}>
              {demos.map((demo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.demoTab,
                    selectedDemo === index && styles.demoTabActive,
                  ]}
                  onPress={() => handleDemoSelection(index)}
                >
                  <Ionicons
                    name={demo.icon as any}
                    size={24}
                    color={selectedDemo === index ? demo.color : KompaColors.textSecondary}
                  />
                  <Text style={[
                    styles.demoTabText,
                    selectedDemo === index && { color: demo.color, fontWeight: '600' }
                  ]}>
                    {demo.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Demo Content */}
            <BlurView intensity={20} style={styles.demoContent}>
              <LinearGradient
                colors={[demos[selectedDemo].color + '20', 'transparent']}
                style={styles.demoGradient}
              >
                <View style={styles.demoHeader}>
                  <View style={[styles.demoIcon, { backgroundColor: demos[selectedDemo].color }]}>
                    <Ionicons
                      name={demos[selectedDemo].icon as any}
                      size={32}
                      color="white"
                    />
                  </View>
                  <View style={styles.demoInfo}>
                    <Text style={styles.demoTitle}>{demos[selectedDemo].title}</Text>
                    <Text style={styles.demoDescription}>
                      {demos[selectedDemo].description}
                    </Text>
                  </View>
                </View>

                <View style={styles.demoSteps}>
                  {demos[selectedDemo].steps.map((step, index) => (
                    <View key={index} style={styles.stepItem}>
                      <View style={[styles.stepNumber, { backgroundColor: demos[selectedDemo].color }]}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.demoButton} onPress={startDemo}>
                  <LinearGradient
                    colors={[demos[selectedDemo].color, demos[selectedDemo].color + 'CC']}
                    style={styles.demoButtonGradient}
                  >
                    <Text style={styles.demoButtonText}>Ver Demo</Text>
                    <Ionicons name="play-circle" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Características Técnicas</Text>
            <Text style={styles.sectionSubtitle}>
              Tecnología de vanguardia para la mejor experiencia
            </Text>

            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <Animated.View key={index} style={styles.featureCard}>
                  <BlurView intensity={15} style={styles.featureCardBlur}>
                    <View style={styles.featureHeader}>
                      <Ionicons
                        name={feature.icon as any}
                        size={28}
                        color={KompaColors.primary}
                      />
                      <Text style={styles.featureValue}>{feature.value}</Text>
                    </View>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </BlurView>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>¿Por qué KompaPay?</Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color={KompaColors.success} />
                <Text style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Ahorra tiempo:</Text> No más cálculos manuales ni discusiones sobre quién debe qué
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color={KompaColors.success} />
                <Text style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Transparencia total:</Text> Todos ven los gastos y pagos en tiempo real
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color={KompaColors.success} />
                <Text style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Funciona offline:</Text> Registra gastos sin internet, se sincroniza automáticamente
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color={KompaColors.success} />
                <Text style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Resolución inteligente:</Text> Maneja conflictos automáticamente con fairness
                </Text>
              </View>
            </View>
          </View>

          {/* Get Started CTA */}
          <View style={styles.ctaSection}>
            <LinearGradient
              colors={[KompaColors.primary, KompaColors.secondary]}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaTitle}>¿Listo para comenzar?</Text>
              <Text style={styles.ctaSubtitle}>
                Únete a miles de usuarios que ya simplifican sus gastos compartidos
              </Text>
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Comenzar Ahora</Text>
                <Ionicons name="arrow-forward" size={20} color={KompaColors.primary} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    alignItems: 'center' as const,
    paddingVertical: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSizes.title,
    fontWeight: 'bold' as const,
    color: KompaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    textAlign: 'center' as const,
    paddingHorizontal: Spacing.lg,
  },
  demoSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600' as const,
    color: KompaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  demoSelector: {
    flexDirection: 'row' as const,
    marginBottom: Spacing.lg,
    backgroundColor: KompaColors.gray100,
    borderRadius: 12,
    padding: Spacing.xs,
  },
  demoTab: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  demoTabActive: {
    backgroundColor: KompaColors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoTabText: {
    fontSize: FontSizes.xs,
    color: KompaColors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center' as const,
  },
  demoContent: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: Spacing.lg,
  },
  demoGradient: {
    padding: Spacing.lg,
  },
  demoHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.lg,
  },
  demoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing.md,
  },
  demoInfo: {
    flex: 1,
  },
  demoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600' as const,
    color: KompaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  demoDescription: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
  },
  demoSteps: {
    marginBottom: Spacing.lg,
  },
  stepItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing.md,
  },
  stepNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: '600' as const,
    color: 'white',
  },
  stepText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: KompaColors.textPrimary,
  },
  demoButton: {
    borderRadius: 25,
    overflow: 'hidden' as const,
  },
  demoButtonGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  demoButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: 'white',
    marginRight: Spacing.sm,
  },
  featuresSection: {
    marginBottom: Spacing.xxl,
  },
  featuresGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  featureCard: {
    width: (screenWidth - Spacing.md * 3) / 2,
    marginBottom: Spacing.md,
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  featureCardBlur: {
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  featureHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.sm,
  },
  featureValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold' as const,
    color: KompaColors.primary,
  },
  featureTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: KompaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
    lineHeight: 18,
  },
  benefitsSection: {
    marginBottom: Spacing.xxl,
  },
  benefitsList: {
    marginTop: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: Spacing.lg,
  },
  benefitText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: KompaColors.textPrimary,
    marginLeft: Spacing.md,
    lineHeight: 22,
  },
  benefitTitle: {
    fontWeight: '600' as const,
    color: KompaColors.textPrimary,
  },
  ctaSection: {
    marginBottom: Spacing.xl,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  ctaGradient: {
    padding: Spacing.lg,
    alignItems: 'center' as const,
  },
  ctaTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: Spacing.sm,
  },
  ctaSubtitle: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    marginBottom: Spacing.lg,
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  ctaButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: KompaColors.primary,
    marginRight: Spacing.sm,
  },
};
