/// <reference path="model.js" />

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-41081662-9']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var model = new Model(),
    portMessenger = new UTILS.PortMessenger(),
    requestMessenger = new UTILS.RequestMessenger();

// ------------------------------------------------------------------
// Reset refreshing status when loading
// ------------------------------------------------------------------

model.authenticated.oAuthManager.resetRefreshing();

// ------------------------------------------------------------------
// Chrome hooks
// ------------------------------------------------------------------

chrome.browserAction.setBadgeBackgroundColor({ color: [85, 85, 85, 155] });

chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.create({
		url: "main.html",
		selected: true
	});
});

function setContextMenus() {
    
    chrome.contextMenus.removeAll();


    function handleCapture() {
    	var evtD = new UTILS.EventDispatcher(['EVENT_SUCCESS']);
    	chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
    		chrome.tabs.getSelected(null, function (tab) {
    			requestMessenger.addEventListener("got_area", function (e) {
    				requestMessenger.removeEventListener("got_area", arguments.callee);
    				var canvas = document.createElement('canvas');
    				canvas.width = e.Data.width;
    				canvas.height = e.Data.height;
    				var ctx = canvas.getContext('2d');
    				var i = new Image();
    				i.src = img;
    				i.onload = function () {
    					ctx.drawImage(i, e.Data.left, e.Data.top, e.Data.width, e.Data.height, 0, 0, e.Data.width, e.Data.height);
    					evtD.dispatchEvent(evtD.EVENT_SUCCESS, canvas.toDataURL("image/png"));
    				};
    			}, true);
    			chrome.tabs.executeScript(tab.id, { file: "js/inject/captureArea.js" });
    		});
    	});
    	return evtD;
    }


    function addToClipboard(url) {
    	var txt = UTILS.DOM.create('input');
    	document.body.appendChild(txt);
    	txt.value = url;
    	txt.select();
    	document.execCommand('copy');
    	document.body.removeChild(txt);
    }

    function handleLocalFile(src) {

    	var evtD = new UTILS.EventDispatcher(['EVENT_SUCCESS']),
			canvas = UTILS.DOM.create('canvas'),
			ctx = canvas.getContext('2d'),
			img = new Image();

    	img.onload = function () {

    		canvas.width = img.width;
    		canvas.height = img.height;
    		ctx.drawImage(img, 0, 0, img.width, img.height);

    		evtD.dispatchEvent("EVENT_SUCCESS", canvas.toDataURL());

    	}

    	img.src = src;

    	return evtD;
    }


    var parentId = chrome.contextMenus.create({ "id": "imgur", "title": "imgur" });

    var capturePageContextMenuItem = chrome.contextMenus.create({
    	"id": "unsorted.page",
    	"title": "capture page",
    	"contexts": ["page"],
    	"parentId": parentId
    });

    var captureViewContextMenuItem = chrome.contextMenus.create({
    	"id": "unsorted.view",
    	"title": "capture view",
    	"contexts": ["page"],
    	"parentId": parentId
    });

    var captureAreaContextMenuItem = chrome.contextMenus.create({
    	"id": "unsorted.area",
    	"title": "capture area",
    	"contexts": ["page"],
    	"parentId": parentId
    });

    var addImageContextMenuItem = chrome.contextMenus.create({
    	"id": "unsorted.rehost",
    	"title": "rehost image",
    	"contexts": ["image"]
    });

    if(model.authenticated.oAuthManager.getAuthStatus()) {
        
        chrome.contextMenus.update(capturePageContextMenuItem, { title: "capture page to" });
        chrome.contextMenus.update(captureViewContextMenuItem, { title: "capture view to" });
        chrome.contextMenus.update(captureAreaContextMenuItem, { title: "capture area to" });
        chrome.contextMenus.update(addImageContextMenuItem, { title: "rehost image to" });


        chrome.contextMenus.create({
        	"id": "authenticated.page.thiscomputer",
        	"title": "- this computer -",
        	"contexts": ["page"],
			"parentId": capturePageContextMenuItem
        });


        chrome.contextMenus.create({
        	"id": "authenticated.page.me",
        	"title": model.authenticated.getAccount().url,
        	"contexts": ["page"],
            "parentId": capturePageContextMenuItem
        });


        chrome.contextMenus.create({
        	"id": "authenticated.view.thiscomputer",
        	"title": "- this computer -",
        	"contexts": ["page"],
        	"parentId": captureViewContextMenuItem
        });

        chrome.contextMenus.create({
        	"id": "authenticated.view.me",
        	"title": model.authenticated.getAccount().url,
        	"contexts": ["page"],
        	"parentId": captureViewContextMenuItem
        });

        chrome.contextMenus.create({
        	"id": "authenticated.area.thiscomputer",
        	"title": "- this computer -",
        	"contexts": ["page"],
        	"parentId": captureAreaContextMenuItem
        });

        chrome.contextMenus.create({
        	"id": "authenticated.area.me",
        	"title": model.authenticated.getAccount().url,
        	"contexts": ["page"],
            "parentId": captureAreaContextMenuItem
        });

        chrome.contextMenus.create({
        	"id": "authenticated.image.thiscomputer",
        	"title": "- this computer -",
        	"contexts": ["image"],
			"parentId": addImageContextMenuItem
        });


        chrome.contextMenus.create({
        	"id": "authenticated.image.me.",
        	"title": model.authenticated.getAccount().url,
        	"contexts": ["image"],
        	"parentId": addImageContextMenuItem
        });
			
        var authenticatedAlbums = model.authenticated.getAlbums();

        if (authenticatedAlbums.length > 0) {

			for (var i = 0; i < authenticatedAlbums.length; i++) {

				(function (album) {

					if (album.title) {

						// Extend
						chrome.contextMenus.create({
							"id": "authenticated.page.album." + album.id,
							"title": album.title,
							"contexts": ["page"],
							"parentId": capturePageContextMenuItem
						});


						chrome.contextMenus.create({
							"id": "authenticated.view.album." + album.id,
							"title": album.title,
							"contexts": ["page"],
							"parentId": captureViewContextMenuItem
						});



						chrome.contextMenus.create({
							"id": "authenticated.area.album." + album.id,
							"title": album.title,
							"contexts": ["page"],
							"parentId": captureAreaContextMenuItem
						});

						chrome.contextMenus.create({
							"id": "authenticated.image.album." + album.id,
							"title": album.title,
							"contexts": ["image"],
							"parentId": addImageContextMenuItem
						});

					}
				})(authenticatedAlbums[i]);

			}

        }

        

    }


    chrome.contextMenus.onClicked.addListener(function (obj, tab) {
    	
    	if (obj.menuItemId === "unsorted.page") {

    		UTILS.Tab.toImage(null, '/js/inject/Tab.toImage.js').addEventListener('EVENT_COMPLETE', function (img) {
    			var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
    			evt.type = "capture";
    			uploadDelegate(evt);
    		});

    	} else if (obj.menuItemId === "unsorted.view") {

    			chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
    				var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    	} else if (obj.menuItemId ===  "unsorted.area") {

    			handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
    				var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    	} else if (obj.menuItemId === "unsorted.rehost") {

    		var evt;

    		if (!!~obj.srcUrl.indexOf('file:')) {

    			showError("Sorry, Chrome Extensions don't let you rehost from your filesystem. Try drag and dropping into the extension page.");

    			return;

    			handleLocalFile(obj.srcUrl).addEventListener('EVENT_SUCCESS', function (imgData) {
    				evt = model.unsorted.sendImage(encodeURIComponent(imgData.split(',')[1]));
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    		} else {

    			evt = model.unsorted.sendImageURL(obj.srcUrl);
    			evt.type = "rehost";
    			uploadDelegate(evt);

    		}

    	} else if (obj.menuItemId === "authenticated.page.thiscomputer") {

    			UTILS.Tab.toImage(null, '/js/inject/Tab.toImage.js').addEventListener('EVENT_COMPLETE', function (img) {
    				var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    	} else if (obj.menuItemId === "authenticated.page.me") {

    			UTILS.Tab.toImage(null, '/js/inject/Tab.toImage.js').addEventListener('EVENT_COMPLETE', function (img) {
    				var evt = model.authenticated.sendImage("_userAlbum", img.split(',')[1]);
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    	} else if (obj.menuItemId === "authenticated.view.thiscomputer") {

    			chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
    				var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    	} else if (obj.menuItemId === "authenticated.view.me") {

    			chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
    				var evt = model.authenticated.sendImage("_userAlbum", img.split(',')[1]);
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    	} else if (obj.menuItemId === "authenticated.area.thiscomputer") {

    			handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
    				var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    	} else if (obj.menuItemId === "authenticated.area.me") {

    			handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
    				var evt = model.authenticated.sendImage("_userAlbum", img.split(',')[1]);
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    	} else if (obj.menuItemId === "authenticated.image.thiscomputer") {

    			var evt;

    			if (!!~obj.srcUrl.indexOf('file:')) {

    				showError("Sorry, Chrome Extensions don't let you rehost from your filesystem. Try drag and dropping into the extension page.");

    				return;

    				handleLocalFile(obj.srcUrl).addEventListener('EVENT_SUCCESS', function (imgData) {
    					evt = model.unsorted.sendImage(encodeURIComponent(imgData.split(',')[1]));
    					evt.type = "capture";
    					uploadDelegate(evt);
    				});

    			} else {

    				evt = model.unsorted.sendImageURL(obj.srcUrl);
    				evt.type = "rehost";
    				uploadDelegate(evt);
    			}

    	} else if (obj.menuItemId === "authenticated.image.me") {

    		var evt;

    		if (!!~obj.srcUrl.indexOf('file:')) {

    			showError("Sorry, Chrome Extensions don't let you rehost from your filesystem. Try drag and dropping into the extension page.");

    			return;

    			handleLocalFile(obj.srcUrl).addEventListener('EVENT_SUCCESS', function (imgData) {
    				var evt = model.authenticated.sendImage("_userAlbum", imgData.split(',')[1]);
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    		} else {

    			evt = model.authenticated.sendImageURL("_userAlbum", obj.srcUrl);
    			evt.type = "rehost";
    			uploadDelegate(evt);

    		}

    	} else {
			
    		var parts = obj.menuItemId.split('.');
    		var albumId = parts.pop();
    		var cmd = parts.join('.');
    		
    		if (cmd === 'authenticated.page.album') {

    			UTILS.Tab.toImage(null, '/js/inject/Tab.toImage.js').addEventListener('EVENT_COMPLETE', function (img) {
    				var evt = model.authenticated.sendImage(albumId, img.split(',')[1]);
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    		} else if (cmd === 'authenticated.view.album') {

    			chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
    				var evt = model.authenticated.sendImage(albumId, img.split(',')[1]);
    				evt.type = "capture";
    				uploadDelegate(evt);
    			});

    		} else if (cmd === 'authenticated.area.album') {

    			var albumIdParts = obj.menuItemId.split('.');
    			var albumId = albumIdParts[albumIdParts.length - 1];

    			handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
    				var evt = model.authenticated.sendImage(albumId, img.split(',')[1]);
    				evt.type = "capture";
    				uploadDelegate(evt);

    			});

    		} else if (cmd === 'authenticated.image.album') {

    			var albumIdParts = obj.menuItemId.split('.');
    			var albumId = albumIdParts[albumIdParts.length - 1];

    			var evt;

    			if (!!~obj.srcUrl.indexOf('file:')) {

    				showError("Sorry, Chrome Extensions don't let you rehost from your filesystem. Try drag and dropping into the extension page.");

    				return;

    				handleLocalFile(obj.srcUrl).addEventListener('EVENT_SUCCESS', function (imgData) {
    					var evt = model.authenticated.sendImage(albumId, imgData.split(',')[1]);
    					evt.type = "capture";
    					uploadDelegate(evt);
    				});

    			} else {

    				evt = model.authenticated.sendImageURL(albumId, obj.srcUrl);
    				evt.type = "rehost";
    				uploadDelegate(evt);

    			}

    		}

    	}



    })


    function uploadCompleteNotification(message) {

    	chrome.notifications.create("", {

    		type: "basic",
    		iconUrl: "img/logo96.png",
    		title: "Finished",
    		message: message
    	}, function (notificationId) {
    		setTimeout(function () {
    			chrome.notifications.clear(notificationId, function () { });
    		}, 3000);
    	});

    }

    function uploadCompleteTab(url) {
    	chrome.tabs.create({ "url": url, "selected": true });
    }

    function uploadDelegate(evt) {

        chrome.browserAction.setBadgeText({ 'text': '0' });

        evt.addEventListener(evt.EVENT_PROGRESS, function (e) {
            chrome.browserAction.setBadgeText({ 'text': String(Math.floor(((e.loaded / e.total) * 100))) });
        });

        evt.addEventListener(evt.EVENT_COMPLETE, function () {
        	chrome.browserAction.setBadgeText({ 'text': '' });
        });

        evt.addEventListener(evt.EVENT_SUCCESS, function (data) {

            if (evt.type == "capture") {

                if (model.preferences.get('copyoncapture')) {
                    addToClipboard(data.link);
                    if (model.preferences.get('taboncapture')) {
                        uploadCompleteNotification("copied to your clipboard");
                    }
                }

                if (model.preferences.get('taboncapture')) {
                    uploadCompleteTab(data.link);
                } else {
                    uploadCompleteNotification(model.preferences.get('copyoncapture') ? "added to your album and copied to your clipboard" : "added to your album");
                }

            } else {

                if (model.preferences.get('copyonrehost')) {
                    addToClipboard(data.link);
                    if (model.preferences.get('tabonrehost')) {
                        uploadCompleteNotification("copied to your clipboard");
                    }
                }

                if (model.preferences.get('tabonrehost')) {
                    uploadCompleteTab(data.link);
                } else {
                    uploadCompleteNotification(model.preferences.get('copyonrehost') ? "rehosted to your album and copied to your clipboard" : "rehosted to your album");
                }

            }


        });

        evt.addEventListener(evt.EVENT_ERROR, showError);

    }

}

// Result of an action
// Generic handler
function showError(msg) {

	if (typeof msg === "string") {

		chrome.browserAction.setBadgeText({ 'text': '' });


		chrome.notifications.create("", {

			type: "basic",
			iconUrl: "img/logo96.png",
			title: "imgur failed",
			message: msg
		}, function () { });

	} else {

		if (msg.status === 400) {

			alert(msg.text);
			criticalError();

		}
	}

	
}

// Can happen silently
function criticalError() {

	setContextMenus();
	syncViews();
	window.location.reload();

}

// ------------------------------------------------------------------
// Port messaging
// ------------------------------------------------------------------

function syncViews() {

	portMessenger.sendMessage("options", {
		Name: "sync"
	});
	portMessenger.sendMessage("main", {
		Name: "sync"
	});
}

// options page can clear authentication, which needs a sync
// main page can only sync when it's the result of getting a user
portMessenger.addEventListener("options.sync", function () {
	setContextMenus();
    syncViews();
});

portMessenger.addEventListener("main.get_user", function () {

	var authTab,
        req = new XMLHttpRequest();

    function sendAuthAbortedMessage(tabId) {
        if (tabId == authTab) {
            requestMessenger.removeAllEventListeners("oauth_verified");
            portMessenger.sendMessage("main", {
            	Name: "get_user_aborted"
            });
        }
    }

    chrome.tabs.create({
    	url: 'https://api.imgur.com/oauth2/authorize?client_id=e5642c924b26904&response_type=pin',
    	selected: true
    }, function (tab) {

    	authTab = tab.id;
    	chrome.tabs.onRemoved.addListener(sendAuthAbortedMessage);

    	requestMessenger.addEventListener("oauth_verified", function (verifier) {
    		
    		requestMessenger.removeEventListener("oauth_verified", arguments.callee);

    		chrome.tabs.remove(tab.id);

    		model.authenticated.oAuthManager.getToken(verifier.Data).addEventListener('EVENT_COMPLETE', function () {
    			
    			authTab = -1;
    			chrome.tabs.onRemoved.removeListener(sendAuthAbortedMessage);

    		}).addEventListener('EVENT_SUCCESS', function () {

    			model.authenticated.fetchUser().addEventListener('EVENT_SUCCESS', function () {

    				model.authenticated.fetchAlbums().addEventListener('EVENT_SUCCESS', function () {

    					setContextMenus();
    					syncViews();

    				}).addEventListener('EVENT_ERROR', function (error) {

    					showError(error);

    				});
    			});

    		}).addEventListener('EVENT_ERROR', function (error) {
    			
    			showError(error);

    		});


    	});

    });





});


function checkContextMenus() {

	if (model.authenticated.oAuthManager.getAuthStatus()) {

		model.authenticated.fetchAlbums().addEventListener('EVENT_SUCCESS', setContextMenus).addEventListener('EVENT_ERROR', function (msg) {
			if (msg.status === 400) {
				criticalError();
			}
		});

	} else {

		setContextMenus();

	}

}

function checkNotifications() {

	if (model.authenticated.oAuthManager.getAuthStatus()) {

		model.authenticated.fetchNotifications().addEventListener("EVENT_SUCCESS", function (notifications) {

			console.log('notifications', notifications);

		});

	}

}

chrome.alarms.onAlarm.addListener(function (alarm) {

	if (alarm.name === "ALARM_NOTIFICATIONS") {

		checkNotifications();

	} else if (alarm.name === "ALARM_CONTEXTMENUS") {
		
		checkContextMenus();

	}

});

chrome.alarms.create("ALARM_NOTIFICATIONS", {
	periodInMinutes: 15
});

chrome.alarms.create("ALARM_CONTEXTMENUS", {
	periodInMinutes: 15
});

checkContextMenus();

// Notifications
/*
var notifications = model.getNotifications();

if (notifications.length > 0) {

	for (var i = 0; i < notifications.length, notification = notifications[i]; i++) {



		var popup = webkitNotifications.createHTMLNotification("notifications/" + notification + ".html");
		popup.show();

		model.setNotified(notification);

	}


}
*/