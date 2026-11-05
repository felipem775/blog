import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownTextProps {
  content: string;
  className?: string;
  class?: string;
  truncate?: boolean;
}

// Configure marked with GitHub Flavored Markdown and line breaks
marked.setOptions({
  gfm: true,
  breaks: true
});

export const MarkdownText: React.FC<MarkdownTextProps> = ({ 
  content, 
  className,
  class: legacyClass, 
  truncate = false 
}) => {
  const combinedClassName = className || legacyClass || "";

  const htmlContent = useMemo(() => {
    if (!content) return "";
    let rawText = content;
    if (truncate) {
      // Strip code blocks and markdown headings for clean card previews
      const cleanText = rawText
        .replace(/```[\s\S]*?```/g, '')
        .replace(/^#+\s+/gm, '')
        .trim();
      rawText = cleanText.length > 180 ? cleanText.substring(0, 180) + "..." : cleanText;
    }

    try {
      const parsedHtml = marked.parse(rawText, { async: false }) as string;
      return DOMPurify.sanitize(parsedHtml, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel']
      });
    } catch (e) {
      console.warn("Error al renderizar Markdown:", e);
      return rawText;
    }
  }, [content, truncate]);

  if (!content) {
    return <span className="text-gray-400 italic">Sin contenido.</span>;
  }

  return (
    <div
      className={`prose prose-sm sm:prose-base max-w-none text-gray-800 break-words 
        prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight 
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
        prose-p:leading-relaxed prose-p:my-2
        prose-a:text-indigo-600 prose-a:font-medium prose-a:underline hover:prose-a:text-indigo-800
        prose-code:text-indigo-700 prose-code:bg-indigo-50/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:my-3 prose-pre:overflow-x-auto
        prose-blockquote:border-l-4 prose-blockquote:border-indigo-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:my-2
        prose-ul:list-disc prose-ul:my-2 prose-ul:pl-5
        prose-ol:list-decimal prose-ol:my-2 prose-ol:pl-5
        prose-li:my-0.5
        prose-img:rounded-lg prose-img:shadow-sm prose-img:my-3
        prose-hr:my-4 prose-hr:border-gray-200
        ${combinedClassName}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};