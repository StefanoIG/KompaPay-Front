import { KompaColors } from '@/constants/Styles';
import { StyleSheet } from 'react-native';

export const reportesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KompaColors.background,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: KompaColors.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: KompaColors.primary,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: KompaColors.textPrimary,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: KompaColors.gray50,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: KompaColors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resumenCard: {
    backgroundColor: KompaColors.gray50,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  resumenLabel: {
    fontSize: 16,
    color: KompaColors.textSecondary,
  },
  resumenValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: KompaColors.primary,
  },
});
