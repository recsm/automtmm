	
mac.views.CompareRevisions = function (params) {
	
	var tabTitle = 'experiment_2 (' + params.fromRevision + ' vs ' + params.toRevision + ')'
	var tab = mac.controllers.main.openTab(tabTitle)
	tab.set('content', mac.template('templateCompareRevisions', params))
	
	var gridDiff 			  = mac.utilities.getTabDijit(".gridDiff", tab)
	var selectFilterCountry   = mac.utilities.getTabDijit(".selectFilterCountry", tab)
	var selectFilterGroup     = mac.utilities.getTabDijit(".selectFilterGroup", tab)
	var selectFilterParamater = mac.utilities.getTabDijit(".selectFilterParamater", tab)
	var spinnerMinDifference  = mac.utilities.getTabDijit(".spinnerMinDifference", tab)
	
	
	 //This is a helper function to create unique lists with individual stores
	var setFromUniqueStore = function(fromStore, uniqueProperty, toFilteredSelect) {
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
	
	var allItems =  [
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
	    var difference = Math.abs(allItems[i]['RevisionFrom'] - allItems[i]['RevisionTo'])
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
	
	var updateFilter = function () {
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
	var updateGridStoreLastValue = null
	var updateGridStore = function() {
		//Make a sub selection of items to add to the grid, having a difference greater than a certain value 
		var inRangeItems = []
		var minValue  = spinnerMinDifference.get('value')
		if (minValue == updateGridStoreLastValue) return true; //pass if no change
		for (var i in allItems) {
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
