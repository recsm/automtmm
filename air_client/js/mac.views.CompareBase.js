
//Compare View to compare two revisions
mac.views.CompareBase = function() {
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
	
	var onCompareSubmit = function() {
		mac.controllers.main.openCompareRevisions(
			{fromRevision : 61,
		  	 toRevision   : 62}
		)
	}
	
	var init = function() {
		buttonCompareSubmit         = dijit.byId('buttonCompareSubmit')
		dojo.connect(buttonCompareSubmit , 'onClick', onCompareSubmit)
	}
	init()
}