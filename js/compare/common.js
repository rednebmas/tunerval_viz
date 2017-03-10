var findClosestDat = function (mouse, xKey, yKey, xScale, yScale) {
	var mouseX = mouse[0];
	var mouseY = mouse[1];

	var closestDat = data[0][0];
	var closestDistance = 9007199254740991;

	for (var k = data.length - 1; k >= 0; k--) {
		var subDataSet = data[k];
		for (var i = subDataSet.length - 1; i >= 0; i--) {
			var datX = xScale(subDataSet[i][xKey]);
			var datY = yScale(subDataSet[i][yKey]);

			var dx = mouseX - datX;
			var dy = mouseY - datY;
			var distance = Math.sqrt(dx ** 2 + dy ** 2);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestDat = subDataSet[i];
			}
		}
	}

	return closestDat;
}