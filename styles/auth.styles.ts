import { Dimensions, StyleSheet } from 'react-native';
import { FontSizes, KompaColors, Spacing, Shadows } from '../constants/Styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KompaColors.background,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: Spacing.xl,

  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: KompaColors.primary,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitleText: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: KompaColors.gray50,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: KompaColors.gray200,
    color: KompaColors.textPrimary,
  },
  inputFocused: {
    borderColor: KompaColors.primary,
    backgroundColor: KompaColors.background,

  },
  inputError: {
    borderColor: KompaColors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: KompaColors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  buttonContainer: {
    marginBottom: Spacing.lg,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',

  },
  buttonGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: 'white',
    marginRight: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  linkButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  linkText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: KompaColors.primary,
  },
  // Register specific styles
  registerContainer: {
    width: '100%',
    maxWidth: 450,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: KompaColors.gray300,
    borderRadius: 4,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: KompaColors.primary,
    borderColor: KompaColors.primary,
  },
  checkboxIcon: {
    fontSize: 12,
    color: 'white',
  },
  termsText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: KompaColors.primary,
    fontWeight: '500',
  },
  strengthContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  strengthBar: {
    height: 4,
    backgroundColor: KompaColors.gray200,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
});
