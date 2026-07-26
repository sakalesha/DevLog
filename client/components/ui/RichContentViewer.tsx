/**
 * RichContentViewer
 *
 * Renders Quill-generated HTML with:
 *  - highlight.js syntax highlighting on all code blocks
 *  - Language label badge on each code block
 *  - Line numbers rendered as a gutter
 *  - Copy-to-clipboard button per block
 *  - Developer-friendly prose typography
 */

import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Enrich heading elements with scroll-margin IDs for ToC anchors */
function assignHeadingIds(container: HTMLElement) {
  const headings = container.querySelectorAll('h1, h2, h3, h4');
  headings.forEach((h, i) => {
    (h as HTMLElement).id = `heading-${i}`;
  });
}

/** Highlight a single <pre> element using highlight.js auto-detection */
function highlightBlock(pre: HTMLElement) {
  const codeEl = pre.querySelector('code') || pre;

  // Already processed
  if (pre.dataset.highlighted) return;
  pre.dataset.highlighted = 'true';

  const rawCode = codeEl.textContent || '';

  // Auto-detect language
  const result = hljs.highlightAuto(rawCode, [
    'javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'go',
    'rust', 'cpp', 'c', 'sql', 'bash', 'shell', 'json', 'yaml', 'xml',
    'html', 'css', 'kotlin', 'swift', 'php', 'ruby', 'scala', 'dart',
  ]);

  const detectedLang = result.language || 'code';

  // Wrap pre in a relative container
  pre.style.position = 'relative';
  pre.style.paddingTop = '2.5rem';   // room for the top bar
  pre.style.paddingBottom = '1rem';

  // ── Top bar: language label + copy button ─────────────────────────────────
  if (!pre.querySelector('.hljs-topbar')) {
    const topbar = document.createElement('div');
    topbar.className = 'hljs-topbar';
    topbar.innerHTML = `
      <span class="hljs-lang-label">${detectedLang}</span>
      <button class="hljs-copy-btn" aria-label="Copy code">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy
      </button>
    `;

    const copyBtn = topbar.querySelector('.hljs-copy-btn') as HTMLButtonElement;
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(rawCode).then(() => {
        copyBtn.textContent = '✓ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          `;
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    };

    pre.insertBefore(topbar, pre.firstChild);
  }

  // ── Apply highlighted HTML ────────────────────────────────────────────────
  codeEl.innerHTML = result.value;
  codeEl.classList.add('hljs');

  // ── Line numbers ─────────────────────────────────────────────────────────
  if (!pre.querySelector('.hljs-line-numbers')) {
    const lines = rawCode.split('\n');
    // Only show line numbers for blocks with > 3 lines
    if (lines.length > 3) {
      const gutter = document.createElement('div');
      gutter.className = 'hljs-line-numbers';
      gutter.innerHTML = lines
        .map((_, i) => `<span>${i + 1}</span>`)
        .join('');
      pre.insertBefore(gutter, codeEl);
    }
  }
}

// ─── Exported helpers for EntryDetailPage ToC ─────────────────────────────────

export interface TocEntry { id: string; text: string; level: number }

export function extractToc(html: string): TocEntry[] {
  const div = document.createElement('div');
  div.innerHTML = html;
  const headings = div.querySelectorAll('h1, h2, h3');
  return Array.from(headings).map((h, i) => ({
    id: `heading-${i}`,
    text: h.textContent || '',
    level: parseInt(h.tagName[1]),
  })).filter(h => h.text.trim());
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function estimateReadingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function wordCount(html: string): number {
  return stripHtml(html).split(/\s+/).filter(Boolean).length;
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface RichContentViewerProps {
  html: string;
  /** Forwarded ref so parent can access the DOM for ToC injection etc. */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const RichContentViewer: React.FC<RichContentViewerProps> = ({ html, containerRef }) => {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = containerRef || localRef;

  useEffect(() => {
    if (!ref.current) return;

    // 1. Assign heading IDs
    assignHeadingIds(ref.current);

    // 2. Highlight all code blocks
    //    Quill emits: <pre class="ql-syntax"> or <pre><code>
    const preBlocks = ref.current.querySelectorAll<HTMLElement>('pre');
    preBlocks.forEach(highlightBlock);

    // 3. Also catch inline <code> not inside <pre> — just style, don't highlight
  }, [html, ref]);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="
        rich-content-viewer
        text-slate-700 dark:text-slate-200
        leading-relaxed text-base md:text-lg
        prose dark:prose-invert max-w-none

        prose-headings:scroll-mt-24
        prose-headings:font-bold
        prose-h1:text-2xl prose-h1:border-b prose-h1:border-slate-200 prose-h1:dark:border-slate-800 prose-h1:pb-2
        prose-h2:text-xl
        prose-h3:text-lg

        prose-p:leading-8
        prose-li:leading-7

        prose-code:text-primary-600 dark:prose-code:text-amber-400
        prose-code:bg-slate-100 dark:prose-code:bg-slate-800
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.88em]
        prose-code:font-mono prose-code:before:content-none prose-code:after:content-none

        prose-blockquote:border-l-4 prose-blockquote:border-primary-400
        prose-blockquote:bg-primary-50/60 dark:prose-blockquote:bg-primary-950/20
        prose-blockquote:rounded-r-xl prose-blockquote:not-italic
        prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300

        prose-a:text-indigo-600 dark:prose-a:text-indigo-400
        prose-a:font-semibold prose-a:no-underline hover:prose-a:underline

        prose-strong:text-slate-900 dark:prose-strong:text-white
        prose-strong:font-extrabold

        prose-table:text-sm
        prose-th:bg-slate-100 dark:prose-th:bg-slate-800
        prose-th:font-bold

        [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!border-0 [&_pre]:!rounded-none [&_pre]:!overflow-visible
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichContentViewer;
