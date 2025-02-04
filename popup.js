document.addEventListener('DOMContentLoaded', function() {
  const list = document.getElementById('keywordList');
  const newKeyword = document.getElementById('newKeyword');
  const addBtn = document.getElementById('addBtn');

  function renderKeywords(keywords) {
    list.innerHTML = '';
    keywords.forEach((keyword, index) => {
      const li = document.createElement('li');
      li.textContent = keyword;
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        keywords.splice(index, 1);
        chrome.storage.sync.set({ keywords: keywords }, () => {
          renderKeywords(keywords);
          // Auto-reload all open LinkedIn tabs when a keyword is removed.
          chrome.tabs.query({ url: "*://*.linkedin.com/*" }, tabs => {
            tabs.forEach(tab => chrome.tabs.reload(tab.id));
          });
        });
      });
      li.appendChild(removeBtn);
      list.appendChild(li);
    });
  }

  chrome.storage.sync.get({ keywords: [] }, data => {
    renderKeywords(data.keywords);
  });

  addBtn.addEventListener('click', () => {
    const keyword = newKeyword.value.trim();
    if (keyword) {
      chrome.storage.sync.get({ keywords: [] }, data => {
        if (!data.keywords.includes(keyword)) {
          data.keywords.push(keyword);
          chrome.storage.sync.set({ keywords: data.keywords }, () => {
            renderKeywords(data.keywords);
            newKeyword.value = '';
            // Auto-reload all open LinkedIn tabs when a keyword is added.
            chrome.tabs.query({ url: "*://*.linkedin.com/*" }, tabs => {
              tabs.forEach(tab => chrome.tabs.reload(tab.id));
            });
          });
        }
      });
    }
  });
});
