//////////////////////////////////////////////////////
////   CONTROLLERS   							  ////
//////////////////////////////////////////////////////
mac.controllers.main =  {
	//A js reference to the main tab container dijit
	tabContainerMain : false,
	//Open and view a single revision
	openSingleRevision : function(params) {
		new mac.views.singleRevision(params)
	},
	//Create a new revision
	openNewRevision : function(params) {
		new mac.views.newRevision(params)
	},
	openCompareRevisions : function(params) {
		new mac.views.compareRevisions(params)
	},
	openExperimentDetails : function (params) {
		new mac.views.ExperimentDetails(params);
	},
	//Show the settings
	openSettings : function ()
	{
	    dialog = dijit.byId('dialogSettings')
		dialog.show()
	},
	//Helper function to open a tab
	openTab : function (tabTitle) {
		var tab = new dijit.layout.ContentPane({ title:tabTitle, closable: "true"});
		tabContainerMain.addChild(tab);
		tabContainerMain.selectChild(tab);
		return tab
	},
	
	init : function(parentObject) {
		
		
		//Adjust settings
		mac.settings.localRepository = air.File.documentsDirectory.resolvePath('MacMTMM/repository').nativePath
		
		//Start up pageant to keep our ppk key in memory for putty
		mac.versions.init();
		
		//Refresh the list of experiments
		mac.experiments.refreshExperimentList();
		
		//Initialize global items
		self.tabContainerMain = dijit.byId('tabContainerMain');
		
		//Connect global items
		dojo.connect(dijit.byId('buttonSettingsSubmit'), 'onClick', mac.controllers.main.openSettings);
		
		//Initialize our standard base views
		mac.views.experimentList()
		mac.views.compareBase()
		mac.views.Synchronize()
		
	}
}