import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MessageFormatter } from '@/utils/messageFormatter';

interface FormattedMessageProps {
  content: string;
  sender: 'user' | 'bot';
  className?: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ 
  content, 
  sender, 
  className = '' 
}) => {
  const navigate = useNavigate();
  const formatMessage = (text: string) => {
    return text.split('\n').map((line, index) => (
<div key={index} className="chat-message-line">
  {line}
</div>
    ));
  };
  const formattedContent = sender === 'bot' 
    ? MessageFormatter.formatBotMessage(content)
    : MessageFormatter.formatUserMessage(content);

  // Set up click handlers for links after component mounts
  useEffect(() => {
    const handleLinkClicks = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('chat-link')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) {
          if (href.startsWith('/')) {
            // Internal navigation using router
            try {
              navigate({ to: href as any });
            } catch (error) {
              // Fallback to window.location if route doesn't exist
              console.warn('Route not found, using fallback navigation:', href);
              window.location.href = href;
            }
          } else {
            // External link
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }
      }
    };

    document.addEventListener('click', handleLinkClicks);
    return () => document.removeEventListener('click', handleLinkClicks);
  }, [navigate]);

  return (
    <div className={`chat-message-content chat-formatted-content ${sender === 'bot' ? 'bot-message' : 'user-message'} ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }} 
 />
  );
};