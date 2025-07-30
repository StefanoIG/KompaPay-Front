import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function useExplorePageLogic() {
  const router = useRouter();
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [currentStatPeriod, setCurrentStatPeriod] = useState('month');
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
      color: '#2ecc71',
    },
    {
      icon: "people",
      value: "23",
      label: "Grupos activos",
      trend: "+3 nuevos grupos",
      color: '#007bff',
    },
    {
      icon: "wallet",
      value: "$15,230",
      label: "Ahorros totales",
      trend: "+8% de eficiencia",
      color: '#6c63ff',
    },
    {
      icon: "time",
      value: "4.8h",
      label: "Tiempo ahorrado",
      trend: "Esta semana",
      color: '#f1c40f',
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

  return {
    activeShowcase,
    setActiveShowcase,
    currentStatPeriod,
    setCurrentStatPeriod,
    pulseStyle,
    showcaseData,
    statisticsData,
    capabilitiesData,
    handleGetStarted,
  };
}
