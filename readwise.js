function postToReadwise(p_strText)
{
	const BASEURL = "https://readwise.io/api/v2/highlights/";
	
	let credReadwise = Credential.create("Readwise", "Highlight surfacing service.");
	credReadwise.addPasswordField("token", "API Token");
	credReadwise.authorize();

	let httpMain = HTTP.create();
	let respMain = httpMain.request(
	{
		"url" : BASEURL,
		"method" : "POST",
		"data": 
		{
			"highlights" : [{"text" : p_strText}]
		},
		"headers" :
		{
			"Authorization" : `Token ${credReadwise.getValue("token")}`
		}
	});

	if (respMain.success) return true;
	else
	{
		console.log(`[${respMain.statusCode}] ${respMain.error}`);
		return false;
	}
}

if (editor.getSelectedText().length > 0) postToReadwise(editor.getSelectedText());
else postToReadwise(draft.content);