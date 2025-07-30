import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function useHomePageLogic() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
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

  return {
    currentTestimonial,
    setCurrentTestimonial,
    animatedFloatingStyle,
    testimonials,
    handleGetStarted,
    handleViewDemo,
  };
}
