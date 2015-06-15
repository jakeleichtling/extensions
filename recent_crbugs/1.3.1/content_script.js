console.log('content_script.js');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Mesage received by content script:')
    console.log(request);

    if (request.method == "getCrbugTitle") {
        var crbugTitleNode = document.evaluate("//span[@class='h3']", document, null, XPathResult.ANY_TYPE, null).iterateNext();
        if (crbugTitleNode) {
            var crbugTitle = crbugTitleNode.innerHTML;
            sendResponse({title:crbugTitle});

            return;
        }
    }
});