import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Author } from '@/sanity/schemaTypes/authorType';
import { urlFor } from '@/sanity/lib/image';

interface AuthorBioProps {
  author: Author;
}

const AuthorBio: React.FC<AuthorBioProps> = ({ author }) => {
  if (!author) return null;

  return (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <div className="flex items-center">
        {author.image?.asset && (
          <div className="mr-4 relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={urlFor(author.image).width(64).height(64).url()}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="font-bold text-lg">
            <Link href={`/author/${author.slug?.current}`} className="hover:text-primary">
              {author.name}
            </Link>
          </h3>
          {author.bio && author.bio.length > 0 && author.bio[0].children && author.bio[0].children.length > 0 && (
            <p className="text-gray-600 text-sm">{author.bio[0].children[0].text}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorBio;
