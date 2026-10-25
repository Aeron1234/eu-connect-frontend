export async function parseOfficeFile(file, sheet, signal) {
  signal.throwIfAborted();
  const buffer = await file.blob.arrayBuffer();
  signal.throwIfAborted();
  const worker = new Worker(new URL("./officePreview.worker.js", import.meta.url), { type: "module" });
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (error, result) => {
      if (done) return; done = true;
      clearTimeout(timer); signal.removeEventListener("abort", onAbort); worker.terminate();
      if (error) reject(error); else resolve(result);
    };
    const onAbort = () => finish(signal.reason || new Error("Preview closed."));
    const timer = setTimeout(() => finish(new Error("Reading this document timed out. Download the original file to open it.")), 20_000);
    signal.addEventListener("abort", onAbort, { once: true });
    worker.onerror = () => finish(new Error("Could not read this file. Download the original to open it."));
    worker.onmessage = ({ data }) => data.ok ? finish(null, data.result) : finish(new Error(data.error));
    worker.postMessage({ buffer, kind: file.kind, sheet }, [buffer]);
  });
}
