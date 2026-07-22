'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Shared Markdown renderer for research content + the writer preview.
export default function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div className={`prose prose-gray max-w-none prose-headings:font-bold prose-a:text-green-deep prose-h2:text-[22px] prose-h3:text-[18px] prose-p:leading-relaxed prose-p:text-gray-700 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ''}</ReactMarkdown>
    </div>
  );
}
