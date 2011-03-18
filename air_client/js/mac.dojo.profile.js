 //This is a build profile for dojo
 //In order to build mac.dojo.build.js
 //See http://dojotoolkit.org/reference-guide/build/ for more information
 
 dependencies ={
   action : 'clean,release',
   optimize : 'shrinksafe',
   releaseName : 'mac',
   localeList : 'en-us',	
   layers:  [
       {
       name: "mac.js",
       dependencies: [
           "dijit.layout.LayoutContainer",
           "dijit.layout.TabContainer",
           "dijit.layout.ContentPane",
           "dojo.data.ItemFileWriteStore",
		   "dojox.grid.DataGrid",
		   "dijit.form.Select",
		   "dijit.form.FilteringSelect",
		   "dijit.form.Button",
		   "dijit.form.NumberTextBox",
		   "dijit.form.NumberSpinner",
		   "dijit.form.ValidationTextBox",
		   "dijit.form.SimpleTextArea",
		   "dijit.Dialog",
       ]
       }
   ]
 };