document.addEventListener("DOMContentLoaded", function() {
  document.querySelector("#scrape-button")?.addEventListener("click", function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id!, {action: "scrape_highlights"});
    });
  });
});