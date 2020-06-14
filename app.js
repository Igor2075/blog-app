var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	expresSanitizer = require("express-sanitizer");

mongoose.connect("mongodb://localhost:27017/blog-app", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now },
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "Test Blog",
// 	image: "https://unsplash.com/photos/yWwob8kwOCk",
// 	body:
// 		"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ratione inventore amet.",
// });

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expresSanitizer());

app.get("/", function (req, res) {
	res.redirect("/blogs");
});

app.get("/blogs", function (req, res) {
	Blog.find({}, function (err, blogs) {
		if (err) {
			console.log(err);
		} else {
			res.render("index", { blogs: blogs });
		}
	});
});

app.get("/blogs/new", function (req, res) {
	res.render("new");
});

app.post("/blogs", function (req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function (err, newBlog) {
		if (err) {
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/:id", function (req, res) {
	Blog.findById(req.params.id, function (err, foundBlog) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("show", { blog: foundBlog });
		}
	});
});

app.get("/blogs/:id/edit", function (req, res) {
	Blog.findById(req.params.id, function (err, foundBlog) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("edit", { blog: foundBlog });
		}
	});
});

app.put("/blogs/:id", function (req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, result) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

app.delete("/blogs/:id", function (req, res) {
	Blog.deleteOne({ _id: req.params.id }, function (err, result) {
		if (err) {
			res.redirect("/blogs/" + req.params.id);
		} else {
			res.redirect("/blogs");
		}
	});
});

process.env.PORT = 5000;
app.listen(process.env.PORT, process.env.IP, function () {
	console.log("The Blog Server has started");
});
