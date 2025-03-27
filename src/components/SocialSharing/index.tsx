'use client';

import React, { useState } from 'react';
import { FaLinkedin, FaFacebook, FaLink, FaTimes, FaTwitter } from 'react-icons/fa';
import { SiBluesky } from 'react-icons/si';
import { toast } from 'react-hot-toast';

interface SocialSharingProps {
  url: string;
  title: string;
  excerpt?: string;
  className?: string;
}

const SocialSharing: React.FC<SocialSharingProps> = ({
  url,
  title,
  excerpt = '',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [showBlueskyHelp, setShowBlueskyHelp] = useState(false);

  // Handles copying the URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy link');
      });
  };

  // Share handlers for each platform
  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(excerpt)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToBluesky = () => {
    // Toggle the help modal
    setShowBlueskyHelp(true);

    // Copy the text to clipboard for easy pasting
    const blueskyText = `${title}\n\n${url}`;
    navigator.clipboard
      .writeText(blueskyText)
      .then(() => {
        toast.success('Bluesky sharing text copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy Bluesky text: ', err);
        toast.error('Failed to prepare Bluesky share');
      });
  };

  return (
    <div className={`py-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Share this article</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={shareToLinkedIn}
          className="flex items-center gap-2 text-xs text-white bg-[#0077B5] hover:bg-[#005582] transition-colors rounded-md px-3 py-2"
          aria-label="Share on LinkedIn"
        >
          <FaLinkedin size={16} />
          <span>LinkedIn</span>
        </button>

        <button
          onClick={shareToFacebook}
          className="flex items-center gap-2 text-xs text-white bg-[#1877F2] hover:bg-[#0e5aa7] transition-colors rounded-md px-3 py-2"
          aria-label="Share on Facebook"
        >
          <FaFacebook size={16} />
          <span>Facebook</span>
        </button>

        <button
          onClick={shareToTwitter}
          className="flex items-center gap-2 text-xs text-white bg-[#1DA1F2] hover:bg-[#0c85d0] transition-colors rounded-md px-3 py-2"
          aria-label="Share on Twitter"
        >
          <FaTwitter size={16} />
          <span>Twitter</span>
        </button>

        <button
          onClick={shareToBluesky}
          className="flex items-center gap-2 text-xs text-white bg-[#0085ff] hover:bg-[#0066cc] transition-colors rounded-md px-3 py-2"
          aria-label="Share on Bluesky"
        >
          <SiBluesky size={16} />
          <span>Bluesky</span>
        </button>

        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 text-xs text-white rounded-md px-3 py-2 transition-colors ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}
          aria-label="Copy link"
        >
          <FaLink size={16} />
          <span>Copy Link</span>
        </button>
      </div>

      {/* Bluesky help modal */}
      {showBlueskyHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowBlueskyHelp(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close help"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-primary">Share to Bluesky</h3>
            <div className="mb-4">
              <p className="mb-2">
                Bluesky doesn&apos;t support direct sharing yet. Follow these steps:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>The article title and link have been copied to your clipboard</li>
                <li>
                  Open{' '}
                  <a
                    href="https://bsky.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Bluesky
                  </a>{' '}
                  in a new tab
                </li>
                <li>Create a new post and paste the content</li>
                <li>Edit your post as desired and publish!</li>
              </ol>
            </div>
            <button
              onClick={() => {
                window.open('https://bsky.app', '_blank', 'noopener,noreferrer');
                setShowBlueskyHelp(false);
              }}
              className="bg-[#0085ff] text-white py-2 px-4 rounded-lg hover:bg-[#0066cc] transition-colors w-full"
            >
              Open Bluesky
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialSharing;
