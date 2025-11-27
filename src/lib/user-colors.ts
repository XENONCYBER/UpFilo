// Color palette for user avatars and identification
// Using hex colors directly for reliability
export const USER_COLORS = [
  "#2563eb", // blue-600
  "#9333ea", // purple-600
  "#16a34a", // green-600
  "#ea580c", // orange-600
  "#dc2626", // red-600
  "#0d9488", // teal-600
  "#4f46e5", // indigo-600
  "#d97706", // amber-600
  "#db2777", // pink-600
  "#0891b2", // cyan-600
  "#059669", // emerald-600
  "#7c3aed", // violet-600
  "#e11d48", // rose-600
  "#0284c7", // sky-600
  "#c026d3", // fuchsia-600
  "#1d4ed8", // blue-700
  "#7e22ce", // purple-700
  "#15803d", // green-700
  "#c2410c", // orange-700
  "#b91c1c", // red-700
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
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
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
    "border-amber-300 dark:border-amber-600",
    "border-pink-300 dark:border-pink-600",
    "border-cyan-300 dark:border-cyan-600",
    "border-emerald-300 dark:border-emerald-600",
    "border-violet-300 dark:border-violet-600",
  ]
};

/**
 * Generate a consistent color for a user based on their username
 * @param userName - The username to generate a color for
 * @returns A hex color string for the user's color
 */
export const getUserColor = (userName: string): string => {
  // Normalize username to lowercase for consistent colors
  const normalizedName = userName.toLowerCase().trim();
  
  // Create a simple hash from the username
  let hash = 0;
  for (let i = 0; i < normalizedName.length; i++) {
    const char = normalizedName.charCodeAt(i);
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
