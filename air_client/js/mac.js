//base mac object
var mac = {
	settings : {
		lisrelCommand 		 : 'C:\\lisrel87\\lisrel87.exe',
		gitCommand    		 : 'C:\\msysgit\\msysgit\\bin\\git.exe',
		masterRepository     : 'git@github.com:recsm/MTMMTest.git',
		gitBranchName        : 'tom' 
	},
	//Parse a template node using mustache and return the parsed contents
	template : function(templateId, params) {
		return Mustache.to_html(dojo.byId(templateId).innerHTML, params)
	},
	models : {},
	views : {},
	controllers : {}
}