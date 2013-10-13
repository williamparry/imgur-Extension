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
    ESubmit;


port.onMessage.addListener(function (msg) {
    window.location.reload();
});

window.onload = function () {

    EMain = UTILS.DOM.id('nav-main'),
    EClear = UTILS.DOM.id('btn-clear'),
    EConnections = UTILS.DOM.id('connections'),
    EFreezeGifs = UTILS.DOM.id('freeze-gifs'),
    ECopyOnRehost = UTILS.DOM.id('copy-on-rehost'),
    ETabOnRehost = UTILS.DOM.id('tab-on-rehost'),
    ECopyOnCapture = UTILS.DOM.id('copy-on-capture'),
    ETabOnCapture = UTILS.DOM.id('tab-on-capture'),
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

    EConnections.onclick = ECopyOnRehost.onclick = ETabOnRehost.onclick = ECopyOnCapture.onclick = ETabOnCapture.onclick = EFreezeGifs.onclick = function () {
        ESubmit.removeAttribute("disabled");
    };

    EConnections.value = model.preferences.get('connections');
    EFreezeGifs.checked = model.preferences.get('freezegifs');
    ECopyOnRehost.checked = model.preferences.get('copyonrehost');
    ETabOnRehost.checked = model.preferences.get('tabonrehost');
    ECopyOnCapture.checked = model.preferences.get('copyoncapture');
    ETabOnCapture.checked = model.preferences.get('taboncapture');


    ESubmit.onclick = function () {

        ESubmit.value = "saving...";
        ESubmit.style.cursor = "progress";

        model.preferences.set('connections', EConnections.value);
        model.preferences.set('freezegifs', EFreezeGifs.checked);
        model.preferences.set('copyonrehost', ECopyOnRehost.checked);
        model.preferences.set('tabonrehost', ETabOnRehost.checked);
        model.preferences.set('copyoncapture', ECopyOnCapture.checked);
        model.preferences.set('taboncapture', ETabOnCapture.checked);
        setTimeout(function () {
            port.postMessage({ CMD: "sync" });
        }, 1000);
    }


};