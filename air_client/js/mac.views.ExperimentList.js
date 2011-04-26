

//Experiment List View (Home)
mac.views.ExperimentList = function () {
    var gridExperiments			 		= false
    var inputNewRevisionRound 	    	= false
    var inputNewRevisionExperiment  	= false
    var selectedRowValues              	= {}
    var buttonNewRevisionSubmit			= false
    var buttonViewRevisionSubmit		= false
    var panelCurrentExperimentInfo    	= false
    
    var updateRowBasedInfo =  function() {
		try {
			dijit.byId('buttonViewExperimentSubmit').destroy()
		} catch(e) {}
    	inputNewRevisionRound.set('value', selectedRowValues.round);
    	inputNewRevisionExperiment.set('value', selectedRowValues.name)
    	panelCurrentExperimentInfo.innerHTML = mac.template('templateExperimentListTopInfo', selectedRowValues)
		dojo.parser.parse(panelCurrentExperimentInfo);
		buttonViewExperimentSubmit   = dijit.byId('buttonViewExperimentSubmit');
		dojo.connect(buttonViewExperimentSubmit , 'onClick', openViewExperiment);
    }
    
    var onGridRowSelected = function() {
    	var selectedRow = gridExperiments.selection.getFirstSelected();
		selectedRowValues.round = mac.models.Experiment.getValue(selectedRow, 'round');
		selectedRowValues.name = mac.models.Experiment.getValue(selectedRow, 'name');
		updateRowBasedInfo();
	}
	
	var openViewExperiment = function() {
		onGridRowSelected();
		//console.log(selectedRowValues);
		mac.controllers.main.openExperimentDetail({round : selectedRowValues.round, experiment : selectedRowValues.name})
	}
	
	var openNewRevision = function() {
		var experiment 	= inputNewRevisionExperiment.get('value');
		var round 		= inputNewRevisionRound.get('value');
		
		if(experiment == '' || round == '') {
			alert('Please enter both a round and experiment');
		} else if(!inputNewRevisionExperiment.isValid(false) || !inputNewRevisionRound.isValid(false)) {
			alert('Please check the experiment and rounf to make sure the values are valid.');
		} else {
			mac.controllers.main.openNewRevision({round: round, experiment: experiment, fromInfoText : ''});
		}
	}
	
	var init = function () {
		gridExperiments 		     = dijit.byId('gridExperiments')
		inputNewRevisionRound 		 = dijit.byId('inputNewRevisionRound')
		inputNewRevisionExperiment 	 = dijit.byId('inputNewRevisionExperiment')
		buttonNewRevisionSubmit      = dijit.byId('buttonNewRevisionSubmit')
		panelCurrentExperimentInfo   = dojo.query('#viewExperimentList .panelCurrentExperimentInfo')[0]
		gridExperiments.setStore(mac.models.Experiment)  //Set the data store for the grid
		gridExperiments.selection.addToSelection(0)      //Select our 
		dojo.connect(gridExperiments, 'onSelected',    onGridRowSelected);
		dojo.connect(gridExperiments, 'onRowDblClick', openViewExperiment);
		
		dojo.connect(buttonNewRevisionSubmit , 'onClick', openNewRevision)
		selectedRow = gridExperiments.selection.getFirstSelected()
	}
	init();
}

