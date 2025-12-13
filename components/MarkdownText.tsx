import React from 'react';

interface MarkdownTextProps {
  content: string;
  class?: string;
  truncate?: boolean;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, class: className = "", truncate = false }) => {
  if (!content) return <span className="text-gray-400 italic">Sin contenido.</span>;

  let textToDisplay = content;
  if (truncate && content.length > 200) {
    textToDisplay = content.substring(0, 200) + "...";
  }

  // A very basic renderer to preserve newlines and wrap text.
  // In a full production app, we would use 'react-markdown'.
  return (
    <div className={`prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap break-words ${className}`}>
      {textToDisplay}
    </div>
  );
};