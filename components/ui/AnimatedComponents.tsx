import { KompaColors } from '@/constants/Styles';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  delay = 0,
  duration = 800,
  springConfig = { damping: 15, stiffness: 100 },
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration });
      translateY.value = withSpring(0, springConfig);
      scale.value = withSpring(1, springConfig);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  duration?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  style,
  intensity = 10,
  duration = 3000,
}) => {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-intensity, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(intensity, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

interface PulsingElementProps {
  children: React.ReactNode;
  style?: ViewStyle;
  minScale?: number;
  maxScale?: number;
  duration?: number;
}

export const PulsingElement: React.FC<PulsingElementProps> = ({
  children,
  style,
  minScale = 0.95,
  maxScale = 1.05,
  duration = 2000,
}) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(maxScale, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(minScale, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
  animated?: boolean;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors = [KompaColors.primary, KompaColors.secondary],
  style,
  animated = false,
}) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={style}>
      <Animated.View style={[{ position: 'absolute', inset: 0 }, animated && animatedStyle]}>
        <LinearGradient
          colors={colors as any}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      {children}
    </View>
  );
};

interface SlideInElementProps {
  children: React.ReactNode;
  direction: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const SlideInElement: React.FC<SlideInElementProps> = ({
  children,
  direction,
  delay = 0,
  duration = 600,
  style,
}) => {
  const translateX = useSharedValue(direction === 'left' ? -100 : direction === 'right' ? 100 : 0);
  const translateY = useSharedValue(direction === 'top' ? -100 : direction === 'bottom' ? 100 : 0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 100 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration });
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

interface ShimmerEffectProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const shimmerTranslateX = useSharedValue(-width);

  React.useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withSequence(
        withTiming(width, { duration: 1500, easing: Easing.linear }),
        withTiming(-width, { duration: 0 })
      ),
      -1,
      false
    );
  }, [width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: KompaColors.gray200 }, style]}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

interface BouncingElementProps {
  children: React.ReactNode;
  bounceHeight?: number;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const BouncingElement: React.FC<BouncingElementProps> = ({
  children,
  bounceHeight = 20,
  duration = 1000,
  delay = 0,
  style,
}) => {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-bounceHeight, { duration: duration / 2, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: duration / 2, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      );
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
