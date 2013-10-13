var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-41081662-9']);
_gaq.push(['_trackPageview']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var port = chrome.extension.connect({ name: "main" }),
    model = new Model(),
    EWrap,
    ENav,
    ENavConnect,
    ENavSelect,
	ENavDownload,
	ENavDelete,
    EAlbums,
    CurrentAlbum,
    ECurrentAlbum,
    EStatusBar,
	EStatusBarLink,
	localStream;



function uploadFiles(e) {
    
    var noImages = ECurrentAlbum.querySelectorAll('.no-images')[0];
    if (noImages) {
        ECurrentAlbum.removeChild(noImages);
    }

    var filesObj = e.dataTransfer.files,
        files = [];

    for (var v = 0; v < filesObj.length; v++) {
        if (filesObj[v].type.match(/image.*/)) {
            files.push(filesObj[v]);
        }
    }
    if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i],
                reader = new FileReader();
            reader.onload = function (e) {
                makeItem(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    } else {
        
    }
}

function makeImage(fileData) {

    var img = UTILS.DOM.create('image');
    img.src = fileData;
    
    img.style.display = 'none';

    img.onload = function () {

        img.style.display = 'block';
        console.log(img, img.width, img.height)
        if (img.width > img.height) {
            img.width = 160;
        } else if(img.height > img.width) {
            img.height = 160;
        }
       
    };

    return img;

}

function friendlyNumber(n,d){x=(''+n).length,p=Math.pow,d=p(10,d);x-=x%3;return Math.round(n*d/p(10,x))/d+" kMGTPE"[x/3]}

function makeItem(fileData) {
    var ul = ECurrentAlbum.querySelectorAll('ul')[0],
        img = makeImage(fileData);
    var loadingItem = makeLoadingItem(img);
    var progress = loadingItem.querySelectorAll('progress')[0];
    ul.insertBefore(loadingItem, ul.firstChild);
    var evt;
    if (CurrentAlbum == "_thisComputer") {
        evt = model.unsorted.sendImage(encodeURIComponent(fileData.split(',')[1]));
        evt.addEventListener('EVENT_SUCCESS', function (e) {
        	convertLoadingToAlbum(loadingItem, e);
        });
    } else {
        evt = model.authenticated.sendImage(CurrentAlbum, fileData.split(',')[1]);
        evt.addEventListener('EVENT_SUCCESS', function (e) {
            convertLoadingToAlbum(loadingItem, e);
        });
    }
                
    evt.addEventListener(evt.EVENT_PROGRESS, function (e) {
        progress.value = Math.floor(((e.loaded/e.total) * 100));
    });

                
    evt.addEventListener('EVENT_ERROR', function (msg) {
    	
        var progress = loadingItem.querySelectorAll('progress')[0];
        loadingItem.removeChild(progress);
        loadingItem.classList.add('error');
        var errorText = msg.text;

        if (msg.status === 400) {
        	errorText += ' Please reload this page.';
        }

        loadingItem.onclick = function () { alert(errorText); };

    });
}

function makeURLItem(URL) {
    var ul = ECurrentAlbum.querySelectorAll('ul')[0],
        img = makeImage(URL);
    var loadingItem = makeLoadingItem(img);
    var progress = loadingItem.querySelectorAll('progress')[0];
    ul.insertBefore(loadingItem, ul.firstChild);
    var evt;
    if (CurrentAlbum == "_thisComputer") {
        evt = model.unsorted.sendImageURL(URL);
        evt.addEventListener('EVENT_SUCCESS', function (e) {
            convertLoadingToAlbum(loadingItem, e);
        });
    } else {
        evt = model.authenticated.sendImageURL(CurrentAlbum, URL);
        evt.addEventListener('EVENT_SUCCESS', function (e) {
            convertLoadingToAlbum(loadingItem, e);
        });
    }

    evt.addEventListener(evt.EVENT_PROGRESS, function (e) {
        progress.value = Math.floor(((e.loaded / e.total) * 100));
    });


    evt.addEventListener('EVENT_ERROR', function (msg) {
        var progress = loadingItem.querySelectorAll('progress')[0];
        loadingItem.removeChild(progress);
        loadingItem.classList.add('error');
        var errorText = msg.text;

        if (msg.status === 400) {
        	errorText += ' Please reload this page.';
        }

        loadingItem.onclick = function () { alert(errorText); };

    });
}


function deleteImage(image) {

	var elem = document.getElementById(image.id);

    progress = UTILS.DOM.create('progress');

    elem.appendChild(progress);
    var links = elem.querySelectorAll('a');
    elem.removeChild(links[0]);
    elem.removeChild(links[1]);

    elem.classList.add('loading');
    if (CurrentAlbum == "_thisComputer") {
    	model.unsorted.deleteImage(elem.getAttribute('data-deletehash')).addEventListener('EVENT_SUCCESS', function (e) {
            if (elem) {
                elem.parentNode.removeChild(elem);
            }
        });
    } else {
        elem.style.cursor = 'progress';
        model.authenticated.deleteImage(image.id).addEventListener('EVENT_SUCCESS', function (e) {
            if (elem) {
                elem.style.cursor = 'default';
                elem.parentNode.removeChild(elem);
            }
        });
    }
}

function makeAlbumItem(imageItem) {

    var li = UTILS.DOM.create('li'),
        inner = UTILS.DOM.create('div'),
        img = UTILS.DOM.create('img'),
		imgLink = UTILS.DOM.create('a'),
        del = UTILS.DOM.create('a'),
        copy = UTILS.DOM.create('a'),
		download = UTILS.DOM.create('a'),
		meme = UTILS.DOM.create('a'),
        copyInput = UTILS.DOM.create('input');

    inner.classList.add('inner');

    del.href = copy.href = "#";
    del.innerHTML = "delete";
    del.classList.add('image-delete');
    del.classList.add('action');
    del.onclick = function (e) {
        e.preventDefault();
        if (del.innerHTML == 'sure?') {
        	deleteImage(imageItem);
        } else {
            del.innerHTML = 'sure?';
        }

    };
	
    copy.innerHTML = "copy link";
    copy.classList.add('image-copy');
    copy.classList.add('action');
    copy.onclick = function (e) {
        e.preventDefault();
        copyInput.select();
        document.execCommand("Copy");
        var copyNotification = UTILS.DOM.create('span');

        copyNotification.innerHTML = 'copied';
        copyNotification.classList.add('copy-notification');
        li.appendChild(copyNotification);
        setTimeout(function () {
            li.removeChild(copyNotification);
        }, 1000);
    };

    copyInput.type = 'text';
    copyInput.value = imageItem.link;

    meme.href = "http://www.winmeme.com?url=" + imageItem.link;
    meme.innerHTML = "meme";
    meme.classList.add('image-meme');
    meme.classList.add('action');
    meme.onclick = function (e) {
    	e.preventDefault();
    	chrome.tabs.create({ url: this.href });
    };

    li.classList.add('loading');

    img.id = 'image-' + imageItem.id;

    img.onload = function () {
    	
        li.classList.remove('loading');

    };

    imgLink.onclick = function (e) {
    	e.preventDefault();
        chrome.tabs.create({ "url": imageItem.link, "selected": true });
    };

    imgLink.href = imageItem.link;
    imgLink.classList.add('image-link');
    console.log(imageItem);
    var il = imageItem.link.split('.'),
        ext = il.pop();
    img.src = il.join('.') + 't.' + ext;

    li.id = imageItem.id;
    if (imageItem.deletehash) {
    	li.setAttribute('data-deletehash', imageItem.deletehash);
    }

    download.href = "#";
    download.innerHTML = "download";
    download.classList.add('image-download');
    download.classList.add('action');
    download.onclick = function (e) {
    	e.preventDefault();
    	var existingIFrame = li.querySelectorAll('iframe')[0];
    	if (existingIFrame) {
    		li.removeChild(existingIFrame);
    	}

    	var iFrame = UTILS.DOM.create('iframe');
    	iFrame.src = "http://imgur.com/download/" + imageItem.id;
    	li.appendChild(iFrame);

    };

    if (imageItem.views) {
    	var views = UTILS.DOM.create('span');
    	views.classList.add('image-views');
    	views.innerHTML = friendlyNumber(imageItem.views, 1) + " view" + (imageItem.views !== 1 ? "s" : "");
    	li.appendChild(views);
    }

    imgLink.appendChild(img);

    inner.appendChild(copyInput);
    inner.appendChild(imgLink);
    inner.appendChild(del);
    inner.appendChild(copy);
    inner.appendChild(meme);
    inner.appendChild(download);

    li.appendChild(inner);
    

    return li;

}

function makeLoadingItem(image) {
    var li = UTILS.DOM.create('li'),
        inner = UTILS.DOM.create('div'),
        progress = UTILS.DOM.create('progress');

    progress.setAttribute('min', '0');
    progress.setAttribute('max', '100');

    inner.classList.add('inner');

    inner.appendChild(image);
    li.appendChild(inner);
    li.appendChild(progress);
    li.classList.add('loading');

    return li;
}

function convertLoadingToAlbum(loadingItem, fullItem) {
    loadingItem.parentNode.replaceChild(makeAlbumItem(fullItem), loadingItem);
}

function makeAlbum(album) {
    var div = UTILS.DOM.create('div'),
        ul = UTILS.DOM.create('ul');

    div.id = album.id;
    div.className = 'album';

    div.appendChild(ul);

    return div;

}

function criticalError() {
	//window.location.reload();
}

function changeAlbum(albumID) {
	hideStatusBar();
    if (albumID == '_newAlbum') {

        var albumTitle = prompt('Album title');

        if (albumTitle == "" || !albumTitle) {
            ENavSelect.value = CurrentAlbum;
        } else {
        	model.authenticated.makeAlbum(albumTitle).addEventListener('EVENT_COMPLETE', function (album) {
        		model.currentAlbum.set(album.id);
                window.location.reload();
            });
        }

        return;
    }

    model.currentAlbum.set(albumID);

    ENavSelect.value = albumID;

    if (ECurrentAlbum) {
        ECurrentAlbum.classList.remove('active');
    }

    CurrentAlbum = albumID;
    ECurrentAlbum = UTILS.DOM.id(CurrentAlbum);
    ECurrentAlbum.classList.add('active');

    var ul = ECurrentAlbum.querySelectorAll('ul')[0];

    if (CurrentAlbum == "_thisComputer") {
        var images = model.unsorted.get();
        ul.innerHTML = "";
        if (images.length > 0) {
        	for (var i = 0; i < images.length; i++) {
        		ul.insertBefore(makeAlbumItem(images[i]), ul.firstChild);
        	}
        } else {
			showStatusBar("You have no images in this album. You can drag and drop images onto this page or print screen and paste straight onto this page to upload your images.");
        }
    } else if (CurrentAlbum == "_userAlbum") {
        document.body.style.cursor = 'progress';
        model.authenticated.fetchUserImages().addEventListener('EVENT_SUCCESS', function (images) {
            document.body.style.cursor = 'default';
            ul.innerHTML = "";
            if (images) {
                for (var i = 0; i < images.length; i++) {
                    ul.insertBefore(makeAlbumItem(images[i]), ul.firstChild);
                }
            }
        }).addEventListener('EVENT_ERROR', function (msg) {
        	if (msg.status === 400) {
        		criticalError();
        	}
        	var notification = webkitNotifications.createNotification("img/logo96.png", "Error", msg.text);
        	notification.show();
        });
    } else {
    	
        document.body.style.cursor = 'progress';
        var noImages = ECurrentAlbum.querySelectorAll('.no-images')[0];
        model.authenticated.fetchAlbumImages(CurrentAlbum).addEventListener('EVENT_COMPLETE', function () {
        	document.body.style.cursor = 'default';
        	ul.innerHTML = "";
        }).addEventListener('EVENT_SUCCESS', function (data) {
        	
        	if (data.images.length > 0) {
        		for (var i = 0; i < data.images.length; i++) {
        			ul.insertBefore(makeAlbumItem(data.images[i]), ul.firstChild);
        		}
        	} else {
        		showStatusBar("You have no images in this album. You can drag and drop images onto this page or print screen and paste straight onto this page to upload your images.");
        	}
        }).addEventListener('EVENT_ERROR', function (msg) {
        	if (msg.status === 400) {
        		criticalError();
        	}
        	var notification = webkitNotifications.createNotification("img/logo96.png", "Error", msg.text);
        	notification.show();
        });
    }

}

function showStatusBar(text, showClose) {
	EStatusBar.querySelectorAll('.content')[0].innerHTML = text;
	if (showClose) {
		EStatusBarLink.style.display = "block";
	} else {
		EStatusBarLink.style.display = "none";
	}
	EStatusBar.classList.add('show');
}

function hideStatusBar() {
	EStatusBar.classList.remove('show');
}

function initAuthenticated() {
    ENavConnect.classList.add('hide');
    ENavSelect.classList.remove('hide');
    var albums = model.authenticated.getAlbums();

    var unsortedOpt = UTILS.DOM.create('option');
    unsortedOpt.value = '_thisComputer';
    unsortedOpt.text = '- this computer -';
    ENavSelect.appendChild(unsortedOpt);

    var defaultAlbumOpt = UTILS.DOM.create('option');
    defaultAlbumOpt.value = '_userAlbum';
    defaultAlbumOpt.text = model.authenticated.getAccount().url;
    ENavSelect.appendChild(defaultAlbumOpt);

    var EUserAlbum = makeAlbum({ id: '_userAlbum' });
    EAlbums.appendChild(EUserAlbum);

    if (albums) {
        for (var i = 0; i < albums.length; i++) {

            var EAlbum = makeAlbum(albums[i]);

            var opt = UTILS.DOM.create('option');
            opt.value = albums[i].id;
            opt.text = albums[i].title || "(Untitled Album)";

            ENavSelect.appendChild(opt);
            EAlbums.appendChild(EAlbum);
        }
    }
	/* Unexpected results
    var newAlbumOpt = UTILS.DOM.create('option');
    newAlbumOpt.value = '_newAlbum';
    newAlbumOpt.text = '<New Album>';
    ENavSelect.appendChild(newAlbumOpt);
	*/
}

port.onMessage.addListener(function (msg) {
    // Only gets one message
    window.location.reload();
});

$(document).ready(function () {


    $("#nav-options").fancybox();

	EAlbums = UTILS.DOM.id('albums');
	EWrap = UTILS.DOM.id('wrap');
	ENav = document.getElementsByTagName('nav')[0];
	ENavConnect = UTILS.DOM.id('nav-connect');
	ENavDownload = UTILS.DOM.id('nav-download');
	ENavDelete = UTILS.DOM.id('nav-delete');
	ENavSelect = UTILS.DOM.id('nav-albums');
	EStatusBar = UTILS.DOM.id('status-bar');
	EStatusBarLink = EStatusBar.querySelectorAll('span')[0];

	document.documentElement.ondrop = function (e) {
        e.preventDefault();
		uploadFiles(e);
		hideStatusBar();
	};

	document.documentElement.ondragenter = function (e) {
		e.dataTransfer.dropEffect = 'copy';
		e.preventDefault();
		return false;
	};

	document.documentElement.ondragover = function (e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		showStatusBar("Drop images to upload");
		return false;
	};

	document.documentElement.ondragexit = document.documentElement.ondragleave = function (e) {
		hideStatusBar();
		return false;
	};


	document.documentElement.onpaste = function (e) {
		var items = e.clipboardData.items;
		for (var i = 0; i < items.length; ++i) {
			if (items[i].kind == 'file' && items[i].type == 'image/png') {
				var blob = items[i].getAsFile();

				var reader = new FileReader();
				reader.onload = function (e) {
					makeItem(e.target.result);
				}
				reader.readAsDataURL(blob);

			}
		}
	};

	ENavConnect.onclick = function () {
		ENavConnect.onclick = null;
		ENavConnect.innerHTML = '<progress />';
		ENavConnect.style.cursor = 'progress';
		port.postMessage({ CMD: "get_user" });
	};

	ENavSelect.onchange = function () {
		changeAlbum(this.value);
	};


	ENavDownload.onclick = function (e) {
		e.preventDefault();
		var downloadLinks = ECurrentAlbum.querySelectorAll('.image-download');

		var evObj = document.createEvent('MouseEvents');
		evObj.initEvent('click', true, false);

		for (var i = 0; i < downloadLinks.length; i++) {
			downloadLinks[i].dispatchEvent(evObj);
		}

	}

	ENavDelete.onclick = function (e) {
		e.preventDefault();

		if(confirm("Are you sure you want to delete all images in this album?")) {

			var images = ECurrentAlbum.querySelectorAll('li');

			for (var i = 0; i < images.length; i++) {
				deleteImage(images[i])
			}

		}

		

	}

	EStatusBarLink.addEventListener('click', function (e) {
		hideStatusBar();
	});

	EAlbums.appendChild(makeAlbum({ id: '_thisComputer' }));

	if (model.authenticated.oAuthManager.getAuthStatus()) {
		initAuthenticated();
	} else {
		ENavConnect.classList.remove('hide');
	}
	changeAlbum(model.currentAlbum.get());

});