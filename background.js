const linkToNewTab = () => {
    document.querySelectorAll('a').forEach((elem) => {
      elem.setAttribute('target', '_blank');
    })
  }
  
  chrome.tabs.onUpdated.addListener(
    (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url.startsWith('JIRAのアドレス')) {
        console.log('link change'); // 管理画面の「ビューを検証」リンクで起動するDevToolにログが出ます
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: linkToNewTab
        });
      }
    }
  )