/// <reference path="/vsdoc/utils-1.3-vsdoc.js" />
/// <reference path="/vsdoc/chrome-vsdoc.js" />

function Model() {

	var root = this;

	var clientId = "e5642c924b26904";

	// ------------------------------------------------------------------
	// Data Access Layer
	// ------------------------------------------------------------------

	var DAL = new UTILS.LocalStoreDAL('imgur');

	// ------------------------------------------------------------------
	// Upgrade information
	// ------------------------------------------------------------------

	var checkVersion = DAL.get("currentVersion");
	var currentVersion = chrome.app.getDetails().version;
    
	// ------------------------------------------------------------------
	// Upgrade -1 ~ 0.5 - 1.0.3
	// ------------------------------------------------------------------

    if (!DAL.get('preferences')) {

        var unsorted = DAL.get('storedImages') || [];

        var preferences = {
            connections: DAL.get('connections') || 1,
            currentAlbum: '_thisComputer'
        };
        // utils should add be able to set properties for oauth 1 level deep
        DAL.reset({ unsorted: unsorted, albums: [], preferences: preferences, account: {}, OAuthTokens: {access_token: null, access_token_secret: null} });
    }

	// ------------------------------------------------------------------
	// Upgrade 1.0.3 - 1.0.4
	// ------------------------------------------------------------------

    if (DAL.get('preferences.copyonrehost') == null) {

        DAL.set('preferences.copyonrehost', false);
        DAL.set('preferences.tabonrehost', true);
        DAL.set('preferences.copyoncapture', false);
        DAL.set('preferences.taboncapture', true);
		
    };

	// ------------------------------------------------------------------
	// Upgrade 1.0.4, 1.0.5 - 1.1
	// ------------------------------------------------------------------

    if (DAL.get('preferences.freezegifs') == null) {

    	DAL.set('preferences.freezegifs', true);
    	DAL.set('preferences.shownavairywarning', false);

    };

	// ------------------------------------------------------------------
	// Upgrade 1.1 - 1.2
	// ------------------------------------------------------------------

    if (DAL.get('OAuth2') == null) {

    	// Invalidate OAuth 1
    	// This should set the user back to "connect to imgur"
    	DAL.set('OAuthTokens', null);
    	DAL.set('preferences.currentAlbum', '_thisComputer');
		
    	// Upgrade old stored images
    	var unsorted = DAL.get('unsorted');

    	var upgradedUnsorted = [];

    	for (var i = 0; i < unsorted.length, imageItem = unsorted[i]; i++) {

    		upgradedUnsorted.push({

    			"id": imageItem.image.hash,
    			"title": imageItem.image.title,
    			"description": imageItem.image.caption,
    			"datetime": (new Date(imageItem.image.datetime)).getTime(), // New format is a number
    			"type": imageItem.image.type,
    			"animated": Boolean(imageItem.image.animated), // boolean is now... a boolean
    			"width": imageItem.image.width,
    			"height": imageItem.image.height,
    			"size": imageItem.image.size,
    			"views": imageItem.image.views,
    			"link": imageItem.links.original,
    			"bandwidth": imageItem.image.bandwidth,
    			"deletehash": imageItem.image.deletehash

    		});

    	}
    	DAL.set('unsorted', upgradedUnsorted);

    	DAL.set('OAuth2', { access_token: null, refresh_token: null, account_username: null, refreshing: false });
    };

	// ------------------------------------------------------------------
	// Upgrade 2.0.4 - 2.0.5
	// ------------------------------------------------------------------

    if (DAL.get('notifications') == null) {

    	DAL.set("notifications", {});

    };

	// ------------------------------------------------------------------
	// Future testing to use this method
	// ------------------------------------------------------------------

    if (checkVersion !== currentVersion) {

    	if (checkVersion === "2.0.5") {
    		DAL.set("notifications.winmeme", false);
    	}

    	DAL.set("currentVersion", currentVersion);
    }


	function encode(str) {
    	return encodeURIComponent(str).replace(/\!/g, "%21").
            replace(/\*/g, "%2A").
            replace(/'/g, "%27").
            replace(/\(/g, "%28").
            replace(/\)/g, "%29");
    }

	// ------------------------------------------------------------------
	// Set notified
	// ------------------------------------------------------------------

	this.getNotifications = function () {

		var notifications = DAL.get("notifications"),
			retArr = [];
		
		if (notifications) {

			for (var notification in notifications) {

				if (!notifications[notification]) {
					retArr.push(notification);
				}

			}

		}

		return retArr;

	}

	this.setNotified = function (key) {
		DAL.set("notifications." + key, true);
	}

	// ------------------------------------------------------------------
	// Reset
	// ------------------------------------------------------------------

    this.reset = function () {
        DAL.set('preferences.currentAlbum', '_thisComputer');
        root.authenticated.oAuthManager.reset();
    };

	// ------------------------------------------------------------------
	// Preferences
	// ------------------------------------------------------------------

    this.preferences = new function () {

        this.get = function (preference) {
            return DAL.get('preferences.' + preference);
        };

        this.set = function (preference, value) {
            DAL.set('preferences.' + preference, value);
        };

    }

	// ------------------------------------------------------------------
	// Current Album
	// ------------------------------------------------------------------

    this.currentAlbum = new function () {

        this.get = function () {
            
            var albums = DAL.get('albums'),
                currentAlbum = DAL.get('preferences.currentAlbum');


            if (!albums || !!!~UTILS.ARRAY.getIndexByObjectPropertyValue(currentAlbum, 'id')) {
                    if (currentAlbum !== '_userAlbum') {
                        currentAlbum = '_thisComputer';
                        DAL.set('preferences.currentAlbum', currentAlbum);
                    }
            }

            return DAL.get('preferences.currentAlbum');
        };

        this.set = function (value) {
            DAL.set('preferences.currentAlbum', value);
        };

    };

	// ------------------------------------------------------------------
	// Request Manager
	// ------------------------------------------------------------------

    this.requestManager = new function () {

    	var self = this;
    	var timer;
    	var CurrentlyProcessing = 0;
    	var pending = [];

    	this.queue = function (req) {
    		console.log('queue', req);
    		pending.push(req);
    	};

    	function requeue(req) {
    		console.log('requeue', req);
    		pending.unshift(req);
    	};

    	function processQueue() {
    		
    		if (pending.length > 0 && !!!DAL.get('OAuth2.refreshing')) {

    			if (CurrentlyProcessing < root.preferences.get('connections')) {

    				CurrentlyProcessing++;
    				console.log("increment start request", CurrentlyProcessing);
    				var item = pending.shift();

    				// Getting requeued so remove all manager listeners (they'll get added again)
    				// Limitation in utils-1.3 that you can't pass an array in
    				item.evtD.removeEventListenersByHandler('EVENT_REAUTH', 'manager');
    				item.evtD.removeEventListenersByHandler('EVENT_COMPLETE', 'manager');
    				item.evtD.removeEventListenersByHandler('EVENT_ERROR', 'manager');

    				// Listen to the item's events
    				item.evtD.addEventListener('EVENT_REAUTH', function () {

    					CurrentlyProcessing--;

    					console.log("decrement reauth event", CurrentlyProcessing);

						// Would be good to get a getListenersByHandle(handle)
    					console.log('Auth listeners count = ', item.evtD.getListeners('EVENT_REAUTH'), 'Pending = ', pending);

    					console.log("reauthentication status is", !!DAL.get('OAuth2.refreshing'));

    					if (!!!DAL.get('OAuth2.refreshing')) {
							
    						DAL.set('OAuth2.refreshing', true);

    						CurrentlyProcessing++;

    						console.log("increment auth start", CurrentlyProcessing);

    						root.authenticated.oAuthManager.refreshToken().addEventListener("EVENT_SUCCESS", function () {

    							CurrentlyProcessing--;

    							console.log("decrement auth finish", CurrentlyProcessing);

    							DAL.set('OAuth2.refreshing', false);

    							console.log('Token refreshed. Requeue ', item);

    							requeue(item);

    						}).addEventListener("EVENT_ERROR", function (error) {

								// Handled by EVENT_ERROR on the item
    							// CurrentlyProcessing--;

    							console.error('Refresh token expired, have to clear tokens :(');

    							console.warn('Token not refreshed. Requeue ', item);

    							clearInterval(timer);

    							DAL.set('OAuth2.refreshing', false);

    							root.reset();

    							pending.unshift(item);

    							var len = pending.length;

    							for (var i = 0; i < len; i++) {

    								console.log(error);
    								pending.shift().evtD.dispatchEvent('EVENT_ERROR', error);

    							}

    						});
    						
    					} else {

    						console.log('Reauthentication running, requeue ', item);

    						requeue(item);
    					}

    				}, 'manager');

    				item.evtD.addEventListener(['EVENT_COMPLETE', 'EVENT_ERROR'], function (e) {

    					CurrentlyProcessing--;

    					console.log("decrement finished event", CurrentlyProcessing, e);

    					console.log('Complete. Currently processing = ', CurrentlyProcessing, 'Pending = ', pending);

    				}, 'manager');

    				console.log('-- start request', item);

    				item.handler.call(item, item.argsObj, item.evtD);

    			}
    		}
    	}

    	timer = setInterval(processQueue, 500);

    };

	// ------------------------------------------------------------------
	// Authenticated
	// ------------------------------------------------------------------

    this.authenticated = new function () {

    	var authenticated = this;

    	this.oAuthManager = new function () {

    		this.reset = function () {
    			DAL.set('OAuth2.access_token', null);
    			DAL.set('OAuth2.refresh_token', null);
    			DAL.set('OAauth2.account_username', null);
    		}

    		this.set = function (access_token, refresh_token, account_username) {
    			DAL.set('OAuth2.access_token', access_token);
    			DAL.set('OAuth2.refresh_token', refresh_token);
    			DAL.set('OAuth2.account_username', account_username);
    		};

			// Only for testing
    		this.invalidateToken = function () {
    			DAL.set('OAuth2.refreshing', false);
    			DAL.set('OAuth2.access_token', 123);
    			return DAL.get('OAuth2.access_token');
    		};

			// Only for testing
    		this.invalidateRefreshToken = function () {
    			DAL.set('OAuth2.refreshing', false);
    			DAL.set('OAuth2.access_token', 123);
    			DAL.set('OAuth2.refresh_token', 123);
    			return DAL.get('OAuth2.refresh_token');
    		};

    		this.resetRefreshing = function () {
    			DAL.set('OAuth2.refreshing', false);
    		};

    		this.getAuthStatus = function () {
    			return DAL.get('OAuth2.access_token') != null;
    		};

    		this.getToken = function (pin) {

    			var evtD = new UTILS.EventDispatcher(['EVENT_COMPLETE', 'EVENT_SUCCESS', 'EVENT_ERROR']),
					xhr = new XMLHttpRequest();

    			xhr.open("GET", "https://imgur-extension-server.appspot.com/getToken/" + clientId + "/" + pin, true);
    			xhr.onreadystatechange = function () {

    				if (xhr.readyState == 4) {

    					evtD.dispatchEvent("EVENT_COMPLETE");

    					try {

    						var resp = JSON.parse(xhr.responseText);

    						if (xhr.status === 200) {

    								authenticated.oAuthManager.set(resp.access_token, resp.refresh_token, resp.account_username);
    								evtD.dispatchEvent("EVENT_SUCCESS");

    						} else {

    							console.warn('other error', xhr.status);
    							evtD.dispatchEvent("EVENT_ERROR", resp.data.error);

    						}

    					} catch (ex) {

    						console.log('imgur borked');
    						evtD.dispatchEvent("EVENT_ERROR", "imgur API error. Please try again later.");

    					}


    				}
    			};
    			xhr.send(null);
    			return evtD;
    		};

			// This is only consumed in the context of the request manager
    		this.refreshToken = function () {

    			var evtD = new UTILS.EventDispatcher(['EVENT_SUCCESS', 'EVENT_ERROR']),
					xhr = new XMLHttpRequest();

    			xhr.open("GET", "https://imgur-extension-server.appspot.com/getRefreshToken/" + clientId + "/" + DAL.get('OAuth2.refresh_token'), true);

    			xhr.onreadystatechange = function () {

    				if (xhr.readyState == 4) {

    					try {

    						var resp = JSON.parse(xhr.responseText);

    						if (xhr.status === 200) {
    						
    							authenticated.oAuthManager.set(resp.access_token, resp.refresh_token, resp.account_username);
    							console.log("new refresh token", resp.refresh_token);
    							evtD.dispatchEvent("EVENT_SUCCESS");

    						} else {

    							console.error('other error', xhr.status);
    							evtD.dispatchEvent("EVENT_ERROR", { text: "Your authentication has expired. We're not allowed to extend it so you'll have to connect to imgur again. Sorry, we know it sucks.", status: xhr.status });

    						}
    					
    					} catch (ex) {
    						console.log('imgur borked');
    						evtD.dispatchEvent("EVENT_ERROR", { text: "Something went very wrong with the API response", status: xhr.status });

    					}

    				}

    			}

    			xhr.send(null);

    			return evtD;

    		}

    	}

		// Can only make instances of
    	var signedRequest = function (method, url, postStr) {
    		
    		var self = this;

    		this.evtD = new UTILS.EventDispatcher(['EVENT_COMPLETE', 'EVENT_SUCCESS', 'EVENT_ERROR', 'EVENT_PROGRESS', 'ERROR_RATE_LIMITED']);

    		this.handler = function () {

    			var xhr = new XMLHttpRequest();

    			xhr.open(method, url + (!!~url.indexOf('?') ? "&" : "?") + "r=" + Math.random()*9999999, true);
    			xhr.setRequestHeader('Authorization', 'Bearer ' + DAL.get('OAuth2.access_token'));

    			if (postStr) {
    				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    			}

    			var upload = xhr.upload;
    			upload.addEventListener("progress", function (ev) {
    				if (ev.lengthComputable) {
    					self.evtD.dispatchEvent('EVENT_PROGRESS', { loaded: ev.loaded, total: ev.total });
    				}
    			}, false);

    			xhr.onreadystatechange = function () {

    				if (xhr.readyState === 4) {

    					try {

    						var resp = JSON.parse(xhr.responseText);

    						if (xhr.status === 200) {

    							var resp = JSON.parse(xhr.responseText);
    						
    							self.evtD.dispatchEvent('EVENT_COMPLETE', resp.data);

    							if (resp.success) {

    								self.evtD.dispatchEvent('EVENT_SUCCESS', resp.data);

    							} else {
    								console.log('error', resp);
    								self.evtD.dispatchEvent('EVENT_ERROR', resp.error);

    							}

    						} else if (xhr.status === 403) {

    							console.warn('auth error');
    							// Inherited EVENT_REAUTH
    							self.evtD.dispatchEvent("EVENT_REAUTH");

    						} else {

    							console.warn('other error', xhr.status);
    							self.evtD.dispatchEvent("EVENT_ERROR", resp.data.error);

    						}

    					} catch (ex) {
    						console.log('imgur borked');
    						self.evtD.dispatchEvent("EVENT_ERROR", "imgur API error. Please try again later.");

    					}

    				}
    			};

    			xhr.send(postStr);

    		};

    		return this;

    	};

    	this.getAccount = function () {
    		return DAL.get('account');
    	};

    	this.getAlbums = function () {
    		return DAL.get('albums');
    	};

    	this.fetchUser = function () {

    		var req = new signedRequest("GET", "https://api.imgur.com/3/account/me")
    		root.requestManager.queue(req);

    		req.evtD.addEventListener("EVENT_SUCCESS", function (account) {
    			DAL.set('account', account);
    		});

    		return req.evtD;
    	};

    	this.fetchUserImages = function () {
    		
    		var req = new signedRequest("GET", "https://api.imgur.com/3/account/me/images")
    		root.requestManager.queue(req);
    		return req.evtD;

    	};

    	this.fetchAlbums = function () {

    		var req = new signedRequest("GET", "https://api.imgur.com/3/account/me/albums");
    		root.requestManager.queue(req);
    		console.log('fetch albums');
    		req.evtD.addEventListener("EVENT_SUCCESS", function (albums) {
    			DAL.set('albums', albums);
    		});

    		return req.evtD;

    	};

    	this.fetchAlbumImages = function (ID) {

    		var req = new signedRequest("GET", "https://api.imgur.com/3/account/me/album/" + ID);
    		root.requestManager.queue(req);
    		return req.evtD;

    	};

    	this.makeAlbum = function (title) {
    		
    		var req = new signedRequest("POST", "https://api.imgur.com/3/album/", "title=" + title);
    		root.requestManager.queue(req);

    		req.evtD.addEventListener("EVENT_SUCCESS", function (album) {
    			var albums = authenticated.getAlbums();
    			albums.push(album);
    			DAL.set('albums', albums);
    		});

    		return req.evtD;

    	};

    	this.sendImage = function (album, image) {

			// Don't track the actual image, just that they have triggered this method
    		_gaq.push(['_trackEvent', 'Image', 'Send Image', 'Authenticated']);

    		var postStr = "image=" + encode(image) + "&type=base64";

    		if (album !== '_userAlbum') {
    			postStr += "&album=" + album;
    		}

    		var req = new signedRequest("POST", "https://api.imgur.com/3/image", postStr);
    		root.requestManager.queue(req);

    		return req.evtD;

    	};

    	this.sendImageURL = function (album, url) {

    		// Don't track the actual image, just that they have triggered this method
    		_gaq.push(['_trackEvent', 'Image', 'Send Image URL', 'Authenticated']);

    		var postStr = "image=" + encode(url) + "&type=url";

    		if (album !== '_userAlbum') {
    			postStr += "&album=" + album;
    		}

    		var req = new signedRequest("POST", "https://api.imgur.com/3/image", postStr);
    		root.requestManager.queue(req);

    		return req.evtD;

    	};


    	this.deleteImage = function (deletehash) {

    		// Don't track the actual image, just that they have triggered this method
    		_gaq.push(['_trackEvent', 'Image', 'Delete Image', 'Authenticated']);

    		var req = new signedRequest("DELETE", "https://api.imgur.com/3/image/" + deletehash);
    		root.requestManager.queue(req);

    		return req.evtD;

    	};

    }();


	// ------------------------------------------------------------------
	// Unsorted (not authenticated)
	// ------------------------------------------------------------------

    this.unsorted = new function (model) {

    	var unsorted = this;

    	// Can only make instances of
    	var signedRequest = function (method, url, postStr) {

    		var self = this;

    		this.evtD = new UTILS.EventDispatcher(['EVENT_COMPLETE', 'EVENT_SUCCESS', 'EVENT_ERROR', 'EVENT_PROGRESS', 'ERROR_RATE_LIMITED']);

    		this.handler = function () {

    			var xhr = new XMLHttpRequest();

    			xhr.open(method, url, true);
    			xhr.setRequestHeader('Authorization', 'Client-ID ' + clientId);

    			if (postStr) {
    				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    			}

    			var upload = xhr.upload;
    			upload.addEventListener("progress", function (ev) {
    				if (ev.lengthComputable) {
    					self.evtD.dispatchEvent('EVENT_PROGRESS', { loaded: ev.loaded, total: ev.total });
    				}
    			}, false);

    			xhr.onreadystatechange = function () {

    				if (xhr.readyState === 4) {
    					
    					try {

    						var resp = JSON.parse(xhr.responseText);

    						if (xhr.status === 200) {

    							var resp = JSON.parse(xhr.responseText);
    						
    							self.evtD.dispatchEvent('EVENT_COMPLETE', resp.data);

    							if (resp.success) {

    								self.evtD.dispatchEvent('EVENT_SUCCESS', resp.data);

    							} else {

    								self.evtD.dispatchEvent('EVENT_ERROR', resp.error);

    							}

    						}  else {

    							console.warn('other error', xhr.status);
    							self.evtD.dispatchEvent("EVENT_ERROR", resp.data.error);

    						}
    					
    					} catch (ex) {

    						self.evtD.dispatchEvent("EVENT_ERROR", "imgur API error. Please try again later.");

    					}

    				}
    			};

    			xhr.send(postStr);

    		};

    		return this;

    	};

    	this.get = function () {
    		return DAL.get('unsorted');
    	};

    	this.sendImage = function (image) {

    		// Don't track the actual image, just that they have triggered this method
    		_gaq.push(['_trackEvent', 'Image', 'Send Image', 'Unauthenticated']);

			// Strange how we don't encode the image here to make it work
    		var req = new signedRequest("POST", "https://api.imgur.com/3/image", "image=" + image + "&type=base64");
    		root.requestManager.queue(req);

    		req.evtD.addEventListener("EVENT_SUCCESS", function (image) {

    			var unsorted = DAL.get('unsorted');
    			unsorted.push(image);
    			DAL.set('unsorted', unsorted);

    		});

    		return req.evtD;

    	};



    	this.sendImageURL = function (url) {

    		// Don't track the actual image, just that they have triggered this method
    		_gaq.push(['_trackEvent', 'Image', 'Send Image URL', 'Unauthenticated']);

    		var req = new signedRequest("POST", "https://api.imgur.com/3/image", "image=" + encode(url) + "&type=url");
    		root.requestManager.queue(req);

    		req.evtD.addEventListener("EVENT_SUCCESS", function (image) {

    			var unsorted = DAL.get('unsorted');
    			unsorted.push(image);
    			DAL.set('unsorted', unsorted);

    		});

    		return req.evtD;

    	};

    	

    	this.deleteImage = function (deletehash) {

    		// Don't track the actual image, just that they have triggered this method
    		_gaq.push(['_trackEvent', 'Image', 'Delete Image', 'Unauthenticated']);

    		var req = new signedRequest("DELETE", "https://api.imgur.com/3/image/" + deletehash);
    		root.requestManager.queue(req);

    		req.evtD.addEventListener("EVENT_SUCCESS", function (image) {

    			var unsorted = DAL.get('unsorted'),
					storageItem = UTILS.ARRAY.getIndexByObjectPropertyValue(unsorted, 'deletehash', deletehash);
    			if (storageItem !== -1) {
    				unsorted.splice(storageItem, 1);
    			}

    			DAL.set('unsorted', unsorted);

    		});

    		return req.evtD;

    	};

    } ();

}