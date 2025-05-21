'use client';

import { useState, KeyboardEvent, MouseEvent } from 'react';

interface SkipLinkProps {
  /**
   * The ID of the element to scroll and focus to.
   */
  targetId: string;
  /**
   * The text to display within the skip link.
   * @default 'Skip to main content'
   */
  text?: string;
}

/**
 * A skip link component that becomes visible on focus and allows users to jump to a specific element on the page.
 * It slides in from the top when focused and slides out when blurred.
 */
const SkipLink: React.FC<SkipLinkProps> = ({ targetId, text = 'Skip to main content' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const navigateToTarget = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      targetElement.focus({ preventScroll: true });
      setIsVisible(false);
    }
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigateToTarget();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToTarget();
    }
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (document.activeElement?.id !== targetId) {
        setIsVisible(false);
      }
    }, 150);
  };

  return (
    <a
      href={`#${targetId}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        fixed left-0 right-0 top-0 z-[9999] block w-full p-3 text-center text-lg font-semibold
        text-white bg-slate-800
        transition-transform duration-300 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-75
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
      aria-label={text}
    >
      {text}
    </a>
  );
};

export default SkipLink;
