$(document).ready(function () {

	$.getJSON("https://www.catincan.com/catincan-rest/display_features.json?field_open_source_project_target_id=487", function(e) {
		console.log(e);
	});

});