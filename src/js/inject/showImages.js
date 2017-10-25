window.onload = function() {

	var config = { attributes: true, childList: true, subtree: true, characterData: true };

	var debouncer;

	var observer = new MutationObserver(function(mutations) {
		
		mutations.forEach(function(mutation) {
			
			if(mutation.type == "childList" && mutation.addedNodes.length > 0) {
				
				clearTimeout(debouncer);

				debouncer = setTimeout(function() {
					getComments().forEach(transformNode);
				}, 500);
				
			}
		});    
	});

	function transformNode(node) {
	
		node.querySelectorAll('a[href$=".gif"], a[href$=".jpg"], a[href$=".png"').forEach(function(link) {
			var img = document.createElement('img');
			img.src = link.innerText;
			img.style.display = "block";
			img.style.maxWidth = "100%";
			link.parentNode.replaceChild(img, link);
		});


		node.querySelectorAll('a[href$=".gifv"]').forEach(function(link) {
			var video = document.createElement('video');
			video.src = link.innerText.replace(".gifv", ".mp4");
			video.style.display = "block";
			video.style.maxWidth = "100%";
			video.autoplay = "autoplay";
			video.loop = "loop";
			video.muted = "muted";
			link.parentNode.replaceChild(video, link);
		});

		node.querySelectorAll('a[href*="www.youtube.com/watch?"]').forEach(function(link) {
			var iframe = document.createElement('iframe');
			iframe.src = link.innerText.replace("www.youtube.com/watch?v=", "www.youtube.com/embed/");
			iframe.width = "640";
			iframe.height = "360";
			iframe.frameborder = "0";
			link.parentNode.replaceChild(iframe, link);
		});

	}

	function getComments() {
		return document.querySelectorAll("#comments-container .children span:last-child > div");
	}

	var initInterval = setInterval(function() {
		
		var comments = getComments();

		if(comments.length > 0) {
			clearInterval(initInterval);
			comments.forEach(transformNode);
			observer.observe(document.querySelector('#comments'), config);
		}

	}, 500);
	
};