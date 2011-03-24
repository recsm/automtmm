//////////////////////////////////////////////////////
////   CONTROLLERS   							  ////
//////////////////////////////////////////////////////
mac.controllers.main =  {
	//A js reference to the main tab container dijit
	tabContainerMain : false,
	//Open and view a single revision
	openSingleRevision : function(params) {
		new mac.views.SingleRevision(params)
	},
	//Create a new revision
	openNewRevision : function(params) {
		new mac.views.NewRevision(params)
	},
	openCompareRevisions : function(params) {
		new mac.views.CompareRevisions(params)
	},
	openExperimentDetail : function (params) {
		new mac.views.ExperimentDetail(params);
	},
	//Show the settings
	openSettings : function ()
	{
	    dialog = dijit.byId('dialogSettings');
		dialog.show();
	},
	//Helper function to open a tab
	openTab : function (tabTitle) {
		var tab = new dijit.layout.ContentPane({ title:tabTitle, closable: "true"});
		tabContainerMain.addChild(tab);
		tabContainerMain.selectChild(tab);
		return tab
	},
	
	onSettingsChanged : function() {
		mac.controllers.main.updateSettingsBasedContent();
	},
	updateSettingsBasedContent : function () {
		dojo.byId('headerUser').innerHTML = mac.settings.userName;
	},
	init : function(parentObject) {
		//Start up pageant to keep our ppk key in memory for putty
		mac.versions.init();
		
		//Refresh the list of experiments
		mac.experiments.refreshExperimentList();
		
		//Initialize global items
		self.tabContainerMain = dijit.byId('tabContainerMain');
		
		//Connect global items
		dojo.connect(dijit.byId('buttonSettingsSubmit'), 'onClick', mac.controllers.main.openSettings);
		
		//Initialize our standard base views
		new mac.views.ExperimentList();
		new mac.views.CompareBase();
		new mac.views.Synchronize();
		new mac.views.Settings();
		
		//Update content based on the settings
		mac.controllers.main.updateSettingsBasedContent();
	}
}