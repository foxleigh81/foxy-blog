import { tagList } from '../components/Tags';

// A utility to get consistent colors for tags

export const getTagColour = ({slug, type, level}: {slug: string, type: 'bg' | 'text' | 'hover' | 'hover-text' | 'border', level: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'}): string => {
  if (!tagList.find(([slug]) => slug === slug)) return `${type}-gray-${level}`;
  // Map specific tags to specific colors
  const tagColorMap: Record<string, string> = {
    ...tagList.reduce((acc, [slug, color]) => ({ ...acc, [slug]: `${type}-${color}-${level}` }), {}),
  };
  
  return tagColorMap[slug] || `${type}-gray-${level}`;
};
