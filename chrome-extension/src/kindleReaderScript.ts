chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action == "scrape_highlights") {
    const settings = await chrome.storage.sync.get(["apiKey", "serverUrl"]);

    // const highlights = getHighlights();

    const userPreferences = await logseqRequest("logseq.App.getUserConfigs");

    console.info(`User preferences: ${JSON.stringify(userPreferences)}`);
  }
});

async function logseqRequest<ResultType>(method: string, ...args: any[]): Promise<ResultType> {
  const settings = await chrome.storage.sync.get(["apiKey", "serverUrl"]);

  const response = await fetch(settings.serverUrl + "/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + settings.apiKey
    },
    body: JSON.stringify({
      method,
      args,
    })
  });

  return await response.json();
}

function getHighlights() {
  var highlights = [];

  // Find all the highlight elements on the page
  var highlightElements = document.querySelectorAll("div#kp-notebook-annotations > .a-row");
  console.info(`Found ${highlightElements.length} highlights`);

  // Loop through each highlight element and extract the text
  for (var i = 0; i < highlightElements.length; i++) {
    var highlightElement = highlightElements[i];

    var textElement = highlightElement.querySelector("span#highlight") as HTMLSpanElement;
    
    if (!textElement) continue;
    var highlight = textElement.innerText.trim();

    var highlightMetadata = highlightElement.querySelector("span#annotationHighlightHeader") as HTMLSpanElement;

    if (!highlightMetadata) continue;

    var highlightMetadataText = highlightMetadata.innerText.trim();
    const components = highlightMetadataText.split("|");
    const colorMatch = /^(?<color>[a-zA-Z]+)\s+highlight/.exec(components[0]);
    debugger;
    console.info({colorMatch});
    highlights.push({highlight});
  }

  return highlights;
}


const init = function () {
  console.info(`Kindle Reader Script loading...`);
  const highlightSummaryDiv = document.querySelector("div.kp-notebook-annotation-container div.kp-notebook-row-separator") as HTMLDivElement;

  const exportHighlights = document.createElement("a");

  exportHighlights.innerText = "Export highlights";
  exportHighlights.onclick = () => {
    debugger;
    const highlights = getHighlights();
    console.log(highlights);
    return false;
  };

  highlightSummaryDiv.appendChild(exportHighlights);
};

init();