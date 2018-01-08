var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
// Logs route requests
// var logger = require("morgan");

// Schema framework for MongoDB
var mongoose = require("mongoose");
// Initiate html requests from the server.
var axios = require("axios");
// Scrape data from html
var cheerio = require("cheerio");
// Require all models
var db = require("./models");
// process.env.PORT will allow Heroku to pick another.
var PORT = process.env.PORT || 8080;
// Initialize Express
var app = express();

// Configure middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
/*global Promise*/
mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongooseScraper";
mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the echojs website
app.get("/api/scrape", function(req, res) {
    // First, we grab the body of the html with request
    axios.get("http://www.washingtonpost.com/").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        // Grab every div with a class of headline.
        $("div.headline").each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
            result.snippet = $(this)
                .parent()
                .children(".blurb")
                .text();

            // Create a new Article using the `result` object built from scraping
            db.Article
                .create(result)
                .then(function(dbArticle) {

                })
                .catch(function(err) {
                    // If an error occurred, send it to the client
                    res.json(err);
                });
        });
    });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article
        .find({})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/api/articles/:id", function(req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    db.Article
        .findById({ "_id": req.params.id })
        .populate("note")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });

});

// Route for saving an article
app.post("/api/save/:id", function(req, res) {
    let articleID = req.params.id;
    let articleToSave = {};
    db.Article
        .findById(articleID)
        .then(function(dbArticle) {
            console.log(dbArticle);
        });
    // db.Note
    //     .create(req.body)
    //     .then(function(dbNote) {
    //         return db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "note": dbNote._id } }, { new: true });
    //     }).then(function(dbArticle) {
    //         // If the User was updated successfully, send it back to the client
    //         console.log("Updated");
    //         res.json(dbArticle);
    //     })
    //     .catch(function(err) {
    //         // If an error occurs, send it back to the client
    //         res.json(err);
    // });
});

// Route for saving/updating an Article's associated Note
app.post("/api/articles/:id", function(req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    db.Note
        .create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "note": dbNote._id } }, { new: true });
        }).then(function(dbArticle) {
            // If the User was updated successfully, send it back to the client
            console.log("Updated");
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

app.get("/saved", function(req, res) {
    res.render("saved");
});

app.get("/", function(req, res) {
    db.Article
        .find({})
        .then(function(dbArticle) {
            var handlebarsObject = { article: dbArticle };
            res.render("index", handlebarsObject);
        })
        .catch(function(err) {
            res.render("index");
            console.log(err);
        });
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
