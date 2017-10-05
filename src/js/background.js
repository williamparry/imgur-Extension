var model = new Model(),
    portMessenger = new UTILS.PortMessenger(),
    requestMessenger = new UTILS.RequestMessenger(),
    notifications = {}; // notificationId: { type: x }

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
		active: true
	});
});

function handleCapture() {

	var evtD = new UTILS.EventDispatcher(['EVENT_SUCCESS', 'EVENT_ERROR']);
	
    chrome.tabs.query({
				active: true,
				currentWindow: true
            }, function (tab) {

		chrome.tabs.executeScript(tab.id, { file: "js/inject/captureArea.js" }, function (info) {
				
			if (typeof info !== "undefined") {

				chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
				
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

				});
			

			} else {
				evtD.dispatchEvent(evtD.EVENT_ERROR, "Access to the page is denied");
			}

		});

	});

			
		
	return evtD;
}


function addToClipboard(url) {
    if (typeof browser != "undefined" && browser.runtime.getBrowserInfo) {
        browser.runtime.getBrowserInfo().then(function(info) {
            if (info.name == "Firefox") {
                browser.tabs.executeScript({
                    code: "function oncopy(evt) {" +
                          "    document.removeEventListener(\"copy\", oncopy, true);" +
                          "    evt.stopImmediatePropagation();" +
                          "    evt.preventDefault();" +
                          "    evt.clipboardData.setData(\"text/plain\", \"" + url + "\")" +
                          "}" +
                          "document.addEventListener(\"copy\", oncopy, true);" +
                          "document.execCommand(\"copy\");"
                })
            } else {
                console.log("Has browser.runtime.getBrowserInfo but isn't firefox. Don't know what to do with this.")
            }
        }).catch(function(err) {
            console.log("Failed to get browser info: " + err);
        })
    } else {
        var txt = UTILS.D.create('input');
        document.body.appendChild(txt);
        txt.value = url;
        txt.select();
        document.execCommand('copy');
        document.body.removeChild(txt);
    }
}

