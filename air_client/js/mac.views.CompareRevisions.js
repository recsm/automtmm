	
mac.views.CompareRevisions = function (params) {
	
	//Simple objects about the revisions
	var fromRevison, 
	    toRevision, 
		experiment, 
		round, 
		fromParams, 
		toParams, 
		allItems, 
		updateGridStoreLastValue,
		tab,
		compareSourceDiff, 
		gridDiff, 
		selectFilterGroup, 
		selectFilterParameter, 
		spinnerMinDifference;
	
	//This is a helper function to create unique lists with individual stores from allItems
	var setFromUniqueStore = function(uniqueProperty, toFilteredSelect) {
        //Keep a list of unique items     
    	var uniqueItems  = [];
		//Add an empty value as the first item
		var item = {}
		item[uniqueProperty] = '';
    	uniqueItems.push(item);
		//Keep track of what values we have already added in
    	var values = [];
	    for (var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            var value = item[uniqueProperty];
            if (values.indexOf(value) == -1) {
            	values.push(value);
				var newItem = {}
				newItem[uniqueProperty] = value;
            	uniqueItems.push(newItem);
            } 
         }
         var uniqueStore = new dojo.data.ItemFileWriteStore({data:{items:uniqueItems}});
         toFilteredSelect.set('store', uniqueStore);
	}
	
	
	var updateFilter = function () {
		var filterParams = {};
		var group      = selectFilterGroup.get('displayedValue');
		var parameter  = selectFilterParameter.get('displayedValue');	
		if (group != '') 	 filterParams['group_name']  = group;
		if (parameter != '') filterParams['parameter']   = parameter;
		gridDiff.filter(filterParams);
	}
	
	//It would be nice to avoid this function, but I don't know how to filter a grid by greater than
	//Must be possible but hard to find an example so here we always create a new item store
	
	var updateGridStore = function () {
		//Make a sub selection of items to add to the grid, having a difference greater than a certain value 
		var inRangeItems = []
		var minValue  = spinnerMinDifference.get('value')
		if (minValue == updateGridStoreLastValue) return true; //pass if no change
		for (var i in allItems) {
			var item = allItems[i]
			//If 0 show all items
			if(minValue == 0) {
				inRangeItems.push(item);
			}
			else if (item.difference > minValue){
				inRangeItems.push(item);
			}
		}
		var storeInRange = new dojo.data.ItemFileWriteStore({ 
         	data : { items: inRangeItems}
		});
		gridDiff.setStore(storeInRange);
		updateFilter();
		udpateGridStoreLastValue = minValue;
	}
	
	var initGrid = function initGrid() {
		//Calculate the difference between each item
		for (i in allItems) {
		    var difference = Math.abs(allItems[i]['RevisionFrom'] - allItems[i]['RevisionTo']);
			if (allItems[i]['RevisionFrom'] == allItems[i]['RevisionTo'] * -1) {
				difference = 0;
			}
			else {
				difference = Math.ceil(difference * 1000) / 1000;
			}
			allItems[i]['difference'] = difference;
		}
		updateGridStore();
	}
	
	//Init all of the grid filters
	var initFilters = function() {
		dojo.connect(spinnerMinDifference,  'onClick',   updateGridStore);
		dojo.connect(spinnerMinDifference,  'onChange',  updateGridStore);
		dojo.connect(spinnerMinDifference,  'onKeyDown', updateGridStore);
		dojo.connect(selectFilterGroup, 	'onChange',  updateFilter);
		dojo.connect(selectFilterParameter, 'onChange',  updateFilter);
		
		//Assign the datastores to the different widgets
		setFromUniqueStore('group_name', selectFilterGroup);
		setFromUniqueStore('parameter', selectFilterParameter);
	}
	
	
	var setUpParamStore = function () {
		allItems = [];
		var found;
		
		for (var i in fromParams) {
			allItems.push ({
				group_name	 : fromParams[i].group_name,
				parameter 	 : fromParams[i].parameter,
				RevisionFrom : Math.round(fromParams[i].value_std * 1000) / 1000,
				RevisionTo    : 10 //Just to notice quickly if a value is missing
			});
		}
		
		
		for (var i in toParams) {
			found = false;
			for (var j in allItems) {
				if ((allItems[j].group_name  == toParams[i].group_name) &&
					(allItems[j].parameter == toParams[i].parameter) 
				) {
					allItems[j].RevisionTo = Math.round(toParams[i].value_std * 1000) / 1000;
					found = true;
					break;
				}
			}
			if (!found) {
				allItems.push ({
				group_name 	 : toParams[i].group_name,
				parameter 	 : toParams[i].parameter,
				RevisionFrom : 10,
				RevisionTo    : Math.round(toParams[i].value_std * 1000) / 1000 //Just to notice quickly if a value is missing
			});
			}
		}
		
		initFilters();
		initGrid();
		
	}
	
	//Get the param files for to and from
	var getParameterFiles = function() {
		mac.experiments.getExperimentFileRevision(round, experiment, 'OUT.JSON', fromRevision.commitHash, function (data) {
			fromParams = dojo.fromJson(data);
			mac.experiments.getExperimentFileRevision(round, experiment, 'OUT.JSON', toRevision.commitHash, function (data) {
				toParams = dojo.fromJson(data);
				setUpParamStore();
			});
		});
	}
	
	
	var loadFileDiff = function () {
		mac.experiments.getExperimentFileDiff(round, experiment, 'INPUT.LS8', fromRevision.commitHash, toRevision.commitHash, function(data){
			compareSourceDiff.innerHTML =  mac.versions.diffToHtml(data);
		});
	}
	
	var setUpView = function() {
		var tabTitle = 'Round ' + round + ' ' + experiment + ' (compare)';
		tab = mac.controllers.main.openTab(tabTitle)
		
		//Create a context for the template
		var context = {}
		context.fromRevisionAuthor = fromRevision.authorName;
		context.fromRevisionDate   = mac.experiments.formatDate(fromRevision.authorDate);
		context.fromRevisionHash   = fromRevision.shortCommitHash;
		context.toRevisionAuthor   = toRevision.authorName;
		context.toRevisionDate     = mac.experiments.formatDate(toRevision.authorDate);
		context.toRevisionHash     = toRevision.shortCommitHash;
		context.round              = round;
		context.experiment         = experiment;
		
		tab.set('content', mac.template('templateCompareRevisions', context));
		gridDiff 			  = mac.utilities.getTabDijit(".gridDiff", tab)
		selectFilterGroup     = mac.utilities.getTabDijit(".selectFilterGroup", tab)
		selectFilterParameter = mac.utilities.getTabDijit(".selectFilterParameter", tab)
		spinnerMinDifference  = mac.utilities.getTabDijit(".spinnerMinDifference", tab);
		compareSourceDiff     = mac.utilities.getTabNode(".compareSourceDiff ", tab);
		loadFileDiff();
	}
	
	var init = function() {
		//There are a series of function calls from one to the other in this view.
		//init() - > setUpView() -------->loadFileDiff()
		//  |------> getParamaterFiles() --->setUpParamStore() -----> initGrid() ---->updateGridStore()-->updateFilter()
		//                                     |--------------------> initFilters() ---> setFromUniqueStore()
		
		//Get the actual records from the commit hashes
		mac.models.Revision.fetchItemByIdentity({identity: params.fromRevision, onItem: function (item) {
			fromRevision = mac.models.Revision.itemToObject(item);
			mac.models.Revision.fetchItemByIdentity({identity: params.toRevision, onItem: function (item) {
				toRevision = mac.models.Revision.itemToObject(item);
				experiment = toRevision.experiment;
				round      = toRevision.round;
				setUpView();
				getParameterFiles();
			}});
		}});
	}
	init();
}
