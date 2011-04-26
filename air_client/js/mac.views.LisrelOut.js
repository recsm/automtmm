
//A helper view to see output from lisrel when there is an error

mac.views.LisrelOut = function(params) {
	var tabTitle = 'Round ' + params.round + ' ' + params.experiment + ' (OUT)';
	var tab = mac.controllers.main.openTab(tabTitle)
	tab.set('content',  mac.template('lisrelOut', params))
	
	var searchInput	 		    = mac.utilities.getTabDijit(".searchInput", tab);
	var searchButton		    = mac.utilities.getTabDijit(".searchButton", tab);
	var lisrelOut 				= mac.utilities.getTabDijit('.lisrelOutput', tab);
	
	//Try to find the next text being searched for
	var findNext = function() {
		var searchText = searchInput.get('value').toLowerCase();
		var inputText = lisrelOut.getValue().toLowerCase();
		
		start = lisrelOut.containerNode.selectionStart;
		if (!start || start == '0') start = 0;
		
		nextIndex = inputText.indexOf(searchText, start + searchText.length);
		
		if(nextIndex == -1) {
			nextIndex = inputText.indexOf(searchText, 0);
		}
		
		if(nextIndex != -1) {
			lines 		= inputText.split("\n").length - 1;
			totalHeight = lisrelOut.containerNode.scrollHeight;
			lineHeight  = totalHeight / lines;
			beforePart  = inputText.substr(0, nextIndex);
			beforeLines = beforePart.split("\n").length - 1;
			dijit.selectInputText(lisrelOut.containerNode, nextIndex, nextIndex+searchText.length);
			lisrelOut.focus()
			lisrelOut.containerNode.scrollTop = Math.round((lineHeight * beforeLines) - 60)
		}
		else
		{
			alert ('The search text "' + searchText + '" could not be found');
		}
	}
	
	dojo.connect(lisrelOut, 'onKeyDown', function(e) {
		dojo.stopEvent(e);
	});
	
	dojo.connect(searchButton, 'onClick', findNext);

}