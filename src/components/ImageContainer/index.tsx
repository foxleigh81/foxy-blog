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
  blurDataURL?: string;
}

const ImageContainer: React.FC<ImageContainerProps> = ({
  dimensions,
  src,
  alt = '',
  caption,
  attribution,
  alignment = 'full',
  className = '',
  blurDataURL,
}) => {
  // Determine figure classes based on alignment
  let figureClasses = 'relative mt-0 mb-4 w-full';
  switch (alignment) {
    case 'left':
      figureClasses += ' md:mx-0 md:float-left md:mr-6 w-full md:max-w-[50%]';
      break;
    case 'right':
      figureClasses += ' md:mx-0 md:float-right md:ml-6 w-full md:max-w-[50%]';
      break;
    case 'center':
      figureClasses += ' md:mx-auto md:w-[600px]';
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

  // Calculate responsive sizes based on alignment
  const getSizes = () => {
    switch (alignment) {
      case 'full':
        return '100vw';
      case 'center':
        return '(max-width: 640px) 100vw, 600px';
      case 'left':
      case 'right':
        return '(max-width: 768px) 100vw, 50vw';
      default:
        return '100vw';
    }
  };

  return (
    <figure className={`${figureClasses} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className={imageClasses}
        sizes={getSizes()}
        loading={alignment === 'full' ? 'eager' : 'lazy'}
        quality={80}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
      />
      {attribution && (
        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
          &copy; Copyright {attribution}
        </div>
      )}
      {caption && (
        <figcaption
          className={`text-sm text-gray-600 mt-2 ${alignment === 'center' ? 'text-center' : ''}`}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageContainer;
