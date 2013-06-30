$(document).ready(function () {

	var $main = $("section#main");
	
	$.getJSON("https://www.catincan.com/catincan-rest/display_features.json?field_open_source_project_target_id=487", function(data) {
		
		$main.empty().hide();

		$.each(data, function (i, item) {

			var $catincan = $('<div class="catincan-item" />');
			$main.append($catincan);

			var $catincanItem = $('<div class="inner" />');
			$catincan.append($catincanItem);

			var url = ('https://www.catincan.com/proposal/' + item['Open source project'] + '/' + item['node_title']).replace(/\s+/g, '-').toLowerCase();

			$catincanItem.append('<h2><a href="' + url + '" target="_blank">' + item.node_title + '</a></h2>');
			
			var $body = $('<div class="body" />');
			$catincanItem.append($body);

			$body.append(item.Body);

			var $stats = $('<div class="stats" />');
			$catincanItem.append($stats);

			$stats.append('<div class="meter"><div style="width: ' + (item['% of funds raised']) + '%"></div></div>');

			var $greyBoxes = $('<div class="grey-boxes cf" />');
			$stats.append($greyBoxes);

			$greyBoxes.append('<div class="grey-box-item">' +
				'<span class="grey-box-title">' + item['% of funds raised'] + '%</span>' +
				'<span class="grey-box-content">Funded</span>' +
				'</div>');

			$greyBoxes.append('<div class="grey-box-item">' +
				'<span class="grey-box-title">' + item['Amount raised'] + '</span>' +
				'<span class="grey-box-content">Pledged</span>' +
				'</div>');

			$greyBoxes.append('<div class="grey-box-item">' +
				'<span class="grey-box-title">' + item['Days left'] + '</span>' +
				'<span class="grey-box-content">Days left</span>' +
				'</div>');

			console.log(item);
		});

		$main.fadeIn();

	}, function () {
		$main.innerHTML('<p>Failed to get feed :(</p>');
	});
	

});