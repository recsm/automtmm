
mac.views.SingleRevision = function(params) {		
	var tabTitle = params.experiment + ' (' + params.revision + ')'
	tab = mac.controllers.main.openTab(tabTitle)
	tab.set('content', 'loading round ' + params.round + ' experiment ' + params.experiment + ' revision ' + params.revision + '...')
}	