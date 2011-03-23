
mac.views.Settings = function(params) {		
	 var dialog = dijit.byId('dialogSettings');
	 var settingsSubmit;
	 
	 var setInitialContent = function () {
	 	 var content = '';
		 for (var prop in mac.settings) {
		 	content += '<p style="height:27px;width:550px;clear:left;margin:1px;padding:0px;"><label style="width:170px;float:left;" for="' + prop + '">' + prop + '</label>'; 
			content += '<input class="settingsInput" dojoType="dijit.form.TextBox" name="' + prop + '" style="width:360px;" value="' + mac.settings[prop] + '"></p>';
		 }
		 content += '<div style="text-align:right;"><button id="settingsSubmit" dojoType="dijit.form.Button" >Update</button></div>';
		 dialog.set('content', content);
	 }
	 
	 
	 var updateValuesToSettings = function() {
	 	dojo.query('.settingsInput').forEach(function (input) {
			mac.settings[input.name] = input.value;
		})
		mac.settingsManager.save();
	 }
	 
	 var init = function init() {
	 	setInitialContent();
		settingsSubmit = dijit.byId('settingsSubmit');
		dojo.connect(settingsSubmit, 'onClick', updateValuesToSettings);
		dojo.connect(settingsSubmit, 'onClick', function () {
			dialog.hide();
		});
	 }
	 init();
}	