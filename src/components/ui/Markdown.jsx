import React from 'react'
import ReactMarkdown from 'react-markdown'

// Reusable Markdown renderer matching PostPage styles and hydration-safe rules
export default function Markdown({ children }) {
  return (
    <ReactMarkdown
      components={{
        h1: (props) => <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-6" {...props} />,
        h2: (props) => <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4" {...props} />,
        h3: (props) => <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3" {...props} />,
        p: ({ node, children, ...props }) => {
          const containsPre = Array.isArray(node?.children) && node.children.some((c) => c.tagName === 'pre')
          const Wrapper = containsPre ? 'div' : 'p'
          return (
            <Wrapper className="text-gray-700 mb-4 leading-relaxed" {...props}>
              {children}
            </Wrapper>
          )
        },
        a: ({ href, ...props }) => (
          <a
            href={href}
            className="text-gray-700 hover:text-black underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
        ol: (props) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
        blockquote: (props) => (
          <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-600 my-6" {...props} />
        ),
        pre: (props) => (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6" {...props} />
        ),
        code: ({ inline, className, children, ...props }) =>
          inline ? (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          ),
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
