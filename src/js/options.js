var port = chrome.runtime.connect({ name: "options" }),
    model = new Model();

var EClear,
    EConnections,
    ECopyOnRehost,
    ETabOnRehost,
    ECopyOnCapture,
    ETabOnCapture,
	EEnableNotifications,
    ESubmit;


port.onMessage.addListener(function (msg) {
    window.location.reload();
});

window.onload = function () {

    EMain = UTILS.D.id('nav-main'),
    EClear = UTILS.D.id('btn-clear'),
    EConnections = UTILS.D.id('connections'),
    ECopyOnRehost = UTILS.D.id('copy-on-rehost'),
    ETabOnRehost = UTILS.D.id('tab-on-rehost'),
    ECopyOnCapture = UTILS.D.id('copy-on-capture'),
    ETabOnCapture = UTILS.D.id('tab-on-capture'),
	EEnableNotifications = UTILS.D.id('enable-notifications'),
    ESubmit = UTILS.D.id('submit');

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

    EConnections.onclick = ECopyOnRehost.onclick = ETabOnRehost.onclick = ECopyOnCapture.onclick = ETabOnCapture.onclick = EEnableNotifications.onclick = function () {
        ESubmit.removeAttribute("disabled");
    };

    EConnections.value = model.preferences.get('connections');
    ECopyOnRehost.checked = model.preferences.get('copyonrehost');
    ETabOnRehost.checked = model.preferences.get('tabonrehost');
    ECopyOnCapture.checked = model.preferences.get('copyoncapture');
    ETabOnCapture.checked = model.preferences.get('taboncapture');
    EEnableNotifications.checked = model.preferences.get('enablenotifications');

    ESubmit.onclick = function () {

        ESubmit.value = "saving...";
        ESubmit.style.cursor = "progress";

        model.preferences.set('connections', EConnections.value);
        model.preferences.set('copyonrehost', ECopyOnRehost.checked);
        model.preferences.set('tabonrehost', ETabOnRehost.checked);
        model.preferences.set('copyoncapture', ECopyOnCapture.checked);
        model.preferences.set('taboncapture', ETabOnCapture.checked);
        model.preferences.set('enablenotifications', EEnableNotifications.checked);
        setTimeout(function () {
            port.postMessage({ CMD: "sync" });
        }, 1000);
    }


};
