import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="text-zinc-200 leading-relaxed text-sm md:text-base font-light tracking-wide">
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
          em: ({ node, ...props }) => <em className="text-zinc-400 italic" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-4 text-white uppercase tracking-widest mt-6" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 text-white uppercase tracking-wider mt-5" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold mb-2 text-white mt-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1 marker:text-zinc-500" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1 marker:text-zinc-500" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-zinc-700 pl-4 py-1 my-4 text-zinc-400 italic" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs font-mono text-zinc-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;