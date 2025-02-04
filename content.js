(function() {
  let blockedKeywords = [];
  let blockedRegex = null;

  // Escape special regex characters.
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Build a regex that matches any blocked keyword, optionally preceded by '#'.
  function updateBlockedRegex() {
    if (!blockedKeywords || blockedKeywords.length === 0) {
      blockedRegex = null;
      return;
    }
    const escaped = blockedKeywords
      .map(k => escapeRegExp(k.trim()))
      .filter(k => k.length > 0);
    if (escaped.length === 0) {
      blockedRegex = null;
      return;
    }
    const pattern = `(?:#)?(?:${escaped.join('|')})`;
    blockedRegex = new RegExp(pattern, 'i');
  }

  // Check if an element's innerText matches the blocked regex.
  function checkAndRemoveElement(el) {
    if (!el || !el.innerText || !blockedRegex) return false;
    if (blockedRegex.test(el.innerText)) {
      el.remove();
      return true;
    }
    return false;
  }

  // Define selectors for posts and comments.
  const selectors = [
    'div.feed-shared-update-v2',
    'div.comments-comment-item',
    'span.feed-shared-inline-show-more-text'
  ];

  // Process an element and its descendants matching our selectors.
  function processElement(element) {
    if (element.matches && selectors.some(selector => element.matches(selector))) {
      checkAndRemoveElement(element);
    }
    selectors.forEach(selector => {
      element.querySelectorAll(selector).forEach(child => {
        checkAndRemoveElement(child);
      });
    });
  }

  // Perform a full scan of the document.
  function fullScan() {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        checkAndRemoveElement(el);
      });
    });
  }

  // Load keywords from storage.
  chrome.storage.sync.get({ keywords: [] }, data => {
    blockedKeywords = data.keywords;
    updateBlockedRegex();
    fullScan();
  });

  // Update keywords when they change.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.keywords) {
      blockedKeywords = changes.keywords.newValue;
      updateBlockedRegex();
      fullScan();
    }
  });

  // MutationObserver to process newly added nodes.
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processElement(node);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Scroll listener: run a full scan after scrolling stops.
  let scrollTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      fullScan();
    }, 300);
  });

  // Fallback: periodic full scan.
  setInterval(fullScan, 3000);
})();
