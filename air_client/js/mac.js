//base mac object
var mac = {
	settings : {
		lisrelCommand 		 : 'C:\\lisrel87\\lisrel87.exe',
		gitCommand    		 : 'C:\\msysgit\\msysgit\\bin\\git.exe',
		masterRepository     : 'git@github.com:recsm/MTMMTest.git',
		gitBranchName        : 'tom' 
	},
	utilities : {
		//Helper function to get a dom node from a certain tab using a css query
		getTabNode : function(query, tab) {
			return dojo.query(query, tab.containerNode)[0]
		},
		//Helper function to get a dojo dijit from a certain tab
		getTabDijit : function(query, tab) {
			return dijit.byNode(mac.utilities.getTabNode(query, tab))
		},
		//Shortcut to hide a node
		nodeHide : function(node) {
			dojo.style(node, {"visibility" : "hidden", "position" : "absolute"})
		},
		//Shortcut to show a node
		nodeShow : function(node) {
			dojo.style(node, {"visibility" : "visible", "position" : "static"})
		}
		
	},
	//Parse a template node using mustache and return the parsed contents
	template : function(templateId, params) {
		return Mustache.to_html(dojo.byId(templateId).innerHTML, params)
	},
	models : {},
	views : {},
	controllers : {}
}