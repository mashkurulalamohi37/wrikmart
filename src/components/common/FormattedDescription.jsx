import React from 'react';

/**
 * Parses and beautifully renders formatted product descriptions.
 * Handles bold (**text** or <strong>), italic, bullet lists (• or -),
 * numbered lists, headings (###), highlights/badges, and line breaks.
 */
export const FormattedDescription = ({ content, className = '' }) => {
  if (!content) return null;

  // If content contains raw HTML tags (like <strong>, <ul>, <p>, etc.)
  const hasHtml = /<\/?(strong|b|em|i|u|p|ul|ol|li|h[1-6]|br|span|div)[^>]*>/i.test(content);
  if (hasHtml) {
    return (
      <div 
        className={`prose prose-sm max-w-none text-slate-600 leading-relaxed space-y-1.5 [&_strong]:text-navy-900 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_h3]:font-black [&_h3]:text-navy-900 [&_h3]:text-sm [&_h3]:mt-2 [&_h3]:mb-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Parse markdown-style lines
  const lines = content.split('\n');

  return (
    <div className={`text-xs text-slate-600 leading-relaxed space-y-1 ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading 3 (### Heading)
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-black text-navy-900 text-xs sm:text-sm mt-2 mb-1">
              {renderInlineStyles(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }

        // Bullet point (• item or - item or * item)
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.endsWith('*'))) {
          const itemText = trimmed.replace(/^(•|-|\*)\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <span className="flex-1">{renderInlineStyles(itemText)}</span>
            </div>
          );
        }

        // Numbered list (1. item)
        const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="font-bold text-brand-600 shrink-0 min-w-[14px]">
                {numberMatch[1]}.
              </span>
              <span className="flex-1">{renderInlineStyles(numberMatch[2])}</span>
            </div>
          );
        }

        // Special Highlight Badge line (starts with ⭐ or 🛡️ or 🚚 or 💡)
        if (/^(⭐|🛡️|🚚|💡|🔥|✨)/.test(trimmed)) {
          return (
            <div key={idx} className="p-2 rounded-xl bg-brand-50/70 border border-brand-200/80 text-brand-900 font-medium my-1.5 flex items-start gap-2">
              <span>{renderInlineStyles(trimmed)}</span>
            </div>
          );
        }

        // Normal paragraph line
        return (
          <p key={idx} className="my-0.5">
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Helper to render inline **bold**, *italic*, and `code` styles.
 */
function renderInlineStyles(text) {
  if (!text) return '';

  // Split by bold (**bold**), italic (*italic*), code (`code`)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-navy-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-brand-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
