// convert numbers to farsi

(() => {
  const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];

  function toPersianString(s) {
    return String(s).replace(/[0-9]/g, d => persianDigits[d.charCodeAt(0) - 48]);
  }

  function shouldSkipParent(node) {
    if (!node || !node.parentNode) return true;
    const tag = node.parentNode.nodeName && node.parentNode.nodeName.toLowerCase();
    return ['script','style','textarea','input','code','pre'].includes(tag);
  }

  function convertTextNode(textNode) {
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
    if (shouldSkipParent(textNode)) return;
    if (!/[0-9]/.test(textNode.nodeValue)) return;
    textNode.nodeValue = toPersianString(textNode.nodeValue);
  }

  function convertAttributes(root = document) {
    const els = (root.querySelectorAll) ? root.querySelectorAll('[title],[alt],[placeholder]') : [];
    els.forEach(el => {
      if (el.title && /[0-9]/.test(el.title)) el.title = toPersianString(el.title);
      if (el.alt && /[0-9]/.test(el.alt)) el.alt = toPersianString(el.alt);
      if (el.placeholder && /[0-9]/.test(el.placeholder)) el.placeholder = toPersianString(el.placeholder);
    });
  }

  function walkAndConvert(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      convertTextNode(node);
    }
  }

  // Optional: convert initial input/textarea values (disabled by default)
  function convertInputValues(root = document.body) {
    root.querySelectorAll('input:not([type="number"]), textarea').forEach(el => {
      if (el.value && /[0-9]/.test(el.value)) el.value = toPersianString(el.value);
    });
  }

  function init() {
    walkAndConvert(document.body);
    convertAttributes(document);
    // convertInputValues(document.body); // uncomment if you want initial input values converted

    // Observe dynamic changes
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) convertTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE) {
            convertAttributes(node);
            walkAndConvert(node);
            // convertInputValues(node);
          }
        });
        if (m.type === 'characterData' && m.target && m.target.nodeType === Node.TEXT_NODE) {
          convertTextNode(m.target);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();