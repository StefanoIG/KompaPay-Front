// app/(tabs)/explore.tsx

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// 1. Importar los estilos y constantes
import { exploreStyles } from '@/styles/explore.styles';
import { tabsStyles } from '@/styles/tabs.styles';
import { KompaColors } from '@/constants/Styles';

// 2. Definir los datos estáticos FUERA del componente
// Esto evita que se redeclaren en cada render, mejorando el rendimiento.
const demos = [
    {
        title: 'Crear un Grupo',
        icon: 'people-circle-outline',
        color: KompaColors.primary,
        description: 'Organiza tus gastos con amigos, familiares o compañeros.',
        steps: ['Ve a la pestaña de Grupos', 'Toca el botón "+"', 'Dale un nombre a tu grupo', '¡Invita a tus amigos!']
    },
    {
        title: 'Registrar un Gasto',
        icon: 'receipt-outline',
        color: KompaColors.success,
        description: 'Añade un nuevo gasto y divídelo en segundos.',
        steps: ['Selecciona un grupo', 'Toca el botón "+ Gasto"', 'Añade descripción y monto', 'Elige cómo dividirlo y listo.']
    },
     {
        title: 'Ver Reportes',
        icon: 'analytics-outline',
        color: KompaColors.warning,
        description: 'Analiza tus patrones de gasto y obtén resúmenes.',
        steps: ['Ve a la pestaña de Reportes', 'Selecciona un rango de fechas', 'Filtra por grupo si lo deseas', 'Genera y exporta tu reporte en PDF.']
    }
];

const features = [
    { icon: 'cloud-offline-outline', value: '100%', title: 'Modo Offline', description: 'Funciona sin internet y sincroniza después.' },
    { icon: 'shield-checkmark-outline', value: 'AES-256', title: 'Seguridad', description: 'Encriptación de nivel bancario.' },
    { icon: 'camera-outline', value: 'OCR', title: 'Escaneo IA', description: 'Digitaliza recibos con la cámara.' },
    { icon: 'notifications-outline', value: 'Smart', title: 'Alertas', description: 'Recordatorios de pago inteligentes.' },
];


// --- Componente Principal ---

export default function ExploreScreen() {
    const router = useRouter();
    // 3. El estado de la UI vive directamente en el componente
    const [selectedDemo, setSelectedDemo] = useState(0);

    const handleStartDemo = () => {
        // Aquí puedes añadir lógica para iniciar un tutorial interactivo si lo deseas
        Alert.alert("Demo", "Esta función mostrará un tutorial interactivo.");
    };
    
    const handleGetStarted = () => {
        router.push('/(tabs)/dashboard_refactored');
    };

    const currentDemo = demos[selectedDemo]; // Para un acceso más fácil

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
                            Descubre las características que simplifican tu vida financiera
                        </Text>
                    </View>

                    {/* Demo Interactive Section */}
                    <View style={exploreStyles.demoSection}>
                        <Text style={exploreStyles.sectionTitle}>Demos Interactivas</Text>
                         <View style={exploreStyles.demoSelector}>
                            {demos.map((demo, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[exploreStyles.demoTab, selectedDemo === index && exploreStyles.demoTabActive]}
                                    onPress={() => setSelectedDemo(index)}
                                >
                                    <Ionicons name={demo.icon as any} size={24} color={selectedDemo === index ? demo.color : KompaColors.textSecondary} />
                                    <Text style={[exploreStyles.demoTabText, selectedDemo === index && { color: demo.color }]}>{demo.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <BlurView intensity={20} style={exploreStyles.demoContent}>
                            <LinearGradient colors={[currentDemo.color + '20', 'transparent']} style={exploreStyles.demoGradient}>
                                <View style={exploreStyles.demoHeader}>
                                    <View style={[exploreStyles.demoIcon, { backgroundColor: currentDemo.color }]}>
                                        <Ionicons name={currentDemo.icon as any} size={32} color="white" />
                                    </View>
                                    <View style={exploreStyles.demoInfo}>
                                        <Text style={exploreStyles.demoTitle}>{currentDemo.title}</Text>
                                        <Text style={exploreStyles.demoDescription}>{currentDemo.description}</Text>
                                    </View>
                                </View>
                                {/* ... resto del JSX ... */}
                            </LinearGradient>
                        </BlurView>
                    </View>

                    {/* Features Grid */}
                    {/* ... */}

                    {/* Get Started CTA */}
                    <View style={exploreStyles.ctaSection}>
                         <TouchableOpacity style={exploreStyles.ctaButton} onPress={handleGetStarted}>
                            <Text style={exploreStyles.ctaButtonText}>Ir a mi Dashboard</Text>
                         </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

// Los estilos (exploreStyles) permanecen iguales