function handleLocalFile(src) {

	var evtD = new UTILS.EventDispatcher(['EVENT_SUCCESS']),
		canvas = UTILS.D.create('canvas'),
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

	} else if (obj.menuItemId === "unsorted.area") {

		handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
			var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
			evt.type = "capture";
			uploadDelegate(evt);
		}).addEventListener('EVENT_ERROR', function (msg) {
			showError(msg);
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
		}).addEventListener('EVENT_ERROR', function (msg) {
			showError(msg);
		});

	} else if (obj.menuItemId === "authenticated.area.me") {

		handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
			var evt = model.authenticated.sendImage("_userAlbum", img.split(',')[1]);
			evt.type = "capture";
			uploadDelegate(evt);
		}).addEventListener('EVENT_ERROR', function (msg) {
			showError(msg);
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

			handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
				var evt = model.authenticated.sendImage(albumId, img.split(',')[1]);
				evt.type = "capture";
				uploadDelegate(evt);

			}).addEventListener('EVENT_ERROR', function (msg) {
				showError(msg);
			});

		} else if (cmd === 'authenticated.image.album') {

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

	chrome.notifications.create("imgur.finished", {
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
	chrome.tabs.create({ "url": url, "active": true });
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

function setContextMenus() {
    
	chrome.contextMenus.removeAll(function () {

		var parentId = chrome.contextMenus.create({
            "id": "imgur",
            "title": "imgur",
            "contexts": ["page"]
        });

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

		if (model.authenticated.oAuthManager.getAuthStatus()) {

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
				"id": "authenticated.image.me",
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


	});


}

// Result of an action
// Generic handler
function showError(msg) {

	chrome.browserAction.setBadgeText({ 'text': '' });

	if (typeof msg === "string") {
		
		chrome.notifications.create("imgur.failed", {

			type: "basic",
			iconUrl: "img/logo96.png",
			title: "imgur failed",
			message: msg
		}, function (notificationId) {

		});

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
// options can set notifications
portMessenger.addEventListener("options.sync", function () {
	setContextMenus();
	syncViews();
	toggleNotifications();
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
    	active: true
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

function arrayBufferDataUri(raw) {
	var base64 = ''; var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; var bytes = new Uint8Array(raw); var byteLength = bytes.byteLength; var byteRemainder = byteLength % 3; var mainLength = byteLength - byteRemainder; var a, b, c, d; var chunk; for (var i = 0; i < mainLength; i = i + 3) { chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]; a = (chunk & 16515072) >> 18; b = (chunk & 258048) >> 12; c = (chunk & 4032) >> 6; d = chunk & 63; base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d] }
	if (byteRemainder == 1) { chunk = bytes[mainLength]; a = (chunk & 252) >> 2; b = (chunk & 3) << 4; base64 += encodings[a] + encodings[b] + '=='; }
	else if (byteRemainder == 2) { chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]; a = (chunk & 16128) >> 8; b = (chunk & 1008) >> 4; c = (chunk & 15) << 2; base64 += encodings[a] + encodings[b] + encodings[c] + '='; }
	return "data:image/jpeg;base64," + base64;
}

function showReplyNotification(reply) {

	/*
	Not ready yet. Needs to handle gif/gifv files

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://i.imgur.com/" + reply.content.image_id + ".jpg", true); // file extension is not important
	xhr.responseType = "arraybuffer";
	xhr.onload = function () {

		var img = arrayBufferDataUri(xhr.response);
		
		chrome.notifications.create(reply.id + "", {
			type: "image",
			iconUrl: "img/logo96.png",
			imageUrl: img,
			title: "New comment",
			message: reply.content.comment
		}, function (notificationId) {

			notifications[notificationId] = { id: reply.id, type: "reply.single", image_id: reply.content.image_id };

		});

	};

	xhr.send(null);
	*/


	chrome.notifications.create(reply.id + "", {
		type: "basic",
		iconUrl: "img/logo96.png",
		title: "New comment",
		message: reply.content.comment
	}, function (notificationId) {

		notifications[notificationId] = { id: reply.id, type: "reply.single", image_id: reply.content.image_id };

	});


}

function showReplyNotifications(replies) {
	
	chrome.notifications.create(replies[0].id + "", {
		type: "basic",
		iconUrl: "img/logo96.png",
		title: "New comments",
		message: "You have " + replies.length + " replies"
	}, function (notificationId) {

		notifications[notificationId] = { ids: replies.map(function (item) { return item.id; }), type: "reply.multiple" };

	});

}

function showMessageNotification(message) {

	chrome.notifications.create(message.id + "", {
		type: "basic",
		iconUrl: "img/logo96.png",
		title: "New message from " + message.content.from,
		message: message.content.last_message
	}, function (notificationId) {

		notifications[notificationId] = { id: message.id, type: "message.single" };

	});

}

function showMessageNotifications(messages) {

	chrome.notifications.create(messages[0].id + "", {
		type: "basic",
		iconUrl: "img/logo96.png",
		title: "New messages",
		message: "You have " + messages.length + " messages"
	}, function (notificationId) {
		notifications[notificationId] = { ids: messages.map(function(item) { return item.id; }), type: "message.multiple" };
	});

}


function handleNotifications(notifications) {

	if (notifications.replies.length > 1) {

		showReplyNotifications(notifications.replies);

	} else if (notifications.replies.length > 0) {

		showReplyNotification(notifications.replies[0]);

	}

	if (notifications.messages.length > 1) {

		showMessageNotifications(notifications.messages);

	} else if (notifications.messages.length > 0) {

		showMessageNotification(notifications.messages[0]);

	}


}

function setNotificationInfoAsRead(notificationId, notificationInfo) {

	if (notificationInfo) {

		var type = notificationInfo.type;


		switch (type) {

			case "reply.single":

				model.authenticated.setNotificationAsRead(notificationInfo.id);

				break;

			case "reply.multiple":

				model.authenticated.setNotificationsAsRead(notificationInfo.ids);

				break;

			case "message.single":

				model.authenticated.setNotificationAsRead(notificationInfo.id);

				break;

			case "message.multiple":

				model.authenticated.setNotificationsAsRead(notificationInfo.ids);

				break;

		}

	}

	delete notifications[notificationId];
}

chrome.notifications.onClicked.addListener(function (notificationId) {

	var notificationInfo = notifications[notificationId];
	var type = notificationInfo.type;

	switch (type) {

		case "reply.single":

			chrome.tabs.create({ url: "https://imgur.com/" + notificationInfo.image_id, active: true });

			break;

		case "reply.multiple":

			chrome.tabs.create({ url: "https://imgur.com/account/messages/", active: true });

			break;

		case "message.single":

			chrome.tabs.create({ url: "https://imgur.com/account/messages/", active: true });

			break;

		case "message.multiple":

			chrome.tabs.create({ url: "https://imgur.com/account/messages/", active: true });

			break;

		case "update.url":

			chrome.tabs.create({ url: notificationInfo.url, active: true });

			break;

	}
	
	setNotificationInfoAsRead(notificationId, notificationInfo);

});



// Clicking on the item doesn't fire onClosed
// You only really need to add to the notifications object if you're going to handle it
chrome.notifications.onClosed.addListener(function (notificationId) {

	var notificationInfo = notifications[notificationId];
	setNotificationInfoAsRead(notificationId, notificationInfo);

});

function checkNotifications() {

	if (model.authenticated.oAuthManager.getAuthStatus()) {

		model.authenticated.fetchNotifications().addEventListener("EVENT_SUCCESS", handleNotifications);

	}

}

function startNotifications() {

	checkNotifications();

	chrome.alarms.create("ALARM_NOTIFICATIONS", {
		periodInMinutes: 5
	});

}

function stopNotifications() {

	chrome.alarms.clear("ALARM_NOTIFICATIONS");
	
}

function toggleNotifications() {

	if (model.preferences.get('enablenotifications')) {

		startNotifications();

	} else {

		stopNotifications();

	}

}

chrome.alarms.onAlarm.addListener(function (alarm) {

	if (alarm.name === "ALARM_NOTIFICATIONS") {

		checkNotifications();

	} else if (alarm.name === "ALARM_CONTEXTMENUS") {
		
		checkContextMenus();

	}

});



chrome.alarms.create("ALARM_CONTEXTMENUS", {
	periodInMinutes: 15
});

checkContextMenus();

toggleNotifications();

// Notifications

var appNotifications = model.getNotifications();

if (appNotifications.length > 0) {
	
	for (var i = 0; i < appNotifications.length; i++) {
		
		(function (notification) {
			
			chrome.notifications.create(notification.id, {

				type: "basic",
				iconUrl: "img/logo96.png",
				title: notification.title,
				message: notification.message

			}, function (notificationId) {

				notifications[notificationId] = { url: notification.url, type: "update.url" };

				model.setNotified(notification.id);

			});

		})(appNotifications[i]);


	}


}
