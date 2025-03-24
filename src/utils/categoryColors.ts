// A utility to get consistent colors for categories
export const getCategoryColor = (categorySlug: string): string => {
  // Map specific categories to specific colors
  const categoryColorMap: Record<string, string> = {
    'technically-minded': 'bg-blue-600',
    'digital-industry': 'bg-green-700',
    'meandering-insanity': 'bg-purple-600',
    'mind-body-and-soul': 'bg-pink-600',
    'scribblings': 'bg-rose-600',
  };

  // Return the mapped color or a default color
  return categoryColorMap[categorySlug] || 'bg-gray-600';
};

// A utility to get text color based on background color
export const getCategoryTextColor = (): string => {
  // All our background colors are dark enough for white text
  return 'text-white';
};
