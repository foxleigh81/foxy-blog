import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Author } from '@/sanity/schemaTypes/authorType';
import { urlFor } from '@/sanity/lib/image';
import BlockContent from '@/components/BlockContent';

interface AuthorBioProps {
  author: Author;
}

const AuthorBio: React.FC<AuthorBioProps> = ({ author }) => {
  if (!author) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center">
        {author.image?.asset && (
          <div className="mr-4 relative w-20 h-20  aspect-square">
            <Image
              src={urlFor(author.image).width(80).height(80).url()}
              alt={author.name}
              fill
              sizes="80px"
              className="object-cover rounded-full"
            />
          </div>
        )}
        <div>
          <h3 className="font-bold text-lg">
            <Link href={`/author/${author.slug?.current}`} className="hover:text-primary">
              {author.name}
            </Link>
          </h3>
          {author.bio && (
            <div className="text-gray-600 text-sm">
              <BlockContent content={author.bio} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorBio;
