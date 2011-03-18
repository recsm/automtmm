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
	loadAllExperiments : function loadAllExperiments() {
		mac.models.Branches.fetch({onComplete: function(items, request) {
			for (var i in items) {
				console.log(items[i])
			}
		}});
	},
	loadBranchExperiments : function loadBranchExperiments(branch, onComplete) {
		var processListener = new mac.BasicAirListener('git ls-tree');
		processListener.onOutputData = function (event) {
		    var process = processListener.process;
            var data = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable);
            parsedList = mac.versions.parseBranchFileList(data)
            processListener.log(mac.models.Branches)
            for (var i in parsedList) {
            	mac.models.Branches.newItem(parsedList[i]);
            }
            if (typeof(onComplete) != 'undefined') {
        		onComplete();
        	}
        }
        mac.versions.getBranchList(processListener);
	},
	loadBranches : function loadBranches(onComplete) {
		var processListener = new mac.BasicAirListener('git branch');
		processListener.onOutputData = function (event) {
		    var process = processListener.process;
            var data = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable);
            parsedList = mac.versions.parseBranchList(data)
            processListener.log(mac.models.Branches)
            for (var i in parsedList) {
            	mac.models.Branches.newItem(parsedList[i]);
            }
            if (typeof(onComplete) != 'undefined') {
        		onComplete();
        	}
        }
		      
		mac.versions.getBranchList(processListener);
	},
	refreshExperimentList : function refreshExperimentList() {
		mac.controllers.main.loadBranches(function () {
			mac.controllers.main.loadAllExperiments();
		})
	},
	init : function(parentObject) {
		//Adjust settings
		mac.settings.localRepository = air.File.documentsDirectory.resolvePath('MacMTMM/repository').nativePath
		
		//Start up pageant to keep our ppk key in memory for putty
		mac.versions.init()
		
		mac.controllers.main.refreshExperimentList();
		
		//Initialize global items
		self.tabContainerMain = dijit.byId('tabContainerMain')
		
		//Connect global items
		dojo.connect(dijit.byId('buttonSettingsSubmit'), 'onClick', mac.controllers.main.openSettings)
		
		//Initialize our standard base views
		mac.views.revisionList()
		mac.views.compareBase()
		mac.views.Synchronize()
		
	}
}