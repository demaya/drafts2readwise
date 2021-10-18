//let selectedBook = selectBook();

const SOURCE_TYPE = 'drafts';    
const BASE_URL = "https://readwise.io/api/v2/";

let selectedText;
if (editor.getSelectedText().length > 0) {
    selectedText = editor.getSelectedText();
} else {
    selectedText = draft.content;
}


let selectedBook = selectBook(getEntriesFromReadwise);
if (selectedBook != "cancelled") {
    postToReadwise(selectedText, selectedBook);
}

function selectBook(data) {

    let actionPrompt = new Prompt();
    actionPrompt.isCancellable = true;


    entries = getEntriesFromReadwise();
    entries.forEach(function(bookTitle) {
        actionPrompt.addButton(bookTitle);
    });

    actionPrompt.addButton("New Book");


    let userSelectedAButton = actionPrompt.show();
    let selectedBook = "userCancelled";

    if (userSelectedAButton) {
        selectedBook = actionPrompt.buttonPressed;
    } else {
        app.displayInfoMessage("Prompt was cancelled.");
        context.cancel();
        return "cancelled";
    }



    if (selectedBook == "New Book") {
        let newBookPrompt = new Prompt();
        newBookPrompt.addTextField("bookName", "New Book", "Name");
        newBookPrompt.addButton("OK");
        let userSelectedAButtonNewBook = newBookPrompt.show();


        if (userSelectedAButtonNewBook) {
            selectedBook = newBookPrompt.fieldValues["bookName"];
        } else {
            app.displayInfoMessage("Prompt was cancelled.");
            context.cancel();
            return "cancelled";
        }
    }
    return selectedBook;
}


function getEntriesFromReadwise() {

    const GET_URL = BASE_URL + "books/?source="+ SOURCE_TYPE +"&page_size=5";

    let credReadwise = Credential.create("Readwise", "Highlight surfacing service.");
    credReadwise.addPasswordField("token", "API Token");
    credReadwise.authorize();

    let httpMain = HTTP.create();
    let respMain = httpMain.request({
        "url": GET_URL,
        "method": "GET",
        "headers": {
            "Authorization": `Token ${credReadwise.getValue("token")}`
        }
    });

    //console.log(respMain.error)

    let entries = [];

    if (respMain.statusCode == 200) {

        let responseText = respMain.responseText;
        //console.log(responseText);
        let responseData = JSON.parse(responseText);
        let bookResults = responseData.results;
        //console.log(responseData);


        bookResults.forEach(function(book) {
            entries.push(book.title);
        });

        entries.push("Quotes")
    } else {
        console.log("Error in getting books")
    }

    return entries;
}


function postToReadwise(selectedText, selectedBook) {
    const POST_URL = BASE_URL + "highlights/";

    let credReadwise = Credential.create("Readwise", "Highlight surfacing service.");
    credReadwise.addPasswordField("token", "API Token");
    credReadwise.authorize();

    if (selectedBook) {
        let httpMain = HTTP.create();
        let respMain = httpMain.request({
            "url": POST_URL,
            "method": "POST",
            "data": {
                "highlights": [{
                    "text": selectedText,
                    "title": selectedBook.toString(),
                    "source_type": SOURCE_TYPE
                }]
            },
            "headers": {
                "Authorization": `Token ${credReadwise.getValue("token")}`
            }
        });

        if (respMain.success) {
            return true;
        } else {
            console.log(`[${respMain.statusCode}] ${respMain.error}`);
            return false;
        }

    } else {
        // Nothing to do

    }
}
