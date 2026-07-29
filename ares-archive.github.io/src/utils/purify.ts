import DOMPurify from 'dompurify';

/**
 * Sanitizza HTML permettendo solo tag sicuri
 * Previene XSS attacks filtrando script, event handlers, ecc.
 */
export const sanitizeHTML = (dirtyHTML: string): string => {
  if (typeof window === 'undefined') return dirtyHTML;
  
  return DOMPurify.sanitize(dirtyHTML, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li', 'p'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select', 'a', 'meta', 'link', 'base'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onkeypress', 'onsubmit', 'onreset', 'onchange', 'ondblclick', 'oncontextmenu', 'ondrag', 'ondrop', 'onscroll', 'oncopy', 'oncut', 'onpaste']
  });
};

/**
 * Sanitizza testo semplice rimuovendo eventuali tag HTML
 */
export const sanitizeText = (dirtyText: string): string => {
  if (typeof window === 'undefined') return dirtyText;
  
  return DOMPurify.sanitize(dirtyText, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false
  }).trim();
};