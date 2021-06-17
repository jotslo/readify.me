const toolUrl = "https://readify.me/";

// on button click, get current tab url
chrome.action.onClicked.addListener(function(tab) {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		var currentUrl = tabs[0].url;

		// if user is on readify.me article, return to original page
		if (currentUrl.startsWith(toolUrl)) {
			if (currentUrl.startsWith(toolUrl + "http")) {
				chrome.tabs.update(
					undefined,
					{url: currentUrl.split("/").slice(3).join("/")}
				);
			};
		}

		// otherwise, redirect user to readify.me page
		else {
			chrome.tabs.update(
				undefined,
				{url: toolUrl + currentUrl}
			);
		};
	});
});