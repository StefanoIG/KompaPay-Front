import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInUp
} from 'react-native-reanimated';
import { ComponentStyles, KompaColors } from '../constants/Styles';
import { useHomePageLogic } from '../hooks/useHomePageLogic';
import { homeStyles } from '../styles/home.styles';

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
  delay?: number;
};
function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(800)}
      style={homeStyles.featureCard}
    >
      <View style={homeStyles.featureIcon}>
        <Text style={homeStyles.featureIconText}>{icon}</Text>
      </View>
      <Text style={homeStyles.featureTitle}>{title}</Text>
      <Text style={homeStyles.featureDescription}>{description}</Text>
    </Animated.View>
  );
}

type StatCardProps = {
  number: string;
  label: string;
  delay?: number;
};
function StatCard({ number, label, delay = 0 }: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(800)}
      style={homeStyles.statCard}
    >
      <Text style={homeStyles.statNumber}>{number}</Text>
      <Text style={homeStyles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

type BenefitItemProps = {
  icon: string;
  text: string;
  delay?: number;
};
function BenefitItem({ icon, text, delay = 0 }: BenefitItemProps) {
  return (
    <Animated.View
      entering={FadeInLeft.delay(delay).duration(600)}
      style={homeStyles.benefitItem}
    >
      <View style={homeStyles.benefitIcon}>
        <Text style={homeStyles.benefitIconText}>{icon}</Text>
      </View>
      <Text style={homeStyles.benefitText}>{text}</Text>
    </Animated.View>
  );
}


export default function HomePage() {
  // Responsive helpers
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width > 768;
  const {
    currentTestimonial,
    setCurrentTestimonial,
    animatedFloatingStyle,
    testimonials,
    handleGetStarted,
    handleViewDemo,
  } = useHomePageLogic();

  return (
    <View style={homeStyles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={homeStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={homeStyles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[KompaColors.primary, KompaColors.secondary]}
          style={[homeStyles.heroSection, isWeb && isLargeScreen && homeStyles.heroSectionWeb]}
        >
          <View style={homeStyles.heroContent}>
            <Animated.View
              style={animatedFloatingStyle}
              entering={FadeIn.delay(200).duration(1000)}
            >
              <Text style={homeStyles.heroEmoji}>💰</Text>
            </Animated.View>
            <Animated.Text
              entering={FadeInUp.delay(400).duration(800)}
              style={[ComponentStyles.textHero, homeStyles.heroTitle]}
            >
              KompaPay
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(600).duration(800)}
              style={[ComponentStyles.textSubtitle, homeStyles.heroSubtitle]}
            >
              La forma más inteligente de gestionar gastos compartidos
            </Animated.Text>
            <Animated.View
              entering={FadeInUp.delay(800).duration(800)}
              style={[homeStyles.heroButtons, isWeb && isLargeScreen && homeStyles.heroButtonsWeb]}
            >
              <TouchableOpacity
                style={[ComponentStyles.button, homeStyles.primaryButton]}
                onPress={handleGetStarted}
              >
                <Text style={homeStyles.primaryButtonText}>Comenzar Ahora</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ComponentStyles.buttonSecondary, homeStyles.secondaryButton]}
                onPress={handleViewDemo}
              >
                <Text style={homeStyles.secondaryButtonText}>Ver Funcionalidades</Text>
              </TouchableOpacity>
            </Animated.View>
            {/* Stats */}
            <Animated.View
              entering={FadeInUp.delay(1000).duration(800)}
              style={[homeStyles.statsContainer, isWeb && isLargeScreen && homeStyles.statsContainerWeb]}
            >
              <StatCard number="50K+" label="Usuarios Activos" delay={1200} />
              <StatCard number="1M+" label="Gastos Gestionados" delay={1400} />
              <StatCard number="99.9%" label="Tiempo Activo" delay={1600} />
            </Animated.View>
          </View>
        </LinearGradient>
        {/* Features Section */}
        <View style={homeStyles.section}>
          <Animated.Text
            entering={FadeInUp.delay(200).duration(800)}
            style={[ComponentStyles.textTitle, homeStyles.sectionTitle]}
          >
            ¿Por qué elegir KompaPay?
          </Animated.Text>
          <View style={[homeStyles.featuresGrid, isWeb && isLargeScreen && homeStyles.featuresGridWeb]}>
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
          style={homeStyles.benefitsSection}
        >
          <View style={homeStyles.container}>
            <Animated.Text
              entering={FadeInUp.delay(200).duration(800)}
              style={[ComponentStyles.textTitle, homeStyles.sectionTitle]}
            >
              Beneficios que marcan la diferencia
            </Animated.Text>
            <View style={[homeStyles.benefitsList, isWeb && isLargeScreen && homeStyles.benefitsListWeb]}>
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
        <View style={homeStyles.section}>
          <Animated.View
            entering={FadeInUp.delay(200).duration(800)}
            style={homeStyles.ctaContainer}
          >
            <Text style={[ComponentStyles.textTitle, homeStyles.ctaTitle]}>
              ¿Listo para simplificar tus gastos?
            </Text>
            <Text style={[ComponentStyles.textSubtitle, homeStyles.ctaSubtitle]}>
              Únete a miles de usuarios que ya gestionan sus gastos de forma inteligente
            </Text>
            <TouchableOpacity
              style={[ComponentStyles.button, homeStyles.ctaButton]}
              onPress={handleGetStarted}
            >
              <Text style={homeStyles.primaryButtonText}>Comenzar Gratis</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

