import { Dimensions, StyleSheet } from 'react-native';
import { FontSizes, KompaColors, Spacing } from '../constants/Styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const tabsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KompaColors.background,
  },
  gradient: {
    flex: 1,
  },
  containerPadded: {
    paddingHorizontal: Spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  // Dashboard styles
  dashboardContainer: {
    flex: 1,
    backgroundColor: KompaColors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: KompaColors.surface,
    borderRadius: 12,
    padding: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: KompaColors.primary,
    shadowColor: KompaColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: KompaColors.textSecondary,
    marginTop: Spacing.xs,
  },
  tabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  scrollContainer: {
    flex: 1,
  },
  // Overview tab styles
  overviewCard: {
    backgroundColor: KompaColors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewCardGradient: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  overviewTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: 'white',
  },
  overviewAmount: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.xs,
  },
  overviewSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
    textAlign: 'center',
  },
  // Groups tab styles
  groupsList: {
    flex: 1,
  },
  groupCard: {
    backgroundColor: KompaColors.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  groupName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    flex: 1,
  },
  groupMembers: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: KompaColors.gray200,
  },
  groupStat: {
    alignItems: 'center',
  },
  groupStatValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: KompaColors.primary,
  },
  groupStatLabel: {
    fontSize: FontSizes.xs,
    color: KompaColors.textSecondary,
    marginTop: Spacing.xs,
  },
  // Floating action button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Expenses tab styles
  expensesList: {
    flex: 1,
  },
  expenseCard: {
    backgroundColor: KompaColors.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  expenseDescription: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    flex: 1,
  },
  expenseAmount: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: KompaColors.primary,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expenseDate: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
  },
  expenseStatus: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
  },
  expenseStatusPending: {
    backgroundColor: KompaColors.warning + '20',
    color: KompaColors.warning,
  },
  expenseStatusPaid: {
    backgroundColor: KompaColors.success + '20',
    color: KompaColors.success,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  modalContent: {
    backgroundColor: KompaColors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
    textAlign: 'center',
  },
  modalForm: {
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  modalButtonPrimary: {
    backgroundColor: KompaColors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: KompaColors.gray200,
  },
  modalButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: 'white',
  },
  modalButtonTextSecondary: {
    color: KompaColors.textSecondary,
  },
  // Profile styles
  profileHeader: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: KompaColors.surface,
    borderRadius: 16,
    marginBottom: Spacing.lg,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: KompaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  profileName: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: KompaColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: FontSizes.md,
    color: KompaColors.textSecondary,
  },
  profileSection: {
    backgroundColor: KompaColors.background,
    borderRadius: 12,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileSectionHeader: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: KompaColors.gray200,
  },
  profileSectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: KompaColors.textPrimary,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: KompaColors.gray100,
  },
  profileOptionLast: {
    borderBottomWidth: 0,
  },
  profileOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileOptionIcon: {
    marginRight: Spacing.md,
  },
  profileOptionText: {
    fontSize: FontSizes.md,
    color: KompaColors.textPrimary,
    flex: 1,
  },
  profileOptionValue: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
    marginRight: Spacing.sm,
  },
  logoutButton: {
    marginTop: Spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: 'white',
  },
  // Input styles for modals
  input: {
    backgroundColor: KompaColors.gray50,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: KompaColors.gray200,
    color: KompaColors.textPrimary,
    marginBottom: Spacing.md,
  },
});
