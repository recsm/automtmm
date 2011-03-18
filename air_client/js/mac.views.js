//////////////////////////////////////////////////////
////   VIEWS         							  ////
//////////////////////////////////////////////////////

//New Revision View
mac.views.newRevision = function(params) {

	var ls8AirFile
	
	var experiment = params.experiment
	var round      = params.round

	var tabTitle 	=  experiment + ' (new)' 
	var tab   = mac.controllers.main.openTab(tabTitle)
	tab.set('content', mac.template('templateNewRevision', params))
	
	var buttonNewRevisionRun 	= mac.utilities.getTabDijit(".buttonNewRevisionRun", tab)
	var inputNewRevisionModel 	= mac.utilities.getTabDijit(".inputNewRevisionModel", tab)
	var nodeNewRevisionCompose 	= mac.utilities.getTabNode(".newRevisionCompose", tab)
	var nodeNewRevisionReview 	= mac.utilities.getTabNode(".newRevisionReview", tab)
	var nodeProcessLog 			= mac.utilities.getTabNode(".processLog", tab)
	
	logProgress = function(progress) {
		nodeProcessLog.innerHTML += progress
	}
	
	var setLisrelResult = function setLisrelResult(exitCode) {
		//An output file has been created 
		if (exitCode == 0) {
			//Open up the output file, and check for errors
			//If we find E_R_R_O_R then we alert the user and show the output
			var OUT = mac.experiments.getExperimentFileContents(round, experiment, 'OUT')
			if (OUT.indexOf('E_R_R_O_R') == -1) {
				//Success
				//If the output is ok, then we process it in python to extract the dataset we need						
				logProgress('Input ran with success committing changes<br>');
				var processListener = new mac.BasicAirListener('git add')
				processListener.onExit = function (event) {
					if(event.exitCode == 0) {
					    var commitListener = new mac.BasicAirListener('git commit')
						mac.versions.commit('Testing..... replace this message with some notes?', commitListener)
					}
				}
				var directory = mac.experiments.getExperimentDirectory(round, experiment)
				mac.versions.addDirectory(directory, processListener)
			}
			else {
				logProgress('Lisrel reported an error in the input.')
			}
		}
		else {
			logProgress('There was an error running lisrel exit code (' + exitCode +')<br>');
		}
	}
	
	var processModel = function processModel() {
		mac.utilities.nodeHide(nodeNewRevisionCompose)
	    mac.utilities.nodeShow(nodeNewRevisionReview)
	   
	    var modelContent = inputNewRevisionModel.get('value')
	    
		ls8AirFile = mac.lisrel.saveModelToFile(round, experiment, modelContent)
		logProgress("Input saved as " + ls8AirFile.nativePath + '<br>');
		
		var processListener = new mac.BasicAirListener('lisrel')
		processListener.setListener('onExit', function(event) 
		{ 
		    setLisrelResult(event.exitCode)
		});
		
        mac.lisrel.runModel(ls8AirFile.nativePath, processListener)
        logProgress("Running input in lisrel <br>")
	}
	
	mac.utilities.nodeHide(nodeNewRevisionReview)
	dojo.connect(buttonNewRevisionRun, 'onClick', processModel)
}

mac.views.Synchronize = function() {

	var cloneButton = dijit.byId('buttonCloneSubmit')
	var syncButton = dijit.byId('buttonSyncSubmit')
	
	onCloneButtonClick = function() {
	
		 var processListener = new mac.BasicAirListener('git clone')
         processListener.setListener('onExit',  function (event) {
            //Call the branch function after the clone has finished
            mac.versions.branchRepository(mac.settings.gitBranchName);
         });
	
		mac.versions.cloneRepository(processListener)
	}
	
	onSyncButtonClick = function() {
		var processListener = new mac.BasicAirListener('git push')
		mac.versions.push(processListener)
	}
	
	var init = function() {
		dojo.connect(cloneButton, 'onClick', onCloneButtonClick)
		dojo.connect(syncButton, 'onClick', onSyncButtonClick)
	}
	init()
}

mac.views.singleRevision = function(params) {		
	var tabTitle = params.experiment + ' (' + params.revision + ')'
	tab = mac.controllers.main.openTab(tabTitle)
	tab.set('content', 'loading round ' + params.round + ' experiment ' + params.experiment + ' revsion ' + params.revision + '...')
}	

