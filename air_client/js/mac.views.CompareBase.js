
//Compare View to compare two revisions
mac.views.CompareBase = function() {
  
	
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