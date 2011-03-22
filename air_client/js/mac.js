//base mac object

var mac = {
   //Parse a template node using mustache and return the parsed contents
   template : function(templateId, params) {
   	  return Mustache.to_html(dojo.byId(templateId).innerHTML, params)
   },
   models : {},
   views : {},
   controllers : {}
}