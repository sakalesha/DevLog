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

import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import { marked } from 'marked';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Automatically detect if content in the database was stored as raw Markdown
 * (or if Quill wrapped raw markdown lines like <p># Title</p> or <p>- Item</p>),
 * and convert it to HTML via marked before rendering.
 */
function normalizeContent(raw: string): string {
  if (!raw) return '';

  // Check if it looks like raw markdown or has unparsed markdown headers/lists/blockquotes
  const hasUnparsedMarkdown = (
    /^(?:<p>)?\s*#{1,6}\s+.+/m.test(raw) ||
    /^(?:<p>)?\s*[-*+]\s+.+/m.test(raw) ||
    /^(?:<p>)?\s*>\s+.+/m.test(raw) ||
    /^(?:<p>)?\s*\d+\.\s+.+/m.test(raw) ||
    /```[\s\S]*?```/.test(raw)
  );

  if (hasUnparsedMarkdown) {
    // Clean up Quill's <p> wrapping if present so marked can parse markdown blocks cleanly
    const cleaned = raw
      .replace(/<p>\s*(#{1,6}\s+.+?)\s*<\/p>/gi, '$1\n\n')
      .replace(/<p>\s*([-*+]\s+.+?)\s*<\/p>/gi, '$1\n')
      .replace(/<p>\s*(\d+\.\s+.+?)\s*<\/p>/gi, '$1\n')
      .replace(/<p>\s*(>\s+.+?)\s*<\/p>/gi, '$1\n\n')
      .replace(/<p>\s*(```[\s\S]*?```)\s*<\/p>/gi, '$1\n\n')
      .replace(/<p>\s*(---.*?)\s*<\/p>/gi, '$1\n\n');

    marked.setOptions({ gfm: true, breaks: true });
    let parsed = marked.parse(cleaned) as string;

    // Convert GitHub alerts [!IMPORTANT], [!NOTE], etc. inside blockquotes
    parsed = parsed.replace(/<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:<br>|\s*)/gi, (match, type) => {
      const colors: Record<string, string> = {
        NOTE: '#3b82f6',
        TIP: '#10b981',
        IMPORTANT: '#f59e0b',
        WARNING: '#f97316',
        CAUTION: '#ef4444'
      };
      const color = colors[type.toUpperCase()] || '#6366f1';
      return `<blockquote style="border-left: 4px solid ${color}; padding: 1rem; margin: 1.5rem 0; background: rgba(100, 116, 139, 0.08); border-radius: 0.5rem;"><p><strong style="color: ${color}; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em;">${type.toUpperCase()}:</strong><br>`;
    });
    return parsed;
  }

  return raw;
}

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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const normalizedHtml = normalizeContent(html);

  useEffect(() => {
    if (!ref.current) return;

    // 1. Assign heading IDs
    assignHeadingIds(ref.current);

    // 2. Highlight all code blocks
    //    Quill emits: <pre class="ql-syntax"> or <pre><code>
    const preBlocks = ref.current.querySelectorAll<HTMLElement>('pre');
    preBlocks.forEach(highlightBlock);

    // 3. Add click listener to images for Lightbox zoom
    const images = ref.current.querySelectorAll<HTMLImageElement>('img');
    images.forEach((img) => {
      img.style.cursor = 'zoom-in';
      img.title = 'Click to view full screen';
      img.onclick = () => setLightboxSrc(img.src);
    });
  }, [normalizedHtml, ref]);

  return (
    <>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="
          rich-content-viewer
          ql-editor
          max-w-[700px] mx-auto
          text-slate-800 dark:text-slate-200
          leading-[1.85] text-lg md:text-[1.15rem]
          font-sans
          prose dark:prose-invert max-w-none

          prose-headings:scroll-mt-24
          prose-headings:font-display
          prose-headings:tracking-tight
          prose-headings:text-slate-900 prose-headings:dark:text-white

          prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:font-black prose-h1:mt-14 prose-h1:mb-6
          prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:font-extrabold prose-h2:mt-12 prose-h2:mb-5 prose-h2:border-b prose-h2:border-slate-200/80 prose-h2:dark:border-slate-800/80 prose-h2:pb-3
          prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-indigo-600 prose-h3:dark:text-indigo-400
          prose-h4:text-lg prose-h4:font-bold prose-h4:mt-6 prose-h4:mb-2

          prose-p:leading-[1.85] prose-p:mb-6 prose-p:text-slate-800 prose-p:dark:text-slate-200

          prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
          prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
          prose-li:leading-[1.8] prose-li:my-1.5 prose-li:text-slate-800 prose-li:dark:text-slate-200
          prose-li:marker:text-primary-500 prose-li:marker:font-bold

          prose-code:text-indigo-600 dark:prose-code:text-amber-400
          prose-code:bg-slate-100 dark:prose-code:bg-slate-800/80
          prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.88em]
          prose-code:font-mono prose-code:before:content-none prose-code:after:content-none

          prose-blockquote:border-l-4 prose-blockquote:border-indigo-500
          prose-blockquote:bg-gradient-to-r prose-blockquote:from-indigo-50/80 prose-blockquote:to-violet-50/40 prose-blockquote:dark:from-indigo-950/40 prose-blockquote:dark:to-violet-950/20
          prose-blockquote:px-6 prose-blockquote:py-5 prose-blockquote:rounded-2xl prose-blockquote:not-italic
          prose-blockquote:my-8 prose-blockquote:text-indigo-950 prose-blockquote:dark:text-indigo-200 prose-blockquote:shadow-sm
          prose-blockquote:font-medium

          prose-a:text-indigo-600 dark:prose-a:text-indigo-400
          prose-a:font-semibold prose-a:no-underline hover:prose-a:underline

          prose-strong:text-slate-900 dark:prose-strong:text-white
          prose-strong:font-bold
          prose-strong:bg-amber-100/40 prose-strong:dark:bg-amber-900/20 prose-strong:px-1 prose-strong:rounded
          prose-em:text-slate-800 dark:prose-em:text-slate-200

          prose-table:text-sm prose-table:my-8
          prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-3 prose-th:rounded-t
          prose-th:font-bold
          prose-td:p-3 prose-td:border-b prose-td:border-slate-100 dark:prose-td:border-slate-800

          prose-hr:my-10 prose-hr:border-slate-200 dark:prose-hr:border-slate-800

          [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!border-0 [&_pre]:!rounded-none [&_pre]:!overflow-visible [&_pre]:!my-8
        "
        dangerouslySetInnerHTML={{ __html: normalizedHtml }}
      />

      {/* ── Image Lightbox Modal ────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-zoom-out"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxSrc(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close Lightbox"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <img
              src={lightboxSrc}
              alt="Zoomed view"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-white/70">
              <span>Click outside or close button to exit</span>
              <span className="opacity-40">·</span>
              <a
                href={lightboxSrc}
                target="_blank"
                rel="noreferrer"
                download
                className="hover:text-white underline transition-colors"
              >
                Open Original / Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RichContentViewer;