//Experiment List View (Home)
mac.views.experimentList = function () {
    var gridExperiments			 		= false
    var inputNewRevisionRound 	    	= false
    var inputNewRevisionExperiment  	= false
    var selectedRow                 	= false
    var buttonNewRevisionSubmit			= false
    var buttonViewRevisionSubmit		= false
    var panelCurrentExperimentInfo    	= false
    
    var updateRowBasedInfo =  function() {
		try {
			dijit.byId('buttonViewExperimentSubmit').destroy()
		} catch(e) {}
    	inputNewRevisionRound.set('value', selectedRow.round)
    	inputNewRevisionExperiment.set('value', selectedRow.name)
    	panelCurrentExperimentInfo.innerHTML = mac.template('templateExperimentListTopInfo', selectedRow)
		dojo.parser.parse(panelCurrentExperimentInfo);
		buttonViewExperimentSubmit   = dijit.byId('buttonViewExperimentSubmit');
		dojo.connect(buttonViewExperimentSubmit , 'onClick', openViewExperiment);
    }
    
    var onGridRowSelected = function() {
    	selectedRow = gridExperiments.selection.getFirstSelected()
		updateRowBasedInfo()
	}
	
	var openViewExperiment = function() {
		//Todo - rewrite in order to get experiment details
		selectedRow = gridExperiments.selection.getFirstSelected()
		mac.controllers.main.openExperimentDetails({round : selectedRow.round, experiment : selectedRow.name})
	}
	
	var openNewRevision = function() {
		var experiment 	= inputNewRevisionExperiment.get('value')
		var round 		= inputNewRevisionRound.get('value')
		mac.controllers.main.openNewRevision({round: round, experiment: experiment})
	}
	
	init = function () {
		gridExperiments 		     = dijit.byId('gridExperiments')
		inputNewRevisionRound 		 = dijit.byId('inputNewRevisionRound')
		inputNewRevisionExperiment 	 = dijit.byId('inputNewRevisionExperiment')
		buttonNewRevisionSubmit      = dijit.byId('buttonNewRevisionSubmit')
		panelCurrentExperimentInfo   = dojo.query('#viewExperimentList .panelCurrentExperimentInfo')[0]
		gridExperiments.setStore(mac.models.Experiment)  //Set the data store for the grid
		gridExperiments.selection.addToSelection(0)      //Select our 
		dojo.connect(gridExperiments, 'onSelected',    onGridRowSelected)
		dojo.connect(gridExperiments, 'onRowDblClick', openViewExperiment)
		
		dojo.connect(buttonNewRevisionSubmit , 'onClick', openNewRevision)
		selectedRow = gridExperiments.selection.getFirstSelected()
	}
	init()
}

//Get a list of revisions for a single round / experiment
mac.views.ExperimentDetails = function(params){
	var experiment = params.experiment;
	var round = params.round;
	tabTitle = ' round ' + round + ' ' + experiment;
	tab = mac.controllers.main.openTab(tabTitle)
	tab.set('content', mac.template('experimentDetails', params))
}

//Compare View to compare two revisions
mac.views.compareBase = function() {
   //This is a helper function to create unique lists with individual stores
	setFromUniqueStore = function(fromStore, uniqueProperty, toFilteredSelect) {
       //Fetch the data from the orig store.
        fromStore.fetch({
            onComplete: function (items, request) {
            	var uniqueItems  = []
            	//Add an empty value as the first item
            	var allItem = {}
            	allItem[uniqueProperty] = ''
            	uniqueItems.push(allItem)
            	var values = []
            	var items  = items
        	    for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var value = fromStore.getValue(item, uniqueProperty)
                    if (values.indexOf(value) == -1) {
                    	values.push(value)
                    	var newItem = {}
                    	newItem[uniqueProperty] = value
                    	uniqueItems.push(newItem)
                    } 
                 }
                 var uniqueStore = new dojo.data.ItemFileWriteStore({data:{items:uniqueItems}});
                 toFilteredSelect.set('store', uniqueStore)
            }  ,
            //Callback for if the lookup fails.
            onError:  function fetchFailed(error, request) {
	                console.log("getUniqueList lookup failed");
	            }
        });
	}
	
	onCompareSubmit = function() {
		mac.controllers.main.openCompareRevisions(
			{fromRevision : 61,
		  	 toRevision   : 62}
		)
	}
	
	init = function() {
		buttonCompareSubmit         = dijit.byId('buttonCompareSubmit')
		dojo.connect(buttonCompareSubmit , 'onClick', onCompareSubmit)
	}
	init()
}
	
