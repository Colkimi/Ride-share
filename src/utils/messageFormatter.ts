export class MessageFormatter {
  static formatBotMessage(message: string): string {
    if (!message) return '';
    
    let formattedMessage = message;
    
    // Convert custom link format to clickable links (e.g., "Dashboard: /dashboard")
    formattedMessage = formattedMessage.replace(
      /([^:\n]+): (\/[^\s\n]+)/g, 
      '<a href="$2" class="chat-link" onclick="handleNavigation(\'$2\')">$1</a>'
    );
    
    // Convert markdown-style links [text](url)
    formattedMessage = formattedMessage.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="chat-link" onclick="handleNavigation(\'$2\')">$1</a>'
    );
    
    // Convert URLs to clickable links
    formattedMessage = formattedMessage.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" class="chat-link" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Format headers (## Header)
    formattedMessage = formattedMessage.replace(/^## (.+)$/gm, '<h3 class="chat-header">$1</h3>');
    formattedMessage = formattedMessage.replace(/^# (.+)$/gm, '<h2 class="chat-main-header">$1</h2>');
    
    // Format bold text
    formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong class="chat-bold">$1</strong>');
    
    // Format italic text
    formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em class="chat-italic">$1</em>');
    
    // Format code blocks with language support
    formattedMessage = formattedMessage.replace(/```(\w+)?\n?(.*?)```/gs, '<pre class="chat-code-block" data-language="$1">$2</pre>');
    
    // Format inline code
    formattedMessage = formattedMessage.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
    
    // Format blockquotes
    formattedMessage = formattedMessage.replace(/^> (.+)$/gm, '<blockquote class="chat-quote">$1</blockquote>');
    
    // Format horizontal dividers (multiple formats)
    formattedMessage = formattedMessage.replace(/^─{3,}$/gm, '<hr class="chat-divider">');
    formattedMessage = formattedMessage.replace(/^-{3,}$/gm, '<hr class="chat-divider">');
    formattedMessage = formattedMessage.replace(/^\*{3,}$/gm, '<hr class="chat-divider">');
    
    // Format bullet points with better detection
    formattedMessage = formattedMessage.replace(/^[•·▪▫‣⁃] (.+)$/gm, '<li class="chat-bullet">$1</li>');
    formattedMessage = formattedMessage.replace(/^- (.+)$/gm, '<li class="chat-bullet">$1</li>');
    formattedMessage = formattedMessage.replace(/^\* (.+)$/gm, '<li class="chat-bullet">$1</li>');
    
    // Wrap consecutive bullet points in ul tags
    formattedMessage = formattedMessage.replace(
      /(<li class="chat-bullet">.*?<\/li>)(\s*<li class="chat-bullet">.*?<\/li>)*/gs,
      '<ul class="chat-list">$&</ul>'
    );
    
    // Format numbered lists
    formattedMessage = formattedMessage.replace(/^(\d+)\. (.+)$/gm, '<li class="chat-numbered" data-number="$1">$2</li>');
    
    // Wrap consecutive numbered items in ol tags
    formattedMessage = formattedMessage.replace(
      /(<li class="chat-numbered".*?<\/li>)(\s*<li class="chat-numbered".*?<\/li>)*/gs,
      '<ol class="chat-numbered-list">$&</ol>'
    );
    
    // Format status badges (like [PENDING], [COMPLETED], etc.)
    formattedMessage = formattedMessage.replace(
      /\[([A-Z_]+)\]/g,
      '<span class="chat-status-badge chat-status-$1">$1</span>'
    );
    
    // Format emojis and special characters
    formattedMessage = formattedMessage.replace(/:\)/g, '😊');
    formattedMessage = formattedMessage.replace(/:\(/g, '😞');
    formattedMessage = formattedMessage.replace(/:D/g, '😄');
    
    // Convert line breaks (do this last to preserve other formatting)
    formattedMessage = formattedMessage.replace(/\n/g, '<br>');
    
    return formattedMessage;
  }
  
  static formatUserMessage(message: string): string {
    if (!message) return '';
    
    let formattedMessage = message;
    
    // Basic formatting for user messages
    formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedMessage = formattedMessage.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
    
    // Convert line breaks
    formattedMessage = formattedMessage.replace(/\n/g, '<br>');
    
    return formattedMessage;
  }
}

// Global function for handling navigation (accessible from onclick)
declare global {
  interface Window {
    handleNavigation: (url: string) => void;
  }
}

// Set up the global navigation handler
if (typeof window !== 'undefined') {
  window.handleNavigation = (url: string) => {
    // Check if it's an internal route
    if (url.startsWith('/')) {
      // Use your router's navigation method
      window.location.href = url;
    } else {
      // External link
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
}