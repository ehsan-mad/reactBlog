/**
 * Color Utilities for Blog Application
 * 
 * This module provides functions for consistent color handling across the application,
 * particularly for category tags. It ensures that the same category name always gets
 * the same color, while providing visually appealing options that work with the
 * silver/black theme.
 */

/**
 * Array of carefully selected colors that work well with the silver/black theme
 * Each color is defined with background, text, and border colors for consistency
 * @type {Array<{bg: string, text: string, border: string}>}
 */
const categoryColors = [
  { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700' },          // Dark gray
  { bg: 'bg-zinc-800', text: 'text-white', border: 'border-zinc-700' },          // Zinc
  { bg: 'bg-stone-800', text: 'text-white', border: 'border-stone-700' },        // Stone
  { bg: 'bg-neutral-800', text: 'text-white', border: 'border-neutral-700' },    // Neutral
  { bg: 'bg-slate-800', text: 'text-white', border: 'border-slate-700' },        // Slate
  { bg: 'bg-red-900', text: 'text-white', border: 'border-red-800' },            // Deep red
  { bg: 'bg-amber-900', text: 'text-white', border: 'border-amber-800' },        // Amber
  { bg: 'bg-emerald-900', text: 'text-white', border: 'border-emerald-800' },    // Emerald
  { bg: 'bg-teal-900', text: 'text-white', border: 'border-teal-800' },          // Teal
  { bg: 'bg-indigo-900', text: 'text-white', border: 'border-indigo-800' },      // Indigo
];

/**
 * Get a random but deterministic color for a category
 * The same category name will always get the same color
 * 
 * @param {string} categoryName - The name of the category
 * @returns {Object} - Object containing bg, text, and border classes
 */
export const getRandomCategoryColor = (categoryName) => {
  if (!categoryName) {
    // Default color for empty/null category names
    return categoryColors[0];
  }
  
  // Hash the category name to a consistent number
  const seed = categoryName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use the hash to select a color
  const index = seed % categoryColors.length;
  return categoryColors[index];
};

/**
 * Get the full set of Tailwind CSS classes for a category
 * 
 * @param {string} categoryName - The name of the category
 * @returns {string} - Space-separated string of Tailwind CSS classes
 */
export const getCategoryColorClasses = (categoryName) => {
  const { bg, text, border } = getRandomCategoryColor(categoryName);
  return `${bg} ${text} ${border}`;
};

/**
 * Get the hex color value for a category (for use with non-Tailwind styling)
 * Not currently used, but available for future extensions
 * 
 * @param {string} categoryName - The name of the category
 * @returns {string} - Hex color code
 */
export const getCategoryHexColor = (categoryName) => {
  // Map of bg classes to hex colors for non-Tailwind contexts
  const hexColors = {
    'bg-gray-900': '#111827',
    'bg-zinc-800': '#27272a',
    'bg-stone-800': '#292524',
    'bg-neutral-800': '#262626',
    'bg-slate-800': '#1e293b',
    'bg-red-900': '#7f1d1d',
    'bg-amber-900': '#78350f',
    'bg-emerald-900': '#064e3b',
    'bg-teal-900': '#134e4a',
    'bg-indigo-900': '#312e81'
  };
  
  const { bg } = getRandomCategoryColor(categoryName);
  return hexColors[bg] || '#000000';
};