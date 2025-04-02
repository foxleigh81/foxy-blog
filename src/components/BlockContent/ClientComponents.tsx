'use client';

import dynamic from 'next/dynamic';
import type { PortableTextComponentProps } from '@portabletext/react';

const YouTube = dynamic(() => import('react-youtube'), { ssr: false });
const InstagramEmbed = dynamic(() => import('../../components/InstagramEmbed'), { ssr: false });

export function YouTubeComponent({
  value,
}: PortableTextComponentProps<{
  video?: { id: string };
  autoplay?: boolean;
  controls?: boolean;
}>) {
  if (!value?.video?.id) {
    return null;
  }

  return (
    <div className="my-4 aspect-video clear-both">
      <YouTube
        videoId={value.video.id}
        opts={{
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: value.autoplay ? 1 : 0,
            controls: value.controls ? 1 : 0,
          },
        }}
        className="w-full h-full"
      />
    </div>
  );
}

export function InstagramComponent({ value }: PortableTextComponentProps<{ url?: string }>) {
  if (!value?.url) {
    return null;
  }
  return (
    <div className="clear-both">
      <InstagramEmbed url={value.url} />
    </div>
  );
}
