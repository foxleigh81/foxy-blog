import React from 'react';
import Image from 'next/image';

interface ImageContainerProps {
  dimensions: {
    width: number;
    height: number;
  };
  src: string;
  alt?: string;
  caption?: string;
  attribution?: string;
  alignment?: 'full' | 'left' | 'right' | 'center';
  className?: string;
}

const ImageContainer: React.FC<ImageContainerProps> = ({
  dimensions,
  src,
  alt = '',
  caption,
  attribution,
  alignment = 'full',
  className = '',
}) => {
  const aspectRatio = dimensions.width / dimensions.height;

  // Determine figure classes based on alignment
  let figureClasses = 'relative mt-0 mb-4';
  switch (alignment) {
    case 'left':
      figureClasses += ' float-left mr-6 mb-2 max-w-[50%]';
      break;
    case 'right':
      figureClasses += ' float-right ml-6 mb-2 max-w-[50%]';
      break;
    case 'center':
      figureClasses += ' mx-auto w-[600px]';
      break;
    case 'full':
    default:
      figureClasses += ' w-full';
      break;
  }

  // Determine image classes based on alignment
  let imageClasses = 'rounded-md overflow-hidden';
  if (alignment === 'full') {
    imageClasses += ' object-cover';
  } else {
    imageClasses += ' object-contain';
  }

  return (
    <figure className={`${figureClasses} ${className}`} style={{ aspectRatio }}>
      <Image
        src={src}
        alt={alt}
        fill={alignment !== 'left' && alignment !== 'right'}
        width={alignment === 'left' || alignment === 'right' ? dimensions.width : undefined}
        height={alignment === 'left' || alignment === 'right' ? dimensions.height : undefined}
        className={imageClasses}
        sizes={alignment === 'full'
          ? "(max-width: 640px) 100vw, (max-width: 768px) 80vw, 800px"
          : alignment === 'center'
            ? "600px"
            : "50vw"
        }
        priority
      />
      {attribution && (
        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
          &copy; Copyright {attribution}
        </div>
      )}
      {caption && (
        <figcaption className={`text-sm text-gray-600 mt-2 ${alignment === 'center' ? 'text-center' : ''}`}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageContainer;
