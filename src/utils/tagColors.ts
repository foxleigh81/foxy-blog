import { sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import { Tag } from '@/sanity/schemaTypes/tagType';

// Cache for tag colors to avoid repeated queries
const tagColorCache: Record<string, string> = {};

// Function to get tag data from Sanity
export const getTagData = async (slug: string): Promise<Tag | null> => {
  if (!slug) return null;

  try {
    const query = groq`*[_type == "tag" && slug.current == $slug][0]`;
    const tag = await sanityClient.fetch<Tag | null>(query, { slug });
    return tag;
  } catch (error) {
    console.error(`Error fetching tag data for ${slug}:`, error);
    return null;
  }
};

// Calculate text color for contrast (returns light or dark color)
const getContrastTextColor = (hexColor: string): string => {
  // Extract the RGB components
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate perceived brightness (YIQ equation)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black for bright backgrounds, white for dark ones
  return yiq >= 128 ? '#000000' : '#ffffff';
};

// Calculate border color (slightly darker shade of the base color)
const getBorderColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Darken by a factor (e.g., multiply by 0.8)
  const darkenFactor = 0.8;
  const newR = Math.floor(r * darkenFactor);
  const newG = Math.floor(g * darkenFactor);
  const newB = Math.floor(b * darkenFactor);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// Calculate a hover color (slightly lighter shade of the base color)
const getHoverColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Lighten by mixing with white
  const lightenFactor = 0.2;
  const newR = Math.floor(r + (255 - r) * lightenFactor);
  const newG = Math.floor(g + (255 - g) * lightenFactor);
  const newB = Math.floor(b + (255 - b) * lightenFactor);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// A type to represent tag colors
export interface TagColors {
  background: string;
  text: string;
  border: string;
  hover: string;
}

// Function to calculate a consistent set of colors for a tag
export const calculateTagColors = (hexColor: string): TagColors => {
  return {
    background: hexColor,
    text: getContrastTextColor(hexColor),
    border: getBorderColor(hexColor),
    hover: getHoverColor(hexColor),
  };
};

// A utility to get all colors for a tag
export const getTagColors = async (slug: string): Promise<TagColors> => {
  if (!slug) {
    // Default colors for tags without a slug
    return calculateTagColors('#6b7280'); // gray-500
  }

  // Check cache first
  const cacheKey = `colors-${slug}`;
  if (tagColorCache[cacheKey]) {
    return JSON.parse(tagColorCache[cacheKey]) as TagColors;
  }

  // Get tag data from Sanity
  const tagData = await getTagData(slug);
  if (!tagData || !tagData.color?.hex) {
    // Default colors for tags without a color
    return calculateTagColors('#6b7280'); // gray-500
  }

  // Calculate the colors
  const colors = calculateTagColors(tagData.color.hex);

  // Cache the result
  tagColorCache[cacheKey] = JSON.stringify(colors);
  return colors;
};

// Sync version for client-side rendering
export const getTagColorsSync = (hexColor: string = '#6b7280'): TagColors => {
  return calculateTagColors(hexColor);
};
