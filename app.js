//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const multer  = require('multer');
const path=require("path");

//const upload = multer({ dest: 'uploads/' });
const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
//app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));
const db=require("./key").MongoURI;
mongoose.connect(db,{useNewUrlParser: true})
  .then(()=>console.log("Mongodb Connected"))
  .catch((err)=>console.log(err));//"mongodb://localhost:27017/blogD", {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);
const postSchema = {
  title: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  image:  String,
};

const Post = mongoose.model("Post", postSchema);
app.get("/",function(req,res){
  res.render("Home");
})

app.get("/messages", function(req, res){

  Post.find({}, function(err, posts){
    res.render("messages", {
      posts: posts
      });
  });
});


app.get("/compose", function(req, res){
  res.render("compose");
});

var Storage = multer.diskStorage({
  destination:"./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now()+path.extname(file.originalname))
  }
});
var upload = multer({
   storage: Storage }).single('file');

app.post("/compose",upload,function(req, res){
  const success=req.file.filename+" uploaded successfully";

  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    image:req.file.filename
  });


  post.save(function(err){
    if (!err){
        res.redirect("/messages");
    }
  });
});

app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
    title: post.title,
      content: post.content,
      image:post.image
    });
  });

});

/*app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});*/

/*app.get("/contact", function(req, res){
  res.render("contact");
});*/
app.get("/videos",function(req,res){
  res.render("videos");
})


app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
