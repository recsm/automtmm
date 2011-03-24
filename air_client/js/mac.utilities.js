mac.utilities = {
	//Helper function to get a dom node from a certain tab using a css query
	getTabNode : function(query, tab) {
		return dojo.query(query, tab.containerNode)[0]
	},
	//Helper function to get a dojo dijit from a certain tab
	getTabDijit : function(query, tab) {
		return dijit.byNode(mac.utilities.getTabNode(query, tab))
	},
	//Helper function to get a dom node from a certain tab using a css query
	getViewNode : function(query, dojoParentWidget) {
		return dojo.query(query, dojoParentWidget.containerNode)[0]
	},
	//Helper function to get a dojo dijit from a certain tab
	getViewDijit : function(query, dojoParentWidget) {
		return dijit.byNode(mac.utilities.getViewNode(query, dojoParentWidget))
	},
	//Shortcut to hide a node
	nodeHide : function(node) {
		dojo.style(node, {"visibility" : "hidden", "position" : "absolute"})
	},
	//Shortcut to show a node
	nodeShow : function(node) {
		dojo.style(node, {"visibility" : "visible", "position" : "static"})
	}
}