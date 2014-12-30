var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-41081662-9']);
_gaq.push(['_trackPageview']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var port = chrome.extension.connect({ name: "options" }),
    model = new Model();

var EClear,
    EConnections,
    ECopyOnRehost,
    ETabOnRehost,
    ECopyOnCapture,
    ETabOnCapture,
	EShowImagesInComments,
	EEnableNotifications,
    ESubmit;


port.onMessage.addListener(function (msg) {
    window.location.reload();
});

window.onload = function () {

    EMain = UTILS.DOM.id('nav-main'),
    EClear = UTILS.DOM.id('btn-clear'),
    EConnections = UTILS.DOM.id('connections'),
    ECopyOnRehost = UTILS.DOM.id('copy-on-rehost'),
    ETabOnRehost = UTILS.DOM.id('tab-on-rehost'),
    ECopyOnCapture = UTILS.DOM.id('copy-on-capture'),
    ETabOnCapture = UTILS.DOM.id('tab-on-capture'),
	EShowImagesInComments = UTILS.DOM.id('show-images-in-comments'),
	EEnableNotifications = UTILS.DOM.id('enable-notifications'),
	EUseSlideShow = UTILS.DOM.id('use-slideshow'),
    ESubmit = UTILS.DOM.id('submit');

    if (!model.authenticated.oAuthManager.getAuthStatus()) {
        EClear.style.display = "none";
    } else {
        EClear.onclick = function () {
            if (confirm("Are you sure?")) {
                model.reset();
                port.postMessage({ CMD: "sync" });
            }
        };
    }

    ESubmit.disabled = "disabled";

    EConnections.onclick = ECopyOnRehost.onclick = ETabOnRehost.onclick = ECopyOnCapture.onclick = ETabOnCapture.onclick = EShowImagesInComments.onclick = EEnableNotifications.onclick = EUseSlideShow.onclick = function () {
        ESubmit.removeAttribute("disabled");
    };

    EConnections.value = model.preferences.get('connections');
    ECopyOnRehost.checked = model.preferences.get('copyonrehost');
    ETabOnRehost.checked = model.preferences.get('tabonrehost');
    ECopyOnCapture.checked = model.preferences.get('copyoncapture');
    ETabOnCapture.checked = model.preferences.get('taboncapture');
    EShowImagesInComments.checked = model.preferences.get('showimagesincomments');
    EEnableNotifications.checked = model.preferences.get('enablenotifications');
    EUseSlideShow.checked = model.preferences.get('useslideshow');

    ESubmit.onclick = function () {

        ESubmit.value = "saving...";
        ESubmit.style.cursor = "progress";

        model.preferences.set('connections', EConnections.value);
        model.preferences.set('copyonrehost', ECopyOnRehost.checked);
        model.preferences.set('tabonrehost', ETabOnRehost.checked);
        model.preferences.set('copyoncapture', ECopyOnCapture.checked);
        model.preferences.set('taboncapture', ETabOnCapture.checked);
        model.preferences.set('showimagesincomments', EShowImagesInComments.checked);
        model.preferences.set('enablenotifications', EEnableNotifications.checked);
        model.preferences.set('useslideshow', EUseSlideShow.checked);
        setTimeout(function () {
            port.postMessage({ CMD: "sync" });
        }, 1000);
    }


};