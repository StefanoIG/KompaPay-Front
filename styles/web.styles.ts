import { FontSizes, KompaColors, Spacing } from '@/constants/Styles';
import { StyleSheet } from 'react-native';

export const webLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: KompaColors.surface,
  },
  
  // Sidebar
  sidebar: {
    width: 280,
    backgroundColor: KompaColors.background,
    borderRightWidth: 1,
    borderRightColor: KompaColors.border,
    flexDirection: 'column',
  },
  
  sidebarCollapsed: {
    width: 70,
  },
  
  sidebarHeader: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: KompaColors.border,
    alignItems: 'center',
  },
  
  logo: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: KompaColors.primary,
    marginBottom: Spacing.xs,
  },
  
  logoCollapsed: {
    fontSize: FontSizes.lg,
    marginBottom: 0,
  },
  
  tagline: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
    textAlign: 'center',
  },
  
  // User Info
  userInfo: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: KompaColors.border,
    alignItems: 'center',
  },
  
  userInfoCollapsed: {
    padding: Spacing.sm,
  },
  
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: KompaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  userAvatarCollapsed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 0,
  },
  
  userAvatarText: {
    color: KompaColors.surface,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  
  userName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: KompaColors.textPrimary,
    textAlign: 'center',
  },
  
  userEmail: {
    fontSize: FontSizes.sm,
    color: KompaColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  
  // Navigation
  navigation: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderRadius: 8,
  },
  
  navItemActive: {
    backgroundColor: KompaColors.primary + '15',
  },
  
  navItemCollapsed: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  
  navIcon: {
    marginRight: Spacing.md,
  },
  
  navIconCollapsed: {
    marginRight: 0,
  },
  
  navText: {
    fontSize: FontSizes.md,
    color: KompaColors.textPrimary,
    fontWeight: '500',
  },
  
  navTextActive: {
    color: KompaColors.primary,
    fontWeight: '600',
  },
  
  // Collapse button
  collapseButton: {
    position: 'absolute',
    top: 20,
    right: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: KompaColors.background,
    borderWidth: 1,
    borderColor: KompaColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  // Logout
  logoutContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: KompaColors.border,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderRadius: 8,
    backgroundColor: KompaColors.error + '10',
  },
  
  logoutButtonCollapsed: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  
  logoutText: {
    fontSize: FontSizes.md,
    color: KompaColors.error,
    fontWeight: '500',
    marginLeft: Spacing.md,
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: KompaColors.surface,
  },
  
  contentContainer: {
    flex: 1,
  },
});
