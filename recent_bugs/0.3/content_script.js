console.log('content_script.js');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Mesage received by content script:')
    console.log(request);

    if (request.method == "getBugTitle") {
        var bugTitleNode = document.evaluate("//span[@class='bv2-issue-title-text ng-binding']", document, null, XPathResult.ANY_TYPE, null).iterateNext();
        if (bugTitleNode) {
            var bugTitle = bugTitleNode.innerHTML;
            sendResponse({title:bugTitle});

            return;
        }
    }
});