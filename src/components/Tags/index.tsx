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

          return (
            <Link
              key={tag.name}
              href={`/tag/${tag.name}`}
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              }}
              className="px-3 py-1 rounded-full text-sm border hover:opacity-80 transition-opacity"
            >
              #{tag.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Tags;
