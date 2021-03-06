/* global bootbox */
$(document).ready(function() {
    // Setting a reference to the article-container div where all the dynamic content will go
    // Adding event listeners to any dynamically generated "save article"
    // and "scrape new article" buttons
    //   var articleContainer = $(".article-container");
    $(document).on("click", ".save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);
    $(document).on("click", ".delete", handleArticleDelete);
    $(document).on("click", ".notes", handleArticleNotes);
    $(document).on("click", ".save-note", handleNoteSave);
    $(document).on("click", ".note-delete", handleNoteDelete);
    // $(document).on("click", ".btn.delete", handleArticleDelete);
    // Once the page is ready, run the initPage function to kick things off
    //   initPage();

    // Save an article
    function handleArticleSave() {
        let articleToSave = $(this).attr("data-target");
        bootbox.alert(`<p> Saving article :  ${articleToSave} </p>`);
        $.post(`/api/save/${articleToSave}`);
    }

    function handleArticleScrape() {
        // This function handles the user clicking any "scrape new article" buttons
        // Call scrape route, present modal, then reload.
        $.get("/api/scrape").then(function(data) {
            bootbox.alert("<h3 class='text-center m-top-80'> Articles scraped <h3>", function() { location.reload() });
            console.log("Scraped");
        });
    }

    function handleArticleDelete() {
        let articleToDelete = $(this).attr("data-target");
        // $.delete(`/api/delete/${articleToDelete}`);

        $.ajax({
            method: "DELETE",
            url: "/api/delete",
            data: { id: articleToDelete }
        }).then(function(data) {
            bootbox.alert(`<p> Deleting article :  ${articleToDelete} </p>`, function() { location.reload() });
        });
    }

    function handleArticleNotes(notes) {
        // This function handles opending the notes modal and displaying our notes
        // We grab the id of the article to get notes for from the panel element the delete button sits inside
        var currentArticle = $(this).attr("data-target");
        // Grab any notes with this headline/article id
        $.get("/api/notes/" + currentArticle).then(function(data) {
            // Constructing our initial HTML to add to the notes modal
            var modalText = [
                "<div class='container-fluid text-center'>",
                "<h4>Notes For Article: ",
                currentArticle,
                "</h4>",
                "<hr />",
                "<ul class='list-group note-container'>",
                "</ul>",
                "<textarea class='note-field' placeholder='New Note' rows='4' cols='60'></textarea>",
                `<button class='btn btn-success save-note' data-dismiss="modal" data-target=${currentArticle}>Save Note</button>`,
                "</div>"
            ].join("");
            // Adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });

            data.forEach(function(datum) {
                $(".note-container").append(`<li class="list-group-item note">${datum.body}<button class="btn btn-danger note-delete" data-article=${currentArticle} data-note=${datum.id} data-dismiss="modal">x</button></li>`);
            });
        });
    }

    // Save the note.
    function handleNoteSave() {
        let text = $(".note-field").val().trim();
        let thisId = $(this).attr("data-target");
        $.ajax({
            method: "POST",
            url: "/api/articles/" + thisId,
            data: { body: text }
        }).then(function(data) {
            bootbox.alert(`<p> Notes updated </p>`, function() {});
        });
    }

    function handleNoteDelete() {
        let noteId = $(this).attr("data-note");
        let articleId = $(this).attr("data-article");
        $.ajax({
            method: "DELETE",
            url: "/api/notes/",
            data: { noteId: noteId, articleId: articleId }
        }).then(function(data) {
            bootbox.alert(`<p> Note deleted </p>`, function() {});
        });
    }
});
