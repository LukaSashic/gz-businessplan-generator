'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

interface DocumentPreviewProps {
  content: string;
}

export default function DocumentPreview({ content }: DocumentPreviewProps) {
  return (
    <div className="mx-auto max-w-4xl px-8 py-6">
      <article className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
