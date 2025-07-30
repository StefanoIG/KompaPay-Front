import { Dimensions, Platform, StyleSheet } from 'react-native';
import { FontSizes, GlobalStyles, KompaColors, Spacing } from '../constants/Styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = screenWidth > 768;

export const homeStyles = StyleSheet.create({
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
