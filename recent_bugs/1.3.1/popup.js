(function() {
	var app = angular.module('popup', []);

	app.controller('PopupController', ['$scope', '$document', '$log', function($scope, $document, $log) {
		console.log('popup.controller: PopupController');

		var scope = $scope;
		scope.$log = $log;
		scope.$document = $document;

		scope.crbugDict = {};
		scope.searchText = "";
		scope.crbugArray = [];

		chrome.storage.sync.get(null, function(data) {
			console.log('sync.get');

			scope.$apply(function() {
				scope.crbugDict = data;

				scope.crbugArray = scope.getCrbugArray(scope.crbugDict);
			});
		});

		scope.getCrbugArray = function() {
			console.log('getCrbugArray');

			crbugArray = [];
			for (var key in scope.crbugDict) {
				crbugArray.push(scope.crbugDict[key]);
			}

			return crbugArray;
		};		

		scope.getDateString = function(crbug) {
			console.log('getDateString');

			var date = new Date(crbug.lastVisited);

			return date.toLocaleDateString();
		};

		scope.setClickedCrbugUrlAndCopyEvent = function(crbug) {
			console.log('setClickedCrbugUrlAndCopyEvent');

			// Send the URL to the background page for copying
			crbugUrl = scope.getCrbugUrl(crbug);
			chrome.runtime.sendMessage({method:'copyCrbugUrl', url:crbugUrl}, {}, function() {});
		};

		scope.getCrbugUrl = function(crbug) {
			console.log('getCrbugUrl');

			return "https://crbug.com/" + crbug.id;
		};

		scope.openCrbugLink = function(crbug) {
			console.log('openCrbugLink');

			chrome.tabs.create({url: scope.getCrbugUrl(crbug)}, function() {});
		};

		scope.getCrbugTitleString = function(crbug) {
			console.log('getCrbugTitleString');

			var maxTitleLength = 72;

			var titleString = crbug.title;
			if (titleString.length > maxTitleLength) {
				titleString = titleString.substring(0, maxTitleLength - 3) + '...';
			}

			return titleString;
		};

		scope.containsSearchTerms = function(crbug) {
			console.log('containsSearchTerms');

			var searchTermsArray = scope.searchText.toLowerCase().split(/\s+/);

			var crbugText = crbug.title.toLowerCase();

			var searchTerm;
			for (var i = 0; i < searchTermsArray.length; i++) {
				searchTerm = searchTermsArray[i];

				if (crbugText.indexOf(searchTerm) < 0) {
					return false;
				}
			}

			return true;
		};

		scope.getFilteredCrbugArray = function() {
			console.log('getFilteredCrbugArray');

			var filteredCrbugArray = [];
			var crbug;
			for (var i = 0; i < scope.crbugArray.length; i++) {
				crbug = scope.crbugArray[i];

				if (scope.containsSearchTerms(crbug)) {
					filteredCrbugArray.push(crbug);
				}
			}

			return filteredCrbugArray;
		};

		scope.searchCrbug = function() {
			console.log("searchCrbug");

			var baseSearchUrl = "https://code.google.com/p/chromium/issues/list?can=2&q=";
			var searchUrl = baseSearchUrl + scope.searchText;

			chrome.tabs.create({url: searchUrl}, function() {});
		}
	}]);
})();

$(document).ready(function() {
	$( '#search-text-field' ).bind('keypress', function(event) {
		if (event.keyCode === 13) {
			$( '#search-crbug-button' ).trigger('click');
		}
	});
});

