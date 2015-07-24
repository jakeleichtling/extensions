var searchTerms;

/*
	Calculates the rank of a HistoryItem from its title and the
	search terms.

	Each full search term that appears adds 1 to the rank.

	Each full search term that does not appear subtracts 1 from the rank.
*/
function getItemRank(historyItem) {
	console.log('getItemRank');

	var itemRank = 0;
	var itemTitle = historyItem.title;	

	if (!itemTitle) {
		return itemRank;
	} else {
		itemTitle = itemTitle.toLowerCase();
	}

	var searchTerm;
	for (var i = 0; i < searchTerms.length; i++) {
		searchTerm = searchTerms[i];

		if (itemTitle.indexOf(searchTerm) < 0) {
			itemRank += -1;
		} else {
			itemRank += 1;
		}
	}

	return itemRank;
}

function compareItems(itemA, itemB) {
	var rankA = getItemRank(itemA, searchTerms);
	var rankB = getItemRank(itemB, searchTerms);

	return rankA - rankB;
}

function getSuggestResults(text, getSuggestResultsCallback) {
	console.log('getSuggestResults');

	// Set searchTerms based on text
	searchTerms = text.toLowerCase().split(/\s+/);

	var suggestResults = [];

	// Obtain all of history
	var historySearchQuery = {
		text: "",
		startTime: 0,
		maxResults: 10000
	};
	var historyItemResults = null;
	chrome.history.search(historySearchQuery, function(results) {
		historyItemResults = results;

		// Rank them all
		historyItemResults.sort(compareItems);

		// Convert historyItemResults to suggestResults to return
		for (var i = 0; i < historyItemResults.length; i++) {
			var historyItemResult = historyItemResults[i];

			if (getItemRank(historyItemResult) > 0) {
				var suggestResult = {
					content: historyItemResult.url,
					description: historyItemResult.title,
				};
				suggestResults.push(suggestResult);
			}
		}

		getSuggestResultsCallback(suggestResults);
	});
}

chrome.omnibox.onInputStarted.addListener(function() {
	console.log("onInputStarted");
})

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
	console.log("onInputChanged");

	getSuggestResults(text, function(suggestResults) {
		console.log("Ready to suggest results");
		for (var i = 0; i < 3; i++) {
			if (i >= suggestResults.length) {
				break;
			}

			console.log(suggestResults[i].title);
		}

		suggest(suggestResults);
	});
});

chrome.omnibox.onInputEntered.addListener(function(text, disposition) {
	console.log("onInputEntered");

	chrome.windows.getCurrent({populate: true}, function(currentWindow) {
		for (var i = 0; i < currentWindow.tabs.length; i++) {
			tab = currentWindow.tabs[i];
			if (tab.active) {
				chrome.tabs.update(tab.id, {
					url: text
				});

				return;
			}
		}

		console.log("NO ACTIVE TABS, WTF!!!");
	});
})

chrome.omnibox.onInputCancelled.addListener(function() {
	console.log("onInputCancelled");
});