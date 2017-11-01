window.onload = function() {

	var config = { attributes: true, childList: true, subtree: true, characterData: true };

	var commentsContainer = document.getElementById('comments-container');
	var scrollDebouncer;
	var mutationDebouncer;

	window.onscroll = function() {
		clearTimeout(scrollDebouncer);
		scrollDebouncer = setTimeout(checkScrollPosition, 500);
	}

	function checkScrollPosition() {
		if(window.pageYOffset + document.documentElement.clientHeight >= commentsContainer.offsetTop) {
			[].slice.call(document.querySelectorAll('.ice-img')).forEach(function(img) {
				img.src = img.getAttribute('data-src');
				img.classList.remove('ice-img');
			});
			[].slice.call(document.querySelectorAll('.ice-vid')).forEach(function(video) {
				video.play();
				video.classList.remove('ice-vid');
			});
		}
	}

	var observer = new MutationObserver(function(mutations) {
		
		mutations.forEach(function(mutation) {
			
			if(mutation.type == "childList" && mutation.addedNodes.length > 0) {
				
				clearTimeout(mutationDebouncer);

				mutationDebouncer = setTimeout(function() {
					getComments().forEach(transformNode);
					checkScrollPosition();
				}, 500);
				
			}
		});
	});

	function transformNode(node) {
	
		node.querySelectorAll('a[href$=".gif"], a[href$=".jpg"], a[href$=".png"').forEach(function(link) {
			var img = document.createElement('img');
			img.className = 'ice-img';
			img.setAttribute('data-src', link.innerText);
			img.style.display = "block";
			img.style.maxWidth = "100%";
			link.parentNode.replaceChild(img, link);
		});


		node.querySelectorAll('a[href$=".gifv"]').forEach(function(link) {
			var video = document.createElement('video');
			video.className = 'ice-vid';
			video.src = link.innerText.replace(".gifv", ".mp4");
			video.style.display = "block";
			video.style.maxWidth = "100%";
			video.loop = "loop";
			video.muted = "muted";
			link.parentNode.replaceChild(video, link);
		});

		node.querySelectorAll('a[href*="www.youtube.com/watch?"]').forEach(function(link) {
			var iframe = document.createElement('iframe');
			iframe.className = 'ice-el';
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
			checkScrollPosition();
		}

	}, 500);
	
};