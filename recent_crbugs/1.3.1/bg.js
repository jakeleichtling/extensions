function getCrbugUrl() {
	return "https://code.google.com/p/chromium/issues/detail";
}

var filters = {
	url: [{urlContains: getCrbugUrl().replace(/^https?\:\/\//, '')}]
}

function saveCrbug(crbug, id) {
	console.log('saveCrbug');

	var keyVal = {};
	keyVal[id] = crbug;

	chrome.storage.sync.set(keyVal, function() {
		if (chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		} else {
			console.log('Save successful.');
		}
	});
}

function updateCrbug(crbug, id, title) {
	console.log('updateCrbug');

	// TODO: actually scrape title
	crbug.id = id;
	crbug.title = title;
	crbug.visitCount = crbug.visitCount + 1;
	crbug.lastVisited = new Date().getTime();

	saveCrbug(crbug, id);
}

function addCrbug(id, title) {
	console.log('addCrbug');

	var crbug = {
		visitCount: 0
	};

	updateCrbug(crbug, id, title);
}

function retrieveCrbug(items, id, title) {
	console.log('retrieveCrbug');

	if (items[id]) {
		// Update the existing crbug
		updateCrbug(items[id], id, title);
	} else {
		// Add a new crbug
		addCrbug(id, title);
	}
}

function onNavigate(details) {
	console.log('onNavigate');

	// Extract the ID
	var regExpString = getCrbugUrl() + "\\?.*id=(\\d+).*";
	var regExp = new RegExp(regExpString);

	var url = details.url;
	var matches = url.match(regExp);
	console.log(matches)

	var id;
	if (matches && matches.length >= 2) {
		id = matches[1]
	} else {
		return;
	}

	console.log('About to executeScript');
    chrome.tabs.executeScript(details.tabId, {file: "content_script.js"}, function() {
		console.log('Done with executeScript');

		// Extract the title and get result on callback
		console.log('Sending message from BG to CS');
		chrome.tabs.sendMessage(details.tabId, {method:'getCrbugTitle'}, {}, function(response) {
			console.log('Message received by BG script:');
			console.log(response);

			if (response && response.title) {
				var title = response.title;

				// Try to retrieve the crbug with the ID
				chrome.storage.sync.get(id, function(items) {
					retrieveCrbug(items, id, title);
				});
			}
		});
	});
}

chrome.webNavigation.onDOMContentLoaded.addListener(onNavigate, filters);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Mesage received by background page.')
    console.log(request);

    if (request.method == "copyCrbugUrl") {
    	var crbugUrl = request.url;

    	// Find the temp textfield or create one
    	var cpyTmp = document.getElementById('cpy-tmp');
    	if (!cpyTmp) {
    		cpyTmp = document.createElement('input');
    		document.body.appendChild(cpyTmp);
    		cpyTmp.id = 'cpy-tmp';
    		cpyTmp.type = "text";
    	}

		cpyTmp.value = crbugUrl;
		cpyTmp.select()
		document.execCommand('copy');
    }
});

console.log("Event page finished running.")