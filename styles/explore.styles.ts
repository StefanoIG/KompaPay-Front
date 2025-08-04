import { Dimensions, StyleSheet } from 'react-native';
import { FontSizes, KompaColors, Spacing, Shadows } from '../constants/Styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const exploreStyles = StyleSheet.create({
  // Demo Interactive Section
  demoSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  demoSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: KompaColors.gray100,
    borderRadius: 12,
    padding: Spacing.xs,
  },
  demoTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  demoTabActive: {
    backgroundColor: KompaColors.background,

  },
  demoTabText: {
    fontSize: FontSizes.xs,
    color: KompaColors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  demoContent: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  demoGradient: {
    padding: Spacing.lg,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  demoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  demoInfo: {
    flex: 1,
  },
  demoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: 'white',
  },
  stepText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: KompaColors.textPrimary,
  },
  demoButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  demoButtonGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: 'white',
    marginRight: Spacing.sm,
  },
  // Features Grid
  featuresSection: {
    marginBottom: Spacing.xxl,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (screenWidth - Spacing.md * 3) / 2,
    marginBottom: Spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureCardBlur: {
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: KompaColors.primary,
  },
  featureTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
    lineHeight: 18,
  },
  // Benefits Section
  benefitsSection: {
    marginBottom: Spacing.xxl,
  },
  benefitsList: {
    marginTop: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontWeight: '600',
    color: KompaColors.textPrimary,
  },
  // CTA Section
  ctaSection: {
    marginBottom: Spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.sm,
  },
  ctaSubtitle: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: KompaColors.primary,
    marginRight: Spacing.sm,
  },
});
