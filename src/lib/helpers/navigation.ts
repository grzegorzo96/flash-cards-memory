/**
 * Checks if the current route matches the navigation item
 */
export function isActiveRoute(currentPath: string, itemPath: string): boolean {
  // Exact match for dashboard
  if (itemPath === '/dashboard') {
    return currentPath === '/dashboard';
  }

  // Prefix match for other routes
  return currentPath.startsWith(itemPath);
}

/**
 * Gets user initials from email
 */
export function getUserInitials(email: string): string {
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
}
