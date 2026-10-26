// Print every page of the already loaded PDF; no export or signed-URL refetch.
export async function printPdfDocument(pdf, { signal, onProgress = () => {}, title = "PDF" } = {}) {
  signal?.throwIfAborted();
  const frame = document.createElement("iframe");
  frame.title = "Print PDF";
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, { position: "fixed", right: "0", bottom: "0", width: "1px", height: "1px", border: "0", opacity: "0" });
  document.body.appendChild(frame);
  let renderTask, timer, removed = false;
  const cleanup = () => { if (removed) return; removed = true; clearTimeout(timer); signal?.removeEventListener("abort", abort); frame.remove(); };
  const abort = () => { renderTask?.cancel(); cleanup(); };
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const doc = frame.contentDocument;
    if (!doc || !frame.contentWindow?.print) throw new Error("Printing is unavailable in this browser. Download the PDF to print it.");
    doc.title = title;
    const style = doc.createElement("style");
    style.textContent = "html,body{margin:0;padding:0;background:white}section{margin:0;padding:0;break-after:page;overflow:hidden}section:last-child{break-after:auto}img{display:block;width:100%;height:100%;object-fit:contain}";
    doc.head.appendChild(style);
    // Print every page independently of the viewer's selected page, width or zoom.
    // Page-sized images preserve the PDF layout without copying viewer controls.
    for (let number = 1; number <= pdf.numPages; number++) {
      signal?.throwIfAborted();
      onProgress(number, pdf.numPages);
      const page = await pdf.getPage(number);
      signal?.throwIfAborted();
      const natural = page.getViewport({ scale: 1 });
      // Bound each raster allocation, including PDFs with unusually large pages.
      const scale = Math.min(2, Math.sqrt(16_000_000 / (natural.width * natural.height)));
      const viewport = page.getViewport({ scale });
      // PDF.js registers embedded fonts in the viewer document. Rendering in
      // the iframe loses those FontFaces and turns subset glyphs into boxes.
      // Only the completed page image belongs in the isolated print document.
      const canvas = document.createElement("canvas");
      try {
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        renderTask = page.render({ canvasContext: canvas.getContext("2d"), viewport, intent: "print" });
        await renderTask.promise;
        signal?.throwIfAborted();
        style.textContent += `@page pdfSheet${number}{size:${natural.width}pt ${natural.height}pt;margin:0}`;
        const sheet = doc.createElement("section");
        Object.assign(sheet.style, { page: `pdfSheet${number}`, width: `${natural.width}pt`, height: `${natural.height}pt` });
        const image = doc.createElement("img");
        image.alt = `Page ${number}`;
        image.src = canvas.toDataURL("image/png");
        sheet.appendChild(image); doc.body.appendChild(sheet);
        // Decode each print image before releasing the source canvas and opening print.
        await image.decode();
      } finally { canvas.width = 0; canvas.height = 0; renderTask = null; }
    }
    signal?.throwIfAborted();
    frame.contentWindow.addEventListener("afterprint", cleanup, { once: true });
    // Fallback for browsers that do not dispatch afterprint for an iframe.
    timer = setTimeout(cleanup, 120_000);
    frame.contentWindow.focus();
    frame.contentWindow.print();
    return cleanup;
  } catch (error) { cleanup(); throw error; }
}
