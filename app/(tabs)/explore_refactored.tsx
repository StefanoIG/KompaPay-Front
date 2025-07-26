import { KompaColors } from '@/constants/Styles';
import { useAuth } from '@/hooks/useAuth';
import { useExploreUI } from '@/hooks/useUI';
import { exploreStyles } from '@/styles/explore.styles';
import { tabsStyles } from '@/styles/tabs.styles';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const { user } = useAuth();
  const {
    selectedDemo,
    demos,
    features,
    handleDemoSelection,
    startDemo,
  } = useExploreUI();

  return (
    <SafeAreaView style={tabsStyles.container}>
      <LinearGradient
        colors={[KompaColors.background, KompaColors.gray50]}
        style={tabsStyles.gradient}
      >
        <ScrollView
          style={tabsStyles.containerPadded}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={tabsStyles.header}>
            <Text style={tabsStyles.headerTitle}>Explora KompaPay</Text>
            <Text style={tabsStyles.headerSubtitle}>
              Descubre todas las características que hacen único a KompaPay
            </Text>
          </View>

          {/* Demo Interactive Section */}
          <View style={exploreStyles.demoSection}>
            <Text style={exploreStyles.sectionTitle}>Demos Interactivas</Text>
            <Text style={exploreStyles.sectionSubtitle}>
              Aprende cómo usar KompaPay paso a paso
            </Text>

            {/* Demo Selector */}
            <View style={exploreStyles.demoSelector}>
              {demos.map((demo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    exploreStyles.demoTab,
                    selectedDemo === index && exploreStyles.demoTabActive,
                  ]}
                  onPress={() => handleDemoSelection(index)}
                >
                  <Ionicons
                    name={demo.icon as any}
                    size={24}
                    color={selectedDemo === index ? demo.color : KompaColors.textSecondary}
                  />
                  <Text style={[
                    exploreStyles.demoTabText,
                    selectedDemo === index && { color: demo.color, fontWeight: '600' }
                  ]}>
                    {demo.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Demo Content */}
            <BlurView intensity={20} style={exploreStyles.demoContent}>
              <LinearGradient
                colors={[demos[selectedDemo].color + '20', 'transparent']}
                style={exploreStyles.demoGradient}
              >
                <View style={exploreStyles.demoHeader}>
                  <View style={[exploreStyles.demoIcon, { backgroundColor: demos[selectedDemo].color }]}>
                    <Ionicons
                      name={demos[selectedDemo].icon as any}
                      size={32}
                      color="white"
                    />
                  </View>
                  <View style={exploreStyles.demoInfo}>
                    <Text style={exploreStyles.demoTitle}>{demos[selectedDemo].title}</Text>
                    <Text style={exploreStyles.demoDescription}>
                      {demos[selectedDemo].description}
                    </Text>
                  </View>
                </View>

                <View style={exploreStyles.demoSteps}>
                  {demos[selectedDemo].steps.map((step, index) => (
                    <View key={index} style={exploreStyles.stepItem}>
                      <View style={[exploreStyles.stepNumber, { backgroundColor: demos[selectedDemo].color }]}>
                        <Text style={exploreStyles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={exploreStyles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={exploreStyles.demoButton} onPress={startDemo}>
                  <LinearGradient
                    colors={[demos[selectedDemo].color, demos[selectedDemo].color + 'CC']}
                    style={exploreStyles.demoButtonGradient}
                  >
                    <Text style={exploreStyles.demoButtonText}>Ver Demo</Text>
                    <Ionicons name="play-circle" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Features Grid */}
          <View style={exploreStyles.featuresSection}>
            <Text style={exploreStyles.sectionTitle}>Características Técnicas</Text>
            <Text style={exploreStyles.sectionSubtitle}>
              Tecnología de vanguardia para la mejor experiencia
            </Text>

            <View style={exploreStyles.featuresGrid}>
              {features.map((feature, index) => (
                <Animated.View key={index} style={exploreStyles.featureCard}>
                  <BlurView intensity={15} style={exploreStyles.featureCardBlur}>
                    <View style={exploreStyles.featureHeader}>
                      <Ionicons
                        name={feature.icon as any}
                        size={28}
                        color={KompaColors.primary}
                      />
                      <Text style={exploreStyles.featureValue}>{feature.value}</Text>
                    </View>
                    <Text style={exploreStyles.featureTitle}>{feature.title}</Text>
                    <Text style={exploreStyles.featureDescription}>{feature.description}</Text>
                  </BlurView>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Benefits Section */}
          <View style={exploreStyles.benefitsSection}>
            <Text style={exploreStyles.sectionTitle}>¿Por qué KompaPay?</Text>
            
            <View style={exploreStyles.benefitsList}>
              <View style={exploreStyles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color={KompaColors.success} />
                <Text style={exploreStyles.benefitText}>
                  <Text style={exploreStyles.benefitTitle}>Ahorra tiempo:</Text> No más cálculos manuales ni discusiones sobre quién debe qué
                </Text>
              </View>
              
              <View style={exploreStyles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color={KompaColors.success} />
                <Text style={exploreStyles.benefitText}>
                  <Text style={exploreStyles.benefitTitle}>Transparencia total:</Text> Todos ven los gastos y pagos en tiempo real
                </Text>
              </View>
              
              <View style={exploreStyles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color={KompaColors.success} />
                <Text style={exploreStyles.benefitText}>
                  <Text style={exploreStyles.benefitTitle}>Funciona offline:</Text> Registra gastos sin internet, se sincroniza automáticamente
                </Text>
              </View>
              
              <View style={exploreStyles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color={KompaColors.success} />
                <Text style={exploreStyles.benefitText}>
                  <Text style={exploreStyles.benefitTitle}>Resolución inteligente:</Text> Maneja conflictos automáticamente con fairness
                </Text>
              </View>
            </View>
          </View>

          {/* Get Started CTA */}
          <View style={exploreStyles.ctaSection}>
            <LinearGradient
              colors={[KompaColors.primary, KompaColors.secondary]}
              style={exploreStyles.ctaGradient}
            >
              <Text style={exploreStyles.ctaTitle}>¿Listo para comenzar?</Text>
              <Text style={exploreStyles.ctaSubtitle}>
                Únete a miles de usuarios que ya simplifican sus gastos compartidos
              </Text>
              <TouchableOpacity style={exploreStyles.ctaButton}>
                <Text style={exploreStyles.ctaButtonText}>Comenzar Ahora</Text>
                <Ionicons name="arrow-forward" size={20} color={KompaColors.primary} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
