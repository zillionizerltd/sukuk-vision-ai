# Office document preview in the data room

Today the preview modal renders images inline and PDFs via the canvas viewer; Word, Excel and PowerPoint files fall back to "Inline preview isn't available for this file type" with Open/Download buttons. This adds real in-browser rendering for Office files, using client-side libraries so no file ever leaves the browser session (signed URL is already fetched as a blob).

## What gets previewed

- Word (.docx): rendered as formatted HTML — headings, bold/italic, lists, tables, embedded images.
- Excel (.xlsx, .xls, .csv): sheet tabs, with the active sheet shown as a scrollable table grid.
- PowerPoint (.pptx): slide-by-slide rendering with a slide counter; if fidelity is poor for a given deck, the existing Download / Open in new tab fallback still shows.
- Legacy .doc / .ppt (binary, pre-2007): not supported by browser libraries — these keep the current download fallback with a short note explaining why.

Existing behaviour kept as-is: comments panel, threaded replies, Download button, confidentiality/status header, Escape to close.

## Technical approach

- Add dependencies: `mammoth` (docx to HTML), `xlsx` (SheetJS, for xlsx/xls/csv), `pptx-preview` (pptx canvas rendering). All loaded with dynamic `import()` inside the viewer components so they stay out of the main bundle and never run during SSR.
- New components under `src/components/documents/`:
  - `DocxViewer.tsx` — mammoth to HTML, styled with a scoped prose wrapper using existing design tokens.
  - `SheetViewer.tsx` — SheetJS workbook read, tab strip per sheet, table with sticky header row and tabular-nums cells.
  - `PptxViewer.tsx` — renders slides into a scrollable container.
- `DocumentPreviewModal.tsx`: replace the single `isImage / isPdf` branch with a small `kind` resolver that maps MIME type plus filename extension to `image | pdf | docx | sheet | pptx | unsupported`, then dispatches to the matching viewer. Each viewer receives the already-created blob URL, shows a spinner while parsing, and on parse failure renders the current fallback block (error text + Open in new tab + Download) rather than breaking the modal.
- All viewers are client-only (dynamic import in `useEffect`), consistent with `PdfCanvasViewer`.

No database, RLS, storage or permission changes — access control and folder scoping are unchanged.
