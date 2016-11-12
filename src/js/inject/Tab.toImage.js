// Assumes when this script is being called, nothing else is messaging at the same time
// Note: There's no way to set who receives what message (the first one who responds handles and discards
// Init start to assign port id and also set an untilY
// port id may not be necessary but sending the untilY necessitates this
chrome.extension.onMessage.addListener(function (data) {

	var body,
		html,
		ref,
		port,
		origOverflowY,
		origOverflowX,
		origOffsetTop,
		docHeight,
		viewHeight,
		overlay,
		buffer;

	ref = arguments.callee;
	port = chrome.extension.connect({ name: data.portId });
	origOverflowY = document.body.style.overflowY;
	document.body.style.overflowY = 'hidden';
	origOverflowX = document.body.style.overflowX;
	document.body.style.overflowX = 'hidden';
	origOffsetTop = document.body.scrollTop;
	body = document.body,
    html = document.documentElement;

	docHeight = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
	
	viewHeight = window.innerHeight;
	overlay = document.createElement('div');
	overlay.style.position = 'absolute';
	overlay.style.width = '100%';
	overlay.style.height = '100%';
	document.body.appendChild(overlay);
	buffer = 0;


	function scroll() {

		document.documentElement.style.transform = "translateY(-" + buffer + "px)";
		
		overlay.style.top = document.body.scrollTop + 'px';

		buffer += viewHeight;

		if (buffer >= docHeight) {

			port.postMessage({
				CMD: 'CAPTURE',
				Data: {
					moreToCome: false,
					overflow: buffer - docHeight,
					width: window.innerWidth,
					height: docHeight,
					viewHeight: viewHeight
				}
			});

		} else {

			port.postMessage({
				CMD: 'CAPTURE',
				Data: {
					moreToCome: true
				}
			});

		}

	}

	function stopScroll () {
		buffer = 0;
		document.documentElement.style.transform = "translateY(-" + 0 + "px)";
		window.scrollTo(0, origOffsetTop);
		document.body.style.overflowY = origOverflowY;
		document.body.style.overflowX = origOverflowX;
		document.body.removeChild(overlay);
		port.disconnect();
		chrome.extension.onMessage.removeListener(ref);
	}

	port.onMessage.addListener(function (data) {
		switch (data.CMD) {
			case "SCROLL": scroll(); break;
			case 'STOP': stopScroll(); break;
		}
	});

	window.scrollTo(0, 0);
	setTimeout(scroll, 50);

});