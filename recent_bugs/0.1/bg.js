function getBugUrl() {
	return "https://buganizer.corp.google.com/u/0/issues/";
}

function saveBug(bug, id) {
	console.log('saveBug');

	var keyVal = {};
	keyVal[id] = bug;

	chrome.storage.sync.set(keyVal, function() {
		if (chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		} else {
			console.log('Save successful.');
		}
	});
}

function updateBug(bug, id, title) {
	console.log('updateBug');

	bug.id = id;
	bug.title = title;
	bug.visitCount = bug.visitCount + 1;
	bug.lastVisited = new Date().getTime();

	saveBug(bug, id);
}

function addBug(id, title) {
	console.log('addBug');

	var bug = {
		visitCount: 0
	};

	updateBug(bug, id, title);
}

function retrieveBug(items, id, title) {
	console.log('retrieveBug');

	if (items[id]) {
		// Update the existing bug
		updateBug(items[id], id, title);
	} else {
		// Add a new bug
		addBug(id, title);
	}
}

function executeOnBugPage(url, tabId) {
	console.log('executeOnBugPage');

	// Extract the ID
	var regExpString = getBugUrl() + "\/*(\\d+)\/*$";
	var regExp = new RegExp(regExpString);

	var matches = url.match(regExp);
	console.log(matches)

	var id;
	if (matches && matches.length >= 2) {
		id = matches[1]
	} else {
		return;
	}

	console.log('About to executeScript');
    chrome.tabs.executeScript(tabId, {file: "content_script.js"}, function() {
		console.log('Done with executeScript');

		// Extract the title and get result on callback
		console.log('Sending message from BG to CS');
		chrome.tabs.sendMessage(tabId, {method:'getBugTitle'}, {}, function(response) {
			console.log('Message received by BG script:');
			console.log(response);

			if (response && response.title) {
				var title = response.title;

				// Try to retrieve the bug with the ID
				chrome.storage.sync.get(id, function(items) {
					retrieveBug(items, id, title);
				});
			}
		});
	});
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("onUpdated");

	if (tab.url && changeInfo.status === "complete") {
		executeOnBugPage(tab.url, tab.id);
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Mesage received by background page.')
    console.log(request);

    if (request.method === "copyBugUrl") {
    	var bugUrl = request.url;

    	// Find the temp textfield or create one
    	var cpyTmp = document.getElementById('cpy-tmp');
    	if (!cpyTmp) {
    		cpyTmp = document.createElement('input');
    		document.body.appendChild(cpyTmp);
    		cpyTmp.id = 'cpy-tmp';
    		cpyTmp.type = "text";
    	}

		cpyTmp.value = bugUrl;
		cpyTmp.select()
		document.execCommand('copy');
    }
});

console.log("Event page finished running.")