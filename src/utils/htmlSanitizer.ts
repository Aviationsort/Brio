/**
 * HTML Sanitization Utility
 * Strips dangerous tags, attributes, and protocols from HTML strings.
 */

const DANGEROUS_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
  'select', 'textarea', 'link', 'style', 'meta', 'base', 'frame',
  'frameset', 'applet', 'param', 'svg', 'math'
]);

const DANGEROUS_ATTRS = new Set([
  'onabort', 'onblur', 'onchange', 'onclick', 'ondblclick', 'onerror',
  'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onmousedown',
  'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onreset',
  'onresize', 'onscroll', 'onselect', 'onsubmit', 'onunload',
  'onhashchange', 'onmessage', 'onoffline', 'ononline', 'onpagehide',
  'onpageshow', 'onpopstate', 'onstorage', 'oncontextmenu',
  'onpointerdown', 'onpointermove', 'onpointerup', 'onpointercancel',
  'ongotpointercapture', 'onlostpointercapture', 'onanimationstart',
  'onanimationend', 'onanimationiteration', 'ontransitionend',
  'onwheel', 'onanimationcancel', 'onanimationend', 'onanimationiteration',
  'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel',
  'ondeviceorientation', 'ondevicemotion'
]);

function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walk = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toLowerCase();

      if (DANGEROUS_TAGS.has(tag)) {
        el.remove();
        return;
      }

      const attrsToRemove: string[] = [];
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        const attrName = attr.name.toLowerCase();
        if (DANGEROUS_ATTRS.has(attrName)) {
          attrsToRemove.push(attr.name);
        } else if (attrName.startsWith('on')) {
          attrsToRemove.push(attr.name);
        } else if (attr.value && /^javascript:/i.test(attr.value)) {
          attrsToRemove.push(attr.name);
        }
      }
      attrsToRemove.forEach(name => el.removeAttribute(name));

      if (tag === 'a' && el.hasAttribute('href')) {
        const href = el.getAttribute('href') || '';
        if (/^javascript:/i.test(href)) {
          el.removeAttribute('href');
        }
      }

      if (tag === 'img' && el.hasAttribute('src')) {
        const src = el.getAttribute('src') || '';
        if (/^javascript:/i.test(src)) {
          el.removeAttribute('src');
        }
      }
    }

    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      walk(child);
      child = next;
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export { sanitizeHtml };
