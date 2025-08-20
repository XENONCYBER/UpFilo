// Color palette for user avatars and identification
export const USER_COLORS = [
  "bg-electric-blue",
  "bg-electric-purple", 
  "bg-soft-green",
  "bg-warm-orange",
  "bg-coral-red",
  "bg-gradient-to-br from-blue-500 to-purple-600",
  "bg-gradient-to-br from-green-500 to-blue-500",
  "bg-gradient-to-br from-orange-500 to-red-500",
  "bg-gradient-to-br from-purple-500 to-pink-500",
  "bg-gradient-to-br from-teal-500 to-cyan-500",
  "bg-gradient-to-br from-indigo-500 to-purple-500",
  "bg-gradient-to-br from-yellow-500 to-orange-500",
  "bg-gradient-to-br from-pink-500 to-rose-500",
  "bg-gradient-to-br from-cyan-500 to-blue-500",
  "bg-gradient-to-br from-emerald-500 to-teal-500",
  "bg-gradient-to-br from-violet-500 to-purple-500",
];

// Color variants for mentions and highlights
export const USER_COLOR_VARIANTS = {
  mention: [
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200",
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200",
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200",
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200",
  ],
  border: [
    "border-blue-300 dark:border-blue-600",
    "border-purple-300 dark:border-purple-600",
    "border-green-300 dark:border-green-600",
    "border-orange-300 dark:border-orange-600",
    "border-red-300 dark:border-red-600",
    "border-teal-300 dark:border-teal-600",
    "border-indigo-300 dark:border-indigo-600",
    "border-yellow-300 dark:border-yellow-600",
    "border-pink-300 dark:border-pink-600",
    "border-cyan-300 dark:border-cyan-600",
    "border-emerald-300 dark:border-emerald-600",
    "border-violet-300 dark:border-violet-600",
  ]
};

/**
 * Generate a consistent color for a user based on their username
 * @param userName - The username to generate a color for
 * @returns A CSS class string for the user's color
 */
export const getUserColor = (userName: string): string => {
  // Create a simple hash from the username
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    const char = userName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Get absolute value and use modulo to get index
  const colorIndex = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[colorIndex];
};

/**
 * Get a mention-style color for a user
 * @param userName - The username to generate a color for
 * @returns A CSS class string for mention styling
 */
export const getUserMentionColor = (userName: string): string => {
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    const char = userName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const colorIndex = Math.abs(hash) % USER_COLOR_VARIANTS.mention.length;
  return USER_COLOR_VARIANTS.mention[colorIndex];
};

/**
 * Get a border color for a user
 * @param userName - The username to generate a color for
 * @returns A CSS class string for border styling
 */
export const getUserBorderColor = (userName: string): string => {
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    const char = userName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const colorIndex = Math.abs(hash) % USER_COLOR_VARIANTS.border.length;
  return USER_COLOR_VARIANTS.border[colorIndex];
};

/**
 * Get user initials for avatar display
 * @param userName - The username to get initials from
 * @returns A string of 1-2 characters representing the user
 */
export const getUserInitials = (userName: string): string => {
  return userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2); // Max 2 letters
};
