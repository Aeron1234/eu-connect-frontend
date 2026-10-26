// The preview frame blocks external resources/scripts through CSP and sandboxing.
// Sanitize again because react-to-print copies content into a different document.
export const OFFICE_CSP = "default-src 'none'; img-src data: blob:; font-src data: blob:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'";
export const OFFICE_BASE_CSS = 'html{color-scheme:light;background:#e8e8e8}body{margin:0;padding:16px;color:#111;background:#e8e8e8;font-family:Arial,sans-serif}#office-content{width:max-content;min-width:100%}#office-content *{box-sizing:border-box}.office-text{background:white;color:#111;white-space:pre-wrap;overflow-wrap:anywhere;padding:24px;max-width:900px;min-width:280px;line-height:1.5}.office-image{display:block;max-width:100%;height:auto}.office-sheet{border-collapse:collapse;background:white;color:#111;font-size:12px}.office-sheet th,.office-sheet td{border:1px solid #bbb;padding:6px 9px;min-width:60px;max-width:360px;overflow-wrap:anywhere;white-space:pre-wrap}.office-sheet th{background:#f2f2f2;font-weight:600}.office-sheet caption{text-align:left;font-size:16px;font-weight:bold;padding:12px;background:white}.office-sheet thead{display:table-header-group}@media print{html,body{background:white;margin:0;padding:0;zoom:1!important}#office-content{min-width:0;width:auto}.docx-wrapper{background:white!important;padding:0!important}.docx-wrapper>section.docx{box-shadow:none!important;margin:0!important;break-after:page}.docx-wrapper>section.docx:last-child{break-after:auto}.office-text{padding:0;max-width:none}.office-sheet{width:100%;font-size:9pt}.office-sheet th,.office-sheet td{min-width:0;max-width:none;padding:4px;white-space:pre-wrap}.office-sheet tr{break-inside:avoid}}';

export function createOfficeRoot(doc) {
  doc.body.replaceChildren();
  const root = doc.createElement("div"); root.id = "office-content";
  const style = doc.createElement("style"); style.textContent = OFFICE_BASE_CSS;
  root.appendChild(style); doc.body.appendChild(root); return root;
}

// Build cells with textContent so saved values cannot become HTML or active links.
export function renderSheet(doc, root, sheet) {
  const table = doc.createElement("table"); table.className = "office-sheet";
  const caption = doc.createElement("caption"); caption.textContent = sheet.names[sheet.index]; table.appendChild(caption);
  const head = doc.createElement("thead"), heading = doc.createElement("tr");
  for (const text of ["", ...sheet.columns]) { const cell = doc.createElement("th"); cell.textContent = text; cell.scope = "col"; heading.appendChild(cell); }
  head.appendChild(heading); table.appendChild(head);
  const body = doc.createElement("tbody");
  for (const row of sheet.rows) {
    const tr = doc.createElement("tr"), number = doc.createElement("th"); number.textContent = String(row.number); number.scope = "row"; tr.appendChild(number);
    for (const text of row.cells) { const cell = doc.createElement("td"); cell.textContent = text; tr.appendChild(cell); }
    body.appendChild(tr);
  }
  table.appendChild(body); root.appendChild(table);
  return table;
}