mac.views.compareRevisions = function (params) {
	
	tabTitle = 'experiment_2 (' + params.fromRevision + ' vs ' + params.toRevision + ')'
	tab = mac.controllers.main.openTab(tabTitle)
	tab.set('content', mac.template('templateCompareRevisions', params))
	
	gridDiff 			  = mac.utilities.getTabDijit(".gridDiff", tab)
	selectFilterCountry   = mac.utilities.getTabDijit(".selectFilterCountry", tab)
	selectFilterGroup     = mac.utilities.getTabDijit(".selectFilterGroup", tab)
	selectFilterParamater = mac.utilities.getTabDijit(".selectFilterParamater", tab)
	spinnerMinDifference  = mac.utilities.getTabDijit(".spinnerMinDifference", tab)
	
	allItems =  [
	    { country: 'Ireland', group:'group_1', paramater: 'sd1', RevisionFrom : 0.20, RevisionTo: 0.98},
		{ country: 'France',  group:'group_1', paramater: 'sd2', RevisionFrom : 0.10, RevisionTo: 0.76},
		{ country: 'France',  group:'group_1', paramater: 'sd1', RevisionFrom : 0.30, RevisionTo: 0.34},
		{ country: 'England',  group:'group_12', paramater: 'sd3', RevisionFrom : 0.10, RevisionTo: 0.45},
		{ country: 'England',  group:'group_1', paramater: 'sd1', RevisionFrom : 0.10, RevisionTo: 0.87},
		{ country: 'England',  group:'group_2', paramater: 'sd2', RevisionFrom : 0.10, RevisionTo: 0.28},
		{ country: 'England',  group:'group_2', paramater: 'sd3', RevisionFrom : 0.60, RevisionTo: 0.56},
		{ country: 'England',  group:'group_1', paramater: 'sd4', RevisionFrom : 0.18, RevisionTo: 0.29},
		{ country: 'France',  group:'group_2', paramater: 'sd1', RevisionFrom : 0.14, RevisionTo: 0.28},
		{ country: 'France',  group:'group_1', paramater: 'sd2', RevisionFrom : 0.12, RevisionTo: 0.42},
		{ country: 'Never Never Land',  group:'group_1', paramater: 'sd3', RevisionFrom : 0.90, RevisionTo: 0.13},
		{ country: 'Never Never Land',  group:'group_2', paramater: 'sd4', RevisionFrom : 0.80, RevisionTo: 0.33},
		{ country: 'Never Never Land',  group:'group_1', paramater: 'sd1', RevisionFrom : 0.70, RevisionTo: 0.23},
		{ country: 'Never Never Land',  group:'group_2', paramater: 'sd5', RevisionFrom : 0.10, RevisionTo: 0.43},
		{ country: 'Never Never Land',  group:'group_1', paramater: 'sd3', RevisionFrom : 0.50, RevisionTo: 0.23},
		{ country: 'Never Never Land',  group:'group_2', paramater: 'sd1', RevisionFrom : 0.40, RevisionTo: 0.63},
		{ country: 'France',  group:'group_3', paramater: 'sd2', RevisionFrom : 0.20, RevisionTo: 0.43},
		{ country: 'France',  group:'group_1', paramater: 'sd1', RevisionFrom : 0.10, RevisionTo: 0.23},
		{ country: 'Somalia',  group:'group_2', paramater: 'sd3', RevisionFrom : 0.30, RevisionTo: 0.63},
		{ country: 'Somalia',  group:'group_2', paramater: 'sd1', RevisionFrom : 0.10, RevisionTo: 0.23},
		{ country: 'Somalia',  group:'group_3', paramater: 'sd2', RevisionFrom : 0.40, RevisionTo: 0.53},
		{ country: 'Germany', group:'group_2', paramater: 'sd4', RevisionFrom : 0.13, RevisionTo: 0.15}
	]
	
	//Calculate the difference between each item
	for (i in allItems) {
	    difference = Math.abs(allItems[i]['RevisionFrom'] - allItems[i]['RevisionTo'])
	    difference = Math.ceil(difference * 100) / 100
		allItems[i]['difference'] = difference
	}
	
	var storeAll = new dojo.data.ItemFileWriteStore({ 
     data : { items: allItems}
	});
	
	//Assign the datastores to the different widgets
	setFromUniqueStore(storeAll, 'country',   		selectFilterCountry)
	setFromUniqueStore(storeAll, 'group',     		selectFilterGroup)
	setFromUniqueStore(storeAll, 'paramater', 		selectFilterParamater)
	
	updateFilter = function () {
		filterParams = {}
		country    = selectFilterCountry.get('displayedValue')
		group      = selectFilterGroup.get('displayedValue')
		paramater  = selectFilterParamater.get('displayedValue')	
		if (country != '')   filterParams['country'] 	 = country
		if (group != '') 	 filterParams['group'] 		 = group
		if (paramater != '') filterParams['paramater']   = paramater
		gridDiff.filter(filterParams)
	}
	
	//It would be nice to avoid this function, but I don't know how to filter a grid by greater than
	//Must be possible but hard to find an example so here we always create a new item store
	updateGridStoreLastValue = null
	updateGridStore = function() {
		//Make a sub selection of items to add to the grid, having a difference greater than a certain value 
		inRangeItems = []
		minValue  = spinnerMinDifference.get('value')
		if (minValue == updateGridStoreLastValue) return true; //pass if no change
		for (i in allItems) {
			item = allItems[i]
			if (item.difference > minValue){
				inRangeItems.push(item)
			}
		}
		var storeInRange = new dojo.data.ItemFileWriteStore({ 
         	data : { items: inRangeItems}
		});
		gridDiff.setStore(storeInRange)
		updateFilter()
		udpateGridStoreLastValue = minValue
	}
	
	updateGridStore()
	dojo.connect(spinnerMinDifference,  'onClick',   updateGridStore)
	dojo.connect(spinnerMinDifference,  'onChange',  updateGridStore)
	dojo.connect(spinnerMinDifference,  'onKeyDown', updateGridStore)
	dojo.connect(selectFilterCountry,   'onChange',  updateFilter)
	dojo.connect(selectFilterGroup, 	'onChange',  updateFilter)
	dojo.connect(selectFilterParamater, 'onChange',  updateFilter)
}
