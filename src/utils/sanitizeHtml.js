/**
 * Sanitizes HTML content to prevent XSS attacks and conflicts with jQuery
 * Removes script tags, event handlers, and potentially dangerous attributes
 */
const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary container to parse HTML safely
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove all script tags
  const scripts = temp.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove style tags that might contain malicious CSS
  const styles = temp.querySelectorAll('style');
  styles.forEach(style => style.remove());

  // Remove event handler attributes
  const eventHandlers = [
    'onload', 'onerror', 'onclick', 'ondblclick', 'onmousedown', 'onmouseup',
    'onmouseover', 'onmousemove', 'onmouseout', 'onkeydown', 'onkeyup',
    'onkeypress', 'onchange', 'onsubmit', 'onfocus', 'onblur', 'onwheel'
  ];

  // Walk through all elements and remove event handlers
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(element => {
    // Remove event handler attributes
    eventHandlers.forEach(handler => {
      if (element.hasAttribute(handler)) {
        element.removeAttribute(handler);
      }
    });

    // Remove javascript: protocol from href and src
    if (element.hasAttribute('href')) {
      const href = element.getAttribute('href');
      if (href && href.toLowerCase().startsWith('javascript:')) {
        element.removeAttribute('href');
      }
    }

    if (element.hasAttribute('src')) {
      const src = element.getAttribute('src');
      if (src && src.toLowerCase().startsWith('javascript:')) {
        element.removeAttribute('src');
      }
    }

    // Remove data: protocol from src (can contain malicious content)
    if (element.hasAttribute('src')) {
      const src = element.getAttribute('src');
      if (src && src.toLowerCase().startsWith('data:')) {
        element.removeAttribute('src');
      }
    }
  });

  // Prevent jQuery plugins from running on this HTML
  // Add a data attribute to mark this as safe/managed by React
  const rootElement = temp.firstElementChild || temp;
  if (rootElement && rootElement.nodeType === 1) {
    rootElement.setAttribute('data-react-managed', 'true');
  }

  return temp.innerHTML;
};

/**
 * Safely renders HTML content as React-managed content
 * This prevents jQuery from interfering with React's DOM management
 */
export const useSafeHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return { __html: '' };
  }
  return { __html: sanitizeHtml(html) };
};

export default sanitizeHtml;
