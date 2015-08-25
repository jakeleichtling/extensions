(function() {
	var app = angular.module('popup', []);

	app.controller('PopupController', ['$scope', '$document', '$log', function($scope, $document, $log) {
		console.log('popup.controller: PopupController');

		var scope = $scope;
		scope.$log = $log;
		scope.$document = $document;

		scope.bugDict = {};
		scope.searchText = "";
		scope.bugArray = [];

		chrome.storage.sync.get(null, function(data) {
			console.log('sync.get');

			scope.$apply(function() {
				scope.bugDict = data;

				scope.bugArray = scope.getBugArray(scope.bugDict);
			});
		});

		scope.getBugArray = function() {
			console.log('getBugArray');

			bugArray = [];
			for (var key in scope.bugDict) {
				bugArray.push(scope.bugDict[key]);
			}

			return bugArray;
		};		

		scope.getDateString = function(bug) {
			console.log('getDateString');

			var date = new Date(bug.lastVisited);

			return date.toLocaleDateString();
		};

		scope.setClickedBugUrlAndCopyEvent = function(bug) {
			console.log('setClickedBugUrlAndCopyEvent');

			// Send the URL to the background page for copying
			bugUrl = scope.getBugUrl(bug);
			chrome.runtime.sendMessage({method:'copyBugUrl', url:bugUrl}, {}, function() {});
		};

		scope.getBugUrl = function(bug) {
			console.log('getBugUrl');

			return "https://buganizer.corp.google.com/u/0/issues/" + bug.id;
		};

		scope.openBugLink = function(bug) {
			console.log('openBugLink');

			chrome.tabs.create({url: scope.getBugUrl(bug)}, function() {});
		};

		scope.getBugTitleString = function(bug) {
			console.log('getBugTitleString');

			var maxTitleLength = 72;

			var titleString = bug.title;
			if (titleString.length > maxTitleLength) {
				titleString = titleString.substring(0, maxTitleLength - 3) + '...';
			}

			return titleString;
		};

		scope.containsSearchTerms = function(bug) {
			console.log('containsSearchTerms');

			var searchTermsArray = scope.searchText.toLowerCase().split(/\s+/);

			var bugText = bug.title.toLowerCase();

			var searchTerm;
			for (var i = 0; i < searchTermsArray.length; i++) {
				searchTerm = searchTermsArray[i];

				if (bugText.indexOf(searchTerm) < 0) {
					return false;
				}
			}

			return true;
		};

		scope.getFilteredBugArray = function() {
			console.log('getFilteredBugArray');

			var filteredBugArray = [];
			var bug;
			for (var i = 0; i < scope.bugArray.length; i++) {
				bug = scope.bugArray[i];

				if (scope.containsSearchTerms(bug)) {
					filteredBugArray.push(bug);
				}
			}

			return filteredBugArray;
		};

		scope.searchBug = function() {
			console.log("searchBug");

			var baseSearchUrl = "https://buganizer.corp.google.com/u/0/issues?q=";
			var searchUrl = baseSearchUrl + scope.searchText;

			chrome.tabs.create({url: searchUrl}, function() {});
		}
	}]);
})();

$(document).ready(function() {
	$( '#search-text-field' ).bind('keypress', function(event) {
		if (event.keyCode === 13) {
			$( '#search-bug-button' ).trigger('click');
		}
	});
});

