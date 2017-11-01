(function() {

    var body = document.getElementsByTagName('body')[0],
        overlay = document.createElement('div'),
        isDragging = false,
        isResizing = false,
        startPos;

    overlay.style.position = "absolute";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = "999999999";
    overlay.style.cursor = "crosshair";

    var dragArea = document.createElement('div');
    dragArea.style.backgroundColor = "rgba(0,0,0,0.2)";
    dragArea.style.position = "absolute";
    dragArea.style.display = "block";
    dragArea.style.resize = "both";
    dragArea.style.overflow = "auto";
    dragArea.style.width = 0;
    dragArea.style.border = "1px solid rgba(0,0,0,0.5)";
    dragArea.style.boxSizing = "border-box";
    overlay.appendChild(dragArea);

    var tools = document.createElement('div');
    tools.style.position = "absolute";
    tools.style.top = "10px";
    tools.style.right = "10px";
    dragArea.appendChild(tools);

    var okButton = document.createElement('span');
    okButton.style.padding = "5px 10px";
    okButton.style.marginRight = "10px";
    okButton.style.background = "rgba(0,128,0,0.5)";
    okButton.style.cursor = "pointer";
    okButton.style.display = "inline-block";
    okButton.style.boxShadow = "0 0 5px #000";
    okButton.style.color = "#fff";
    okButton.style.border = dragArea.style.border;
    okButton.innerHTML = "✓";
    tools.appendChild(okButton);

    var cancelButton = document.createElement('span');
    cancelButton.style.padding = "5px 10px";
    cancelButton.style.background = "rgba(255,0,0,0.5)";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.display = "inline-block";
    cancelButton.style.boxShadow = "0 0 5px #000";
    cancelButton.style.color = "#fff";
    cancelButton.style.border = dragArea.style.border;
    cancelButton.innerHTML = "✕";
    tools.appendChild(cancelButton);

    body.insertBefore(overlay, body.firstChild);
    body.prevOverflow = body.style.overflowY;
    body.style.overflowY = 'hidden';
    overlay.style.top = window.pageYOffset + 'px';

    function resetBody() {
        body.style.overflowY = body.prevOverflow;
    }
    function removeOverlay() {
        body.removeChild(overlay);
    }

    dragArea.onmouseover = function() {
        if(!isResizing) {
            tools.style.display = "block";
        }
    }

    dragArea.onmouseup = function() {
        isResizing = false;
    }

    dragArea.onmousedown = function() {
        isResizing = true;
        tools.style.display = "none";
    }

    dragArea.onmouseout = function() {
        tools.style.display = "none";
    }

    cancelButton.onmousedown = function(e) {
        e.stopPropagation();
        removeOverlay();
        resetBody();
    }

    okButton.onmousedown = function(e) {
        e.stopPropagation();
        submit();   
    };

    overlay.onmousedown = function (e) {
        isDragging = true;
        startPos = [e.clientX, e.clientY];
        dragArea.style.left = startPos[0] + 'px';
        dragArea.style.top = startPos[1] + 'px';
    };

    overlay.onmousemove = function (e) {

        if (isDragging) {

            var posx = e.clientX;
            var posy = e.clientY;

            if (posx < startPos[0]) {
                dragArea.style.left = posx + 'px';
            }
            if (posy < startPos[1]) {
                dragArea.style.top = posy + 'px';
            }

            dragArea.style.width = Math.max(posx, startPos[0]) - Math.min(posx, startPos[0]) + 'px';
            dragArea.style.height = Math.max(posy, startPos[1]) - Math.min(posy, startPos[1]) + 'px';
        }

    };

    overlay.onmouseup = function (e) {
        tools.style.display = "block";
        overlay.onmousedown = null;
        overlay.onmousemove = null;
        overlay.style.cursor = "default";
    };

    function submit() {

        var obj = {
            left: parseInt(dragArea.style.left) * window.devicePixelRatio,
            top: parseInt(dragArea.style.top) * window.devicePixelRatio,
            width: parseInt(dragArea.style.width) * window.devicePixelRatio,
            height: parseInt(dragArea.style.height) * window.devicePixelRatio
        }

        removeOverlay();

        chrome.runtime.sendMessage({
            CMD: 'got_area',
            Data: obj
        });

        setTimeout(resetBody, 50);
    }

}());