// Browser CSSOM canonicalizes declarations; inspect decoded escapes before printing.
function decodeCss(value) {
  return value.replace(/\\(?:\r\n|\n|\r)/g, "").replace(/\\([0-9a-f]{1,6})\s?|\\(.)/gi, (_, hex, escaped) => hex ? String.fromCodePoint(Math.min(parseInt(hex, 16) || 0xfffd, 0x10ffff)) : escaped);
}
function cleanRules(sheet) {
  for (let index = sheet.cssRules.length - 1; index >= 0; index--) {
    const rule = sheet.cssRules[index];
    if (rule.type === 3) { sheet.deleteRule(index); continue; } // @import
    if (rule.cssRules) cleanRules(rule);
    if (rule.style) {
      for (const name of Array.from(rule.style)) {
        const value = decodeCss(rule.style.getPropertyValue(name));
        const withoutData = value.replace(/url\(\s*(["\']?)data:[a-z0-9/+.-]+(?:;[a-z0-9=.+-]+)*;base64,[a-z0-9+/=\s]+\1\s*\)/gi, "");
        if (/url\(|expression\s*\(|image-set\s*\(|(?:^|[^a-z])image\s*\(/i.test(withoutData)) rule.style.removeProperty(name);
      }
    }
  }
}
// Remove active elements/attributes and remote CSS from the attached render root.
// Reserialize accepted CSS rules so printing copies the cleaned declarations.
export function sanitizeOfficeContent(root) {
  for (const element of root.querySelectorAll("script,iframe,object,embed,link,meta,form,input,button,foreignObject")) element.remove();
  for (const element of root.querySelectorAll("*")) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase(), value = attribute.value.trim();
      if (name.startsWith("on") || name === "srcdoc" ||
          ["href", "xlink:href"].includes(name) && !value.startsWith("#") ||
          ["src", "poster"].includes(name) && !/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,/i.test(value)) element.removeAttribute(attribute.name);
    }
    for (const name of Array.from(element.style || [])) {
      if (/url\(|expression\s*\(|image-set\s*\(|(?:^|[^a-z])image\s*\(/i.test(decodeCss(element.style.getPropertyValue(name)))) element.style.removeProperty(name);
    }
  }
  for (const style of root.querySelectorAll("style")) {
    if (!style.sheet) { style.remove(); continue; }
    try { cleanRules(style.sheet); style.textContent = Array.from(style.sheet.cssRules).map(rule => rule.cssText).join("\n"); }
    catch { style.remove(); }
  }
}

// Constrain docx-preview's element factory during construction, before attachment.
// Keep the post-render sanitizer too: styles and nested content need a second pass.
export function safeDocxElement(doc, value) {
  if (value == null) return doc.createTextNode("");
  if (typeof value !== "object") return doc.createTextNode(String(value));
  if (value.nodeType) return value;
  const { tagName = "span", ns, children, style, className, ...attributes } = value;
  if (tagName === "#comment") return doc.createComment(Array.isArray(children) ? String(children[0] || "") : String(children || ""));
  if (tagName === "#fragment") {
    const fragment = doc.createDocumentFragment();
    for (const child of children || []) fragment.appendChild(safeDocxElement(doc, child));
    return fragment;
  }
  if (["script","iframe","object","embed","link","meta"].includes(tagName.toLowerCase())) return doc.createElement("span");
  const element = ns ? doc.createElementNS(ns, tagName) : doc.createElement(tagName);
  if (className) element.setAttribute("class", className);
  if (style && typeof style === "object") Object.assign(element.style, style);
  else if (typeof style === "string") element.style.cssText = style;
  for (const [key, val] of Object.entries(attributes)) {
    if (key === "textContent") { element.textContent = String(val ?? ""); continue; }
    if (val == null || /^on/i.test(key) || ["innerHTML", "srcdoc"].includes(key)) continue;
    if (["href", "xlink:href"].includes(key) && !String(val).startsWith("#")) continue;
    if (key === "src" && !String(val).startsWith("data:image/")) continue;
    element.setAttribute(key, String(val));
  }
  if (tagName.toLowerCase() !== "style") {
    for (const property of Array.from(element.style)) if (/url\(|expression\s*\(|image-set\s*\(|(?:^|[^a-z])image\s*\(/i.test(decodeCss(element.style.getPropertyValue(property)))) element.style.removeProperty(property);
  }
  for (const child of children == null ? [] : Array.isArray(children) ? children : [children]) element.appendChild(child?.nodeType ? child : safeDocxElement(doc, child));
  return element;
}
