/**
 * Generate a default workspace name in format: MMMdd-hhmm.1t
 * Example: Oct11-2150.1t (October 11, 21:50)
 */
export const generateDefaultWorkspaceName = (): string => {
  const now = new Date();
  
  // Get month abbreviation (MMM)
  const month = now.toLocaleDateString('en-US', { month: 'short' });
  
  // Get day (dd) - pad with zero if needed
  const day = now.getDate().toString().padStart(2, '0');
  
  // Get hours (hh) - 24-hour format, pad with zero if needed
  const hours = now.getHours().toString().padStart(2, '0');
  
  // Get minutes (mm) - pad with zero if needed
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  // Combine: MMM + dd + - + hh + mm + .1t
  return `${month}${day}-${hours}${minutes}.1t`;
};

/**
 * Get a user-friendly display name for the workspace
 * Shows the generated name but with better formatting
 */
export const getWorkspaceDisplayName = (name: string): string => {
  // If it's our generated format, show it as-is
  if (name.match(/^[A-Za-z]{3}\d{2}-\d{4}\.1t$/)) {
    return name;
  }
  
  // For other names, return as-is
  return name;
};
