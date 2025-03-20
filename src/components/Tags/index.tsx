import React from 'react';
import Link from 'next/link';
import { getTagColour } from '@/utils/tagColors';

interface TagsProps {
  tags: string[];
}

// List of tags and their corresponding colors, any tag not in this list will default to gray
// Colors are based on the Tailwind color palette
export const tagList: [string, string][] = [
  ['legacy', 'pink'],
  ['vr', 'lime'],
  ['tech', 'emerald'],
  ['3d-printing', 'rose'],
  ['typescript', 'yellow'],
  ['react', 'blue'],
  ['nextjs', 'black'],
  ['ai', 'amber'],
  ['cloud services', 'gray'],
  ['content', 'orange'],
  ['design', 'indigo'],
  ['frontend', 'teal'],
  ['backend', 'cyan'],
  ['devops', 'sky'],
  ['databases', 'stone'],
  ['careers', 'violet'],
  ['goals', 'fuchsia'],
  ['personal', 'purple'],
];

  /**
   * Displays a list of tags for a post.
   *
   * @param {{ tags: string[] }} props The tags to display.
   * @returns {JSX.Element} The tags component.
   */
const Tags: React.FC<TagsProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Tags</h2>
      <div className="flex flex-wrap gap-2">
        {tags.sort((a, b) => {
          const aIsInList = tagList.some(([slug]) => slug === a);
          const bIsInList = tagList.some(([slug]) => slug === b);
          if (aIsInList && !bIsInList) return -1;
          if (!aIsInList && bIsInList) return 1;
          return 0;
        }).map((tag) => (
          <Link 
            key={tag} 
            href={`/tag/${tag}`}
            className={[
              getTagColour({slug: tag, type: 'bg', level: '100'}),
              getTagColour({slug: tag, type: 'text', level: '800'}),
              getTagColour({slug: tag, type: 'hover', level: '100'}),
              getTagColour({slug: tag, type: 'hover-text', level: '100'}),
              'hover:bg-opacity-70',
              'hover:text-opacity-80',
              'border',
              getTagColour({slug: tag, type: 'border', level: '400'}),
              'px-3',
              'py-1',
              'rounded-full',
              'text-sm',
            ].join(' ')}
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tags;
