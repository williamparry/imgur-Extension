/// <reference path="/vsdoc/utils-1.3-vsdoc.js" />
/// <reference path="/vsdoc/chrome-vsdoc.js" />
/// <reference path="model.js" />

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-249743-23']);

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


    var parentId = chrome.contextMenus.create({ "title": "imgur" });

    var capturePageContextMenuItem = chrome.contextMenus.create({
    	"title": "capture page", "contexts": ["page"], parentId: parentId,
        "onclick": function (obj) {
        	UTILS.Tab.toImage(null, '/js/inject/Tab.toImage.js').addEventListener('EVENT_COMPLETE', function (img) {
                var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
                evt.type = "capture";
                uploadDelegate(evt);
            });
         }
    });

    var captureViewContextMenuItem = chrome.contextMenus.create({
    	"title": "capture view", "contexts": ["page"], parentId: parentId,
        "onclick": function (obj) {
            chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
                var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
                evt.type = "capture";
                uploadDelegate(evt);
            });
        }
    });

    var captureAreaContextMenuItem = chrome.contextMenus.create({
    	"title": "capture area", "contexts": ["page"], parentId: parentId,
        "onclick": function (obj) {
        	handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
                var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
                evt.type = "capture";
                uploadDelegate(evt);
            });

        }
    });

    var addImageContextMenuItem = chrome.contextMenus.create({
    	"title": "rehost image", "contexts": ["image"],
        "onclick": function (obj) {
            var evt = model.unsorted.sendImageURL(obj.srcUrl);
            evt.type = "rehost";
            uploadDelegate(evt);
        }
    });

    if(model.authenticated.oAuthManager.getAuthStatus()) {
        var authenticatedAlbums = model.authenticated.getAlbums();
        if (authenticatedAlbums.length > 0) {

            chrome.contextMenus.update(capturePageContextMenuItem, { title: "capture page to" });
            chrome.contextMenus.update(captureViewContextMenuItem, { title: "capture view to" });
            chrome.contextMenus.update(captureAreaContextMenuItem, { title: "capture area to" });
            chrome.contextMenus.update(addImageContextMenuItem, { title: "rehost image to" });


            chrome.contextMenus.create({
                "title": "- this computer -", "contexts": ["page"],
                "onclick": function (obj) {
                	UTILS.Tab.toImage(null, '/js/inject/Tab.toImage.js').addEventListener('EVENT_COMPLETE', function (img) {
                        var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
                        evt.type = "capture";
                        uploadDelegate(evt);
                    });

                }, "parentId": capturePageContextMenuItem
            });


            chrome.contextMenus.create({
                "title": model.authenticated.getAccount().url, "contexts": ["page"],
                "onclick": function (obj) {
                	UTILS.Tab.toImage(null, '/js/inject/Tab.toImage.js').addEventListener('EVENT_COMPLETE', function (img) {
                        var evt = model.authenticated.sendImage("_userAlbum", img.split(',')[1]);
                        evt.type = "capture";
                        uploadDelegate(evt);
                    });

                }, "parentId": capturePageContextMenuItem
            });


            chrome.contextMenus.create({
                "title": "- this computer -", "contexts": ["page"],
                "onclick": function (obj) {
                    chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
                        var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
                        evt.type = "capture";
                        uploadDelegate(evt);
                    });
                }, "parentId": captureViewContextMenuItem
            });

            chrome.contextMenus.create({
                "title": model.authenticated.getAccount().url, "contexts": ["page"],
                "onclick": function (obj) {
                    chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
                        var evt = model.authenticated.sendImage("_userAlbum", img.split(',')[1]);
                        evt.type = "capture";
                        uploadDelegate(evt);
                    });
                }, "parentId": captureViewContextMenuItem
            });

            chrome.contextMenus.create({
                "title": "- this computer -", "contexts": ["page"],
                "onclick": function (obj) {
                	handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
                        var evt = model.unsorted.sendImage(encodeURIComponent(img.split(',')[1]));
                        evt.type = "capture";
                        uploadDelegate(evt);
                    });

                }, "parentId": captureAreaContextMenuItem
            });

            chrome.contextMenus.create({
                "title": model.authenticated.getAccount().url, "contexts": ["page"],
                "onclick": function (obj) {
                	handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
                        var evt = model.authenticated.sendImage("_userAlbum", img.split(',')[1]);
                        evt.type = "capture";
                        uploadDelegate(evt);
                    });

                }, "parentId": captureAreaContextMenuItem
            });

            chrome.contextMenus.create({
                "title": "- this computer -", "contexts": ["image"],
                "onclick": function (obj) {
                    var evt = model.unsorted.sendImageURL(obj.srcUrl);
                    evt.type = "rehost";
                    uploadDelegate(evt);

                }, "parentId": addImageContextMenuItem
            });


            chrome.contextMenus.create({
                "title": model.authenticated.getAccount().url, "contexts": ["image"],
                "onclick": function (obj) {
                    var evt = model.authenticated.sendImageURL("_userAlbum", obj.srcUrl);
                    evt.type = "rehost";
                    uploadDelegate(evt);

                }, "parentId": addImageContextMenuItem
            });

            for (var i = 0; i < authenticatedAlbums.length; i++) {

                (function (album) {

                    if (album.title) {

                        // Extend
                        chrome.contextMenus.create({
                            "title": album.title, "contexts": ["page"],
                            "onclick": function (obj) {
                            	UTILS.Tab.toImage(null, '/js/inject/Tab.toImage.js').addEventListener('EVENT_COMPLETE', function (img) {
                                    var evt = model.authenticated.sendImage(album.id, img.split(',')[1]);
                                    evt.type = "capture";
                                    uploadDelegate(evt);
                                });

                            }, "parentId": capturePageContextMenuItem
                        });


                        chrome.contextMenus.create({
                            "title": album.title, "contexts": ["page"],
                            "onclick": function (obj) {
                                chrome.tabs.captureVisibleTab(null, { format: "png" }, function (img) {
                                    var evt = model.authenticated.sendImage(album.id, img.split(',')[1]);
                                    evt.type = "capture";
                                    uploadDelegate(evt);
                                });
                            }, "parentId": captureViewContextMenuItem
                        });



                        chrome.contextMenus.create({
                            "title": album.title, "contexts": ["page"],
                            "onclick": function (obj) {
                                handleCapture().addEventListener('EVENT_SUCCESS', function (img) {
                                    var evt = model.authenticated.sendImage(album.id, img.split(',')[1]);
                                    evt.type = "capture";
                                    uploadDelegate(evt);

                                });

                            }, "parentId": captureAreaContextMenuItem
                        });

                        chrome.contextMenus.create({
                            "title": album.title, "contexts": ["image"],
                            "onclick": function (obj) {
                                var evt = model.authenticated.sendImageURL(album.id, obj.srcUrl);
                                evt.type = "rehost";
                                uploadDelegate(evt);

                            }, "parentId": addImageContextMenuItem
                        });

                    }
                })(authenticatedAlbums[i]);

            }

    }

    }

    function uploadCompleteNotification(message) {
        var notification = webkitNotifications.createNotification("img/logo.png", "Finished",  message);
        notification.show();
        setTimeout(function() { notification.cancel();}, 3000);
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

function showError(message) {
	chrome.browserAction.setBadgeText({ 'text': '' });
	webkitNotifications.createNotification("img/logo.png", "imgur failed", message).show();
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

    		model.authenticated.oAuthManager.getToken(verifier.Data).addEventListener('EVENT_SUCCESS', function () {
    			console.log('token success');
    			model.authenticated.fetchUser().addEventListener('EVENT_SUCCESS', function () {
    				console.log('fetch user success');
    				model.authenticated.fetchAlbums().addEventListener('EVENT_SUCCESS', function () {
    					console.log('fetch albums success');
    					setContextMenus();
    					authTab = -1;
    					chrome.tabs.onRemoved.removeListener(sendAuthAbortedMessage);
    					syncViews();
    				}).addEventListener('EVENT_ERROR', function (error) {
    					showError(error);
    				});
    			});
    		});


    	});

    });





});


// Set itself to run
var ContextMenuSchedule = new function () {
    var defaultInterval = interval = 30000,
        currentTimeout;

    function send() {
        if (model.authenticated.oAuthManager.getAuthStatus()) {
            model.authenticated.fetchAlbums().addEventListener('EVENT_SUCCESS', setContextMenus);
        } else {
            setContextMenus();
        }

        clearTimeout(currentTimeout);
        currentTimeout = null;

        currentTimeout = setTimeout(send, interval);

    }
    this.ResetInterval = function () {
        interval = defaultInterval;
        send()
    }
    this.SetInterval = function (newInterval) {
        interval = newInterval;
        send()
    }
    this.Start = function () {
        send();
    };

    requestMessenger.addEventListener("album_monitor_new", function () {
        ContextMenuSchedule.SetInterval(5000);
    });

    requestMessenger.addEventListener("album_monitor_closed", function () {
        ContextMenuSchedule.ResetInterval();
    });

    this.Start();

}