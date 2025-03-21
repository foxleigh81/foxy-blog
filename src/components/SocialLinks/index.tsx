"use client";

import React from 'react';
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { SiBluesky } from 'react-icons/si';

interface SocialLinksProps {
  className?: string;
  showLabels?: boolean;
  iconSize?: number;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ 
  className = "", 
  showLabels = false,
  iconSize = 22
}) => {
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/alexfoxleigh/',
      icon: <FaLinkedin size={iconSize} />
    },
    {
      name: 'GitHub',
      url: 'https://github.com/foxleigh81',
      icon: <FaGithub size={iconSize} />
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/foxleigh81',
      icon: <FaInstagram size={iconSize} />
    },
    {
      name: 'Bluesky',
      url: 'https://bsky.app/profile/foxleigh81.bsky.social',
      icon: <SiBluesky size={iconSize} />
    }
  ];

  return (
    <div className={`flex flex-wrap ${showLabels ? 'gap-6' : 'gap-5'} ${className}`}>
      {socialLinks.map((link) => (
        <a 
          key={link.name}
          href={link.url} 
          className={`text-black hover:text-black/80 transition-colors ${!showLabels ? 'relative group' : 'flex items-center gap-2'} `}
          aria-label={`${link.name} Profile`}
          title={showLabels ? undefined : `${link.name} Profile`}
        >
          {link.icon}
          
          {showLabels ? (
            <span>{link.name}</span>
          ) : (
            <>
              <span className="sr-only">{link.name}</span>
              <span className="absolute -bottom-10 right-0 bg-white text-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap before:content-[''] before:absolute before:top-0 before:right-2 before:w-3 before:h-3 before:bg-white before:transform before:-translate-y-1/2 before:rotate-45">
                {link.name}
              </span>
            </>
          )}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
