import React from 'react';
import Link from 'next/link';
import { TagColors, getTagColorsSync } from '@/utils/tagColors';

// This type allows for transition from old string tags to new reference tags
export type TagData = {
  _id: string;
  name: string;
  color: {
    hex: string;
  };
};

interface TagsProps {
  tagData: TagData[];
}

/**
 * Displays a list of tags for a post.
 *
 * @param {{ tagData: TagData[] }} props The tag data to display.
 * @returns {JSX.Element} The tags component.
 */
const Tags: React.FC<TagsProps> = ({ tagData }) => {
  if (!tagData || tagData.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Tags</h2>
      <div className="flex flex-wrap gap-2">
        {tagData.map((tag) => {
          // Get the tag colors
          const colors: TagColors = getTagColorsSync(tag.color?.hex || '#6b7280');

          // Ensure text color has good contrast with background
          const hashColor = determineHashColor(colors.background);

          return (
            <Link
              key={tag.name}
              href={`/tag/${tag.name}`}
              className="flex items-center overflow-hidden rounded-full text-xs font-bold shadow-sm group"
            >
              <span
                style={{ backgroundColor: colors.background }}
                className="flex items-center justify-center w-7 h-7"
              >
                <span style={{ color: hashColor }}>#</span>
              </span>
              <span className="px-3 py-1.5 bg-gray-800 text-white transition-colors group-hover:bg-gray-700">
                {tag.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to determine a contrasting text color
const determineHashColor = (backgroundColor: string): string => {
  // Extract the RGB components
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);

  // Calculate perceived brightness (YIQ equation)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black for bright backgrounds, white for dark ones
  return yiq >= 150 ? '#000000' : '#ffffff';
};

export default Tags;
