import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders assistant chat text as light markdown: paragraphs, lists, and real tables. */
export function ChatMarkdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed space-y-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="text-foreground">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-foreground">{children}</li>,
          h1: ({ children }) => <h3 className="text-base font-semibold text-foreground">{children}</h3>,
          h2: ({ children }) => <h3 className="text-sm font-semibold text-foreground">{children}</h3>,
          h3: ({ children }) => <h4 className="text-sm font-semibold text-foreground">{children}</h4>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-secondary px-1 py-0.5 text-[12px] font-mono">{children}</code>
          ),
          hr: () => <hr className="border-border" />,
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-secondary">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap">{children}</th>
          ),
          td: ({ children }) => <td className="px-3 py-2 align-top text-foreground">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
