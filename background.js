// Initialize the counter when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ blockedCount: 0 }, () => {
    chrome.action.setBadgeText({ text: '0' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    console.log('Counter initialized to 0');
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'increment' && typeof message.count === 'number') {
    chrome.storage.local.get({ blockedCount: 0 }, (result) => {
      const newCount = result.blockedCount + message.count;
      chrome.storage.local.set({ blockedCount: newCount }, () => {
        chrome.action.setBadgeText({ text: newCount.toString() });
        console.log('Incremented counter by', message.count, 'new total:', newCount);
      });
    });
  }
});
