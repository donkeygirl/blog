const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const PORT = 3000;
const mongoose_url = 'mongodb://127.0.0.1:27017/bolgDB';
const Post = require('./dbModel.js');
const { findByIdAndUpdate } = require("./dbModel.js");
//require('dotenv').config();

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', false);

useMongoose().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on port "+PORT);
  })
}).catch(err => (console.log(err)));
async function useMongoose(){
  //await mongoose.connect(process.env.DB_URL, {useNewUrlParser: true});  
  //app.use('/', listRoute);
  const conn = mongoose.connect(mongoose_url, {useNewUrlParser: true});  
  //conn.on("error", console.error.bind(console, "MongoDB connection error"));  

  app.get("/", function(req, res){    
    try{
      let listOfCollections = Object.keys(mongoose.connection.collections);      
      if(listOfCollections[0]==='posts'){        
        Post.find({},function(err,allPosts){
          if(err){
            console.log(err);
          }else{
            if (allPosts.length>0) {
              res.render('home',{startingContent: homeStartingContent,posts:allPosts}); 
            }else{
              const emptyPost = [];
              res.render('home',{startingContent: homeStartingContent,posts:emptyPost});
            }
          }          
        });
      }else{
        const Post = mongoose.model('Post', postSchema);
      }        
    }catch{e=>console.log(e.message)}     
  });

  app.get("/about", function(req, res){
    res.render("about", {aboutContent: aboutContent});
  });

  app.get("/contact", function(req, res){
    res.render("contact", {contactContent: contactContent});
  });

  app.get("/compose", function(req, res){
    res.render("compose");
  });

  app.post("/compose", function(req, res){ 
    const nTitle= req.body.postTitle;
    const nContent=req.body.postBody;
    if(nContent.length>0 && nTitle.length>0){
      const nPost = new Post ({
      title:nTitle,
      content:nContent    
      });
      nPost.save(()=> res.redirect("/"));
    }
  });



  app.get("/posts/:postId", function(req, res){
    const requestedId = req.params.postId.trim();
    try{
      Post.findById({_id:requestedId},function(err,foundPost){
        if(err){
          foundPost = {title:"not found",content:""};
          console.log(err);
        }else{
          res.render('post',{post:foundPost});
        }
      });
    }catch{e=>console.log(e.message)}    
  });

  app.post('/posts/deleteOrUpdate',(req, res)=>{
    let requiredID = req.body.postID.toString();
    //requiredID = Buffer.from(requiredID, 'utf8').toString('hex');
    if(req.body.deleteBtn==='confirmDelete'){      
      Post.findByIdAndDelete({_id:requiredID},function(err, leftPost){
        if(err){
          console.log(err.message);
        }else{
          res.redirect('/');
        }        
      });
    }
    if(req.body.updateBtn==='blogUpdate'){          
      try{        
        Post.findById({_id:requiredID},function(err,foundPost){          
          if(err){
            foundPost = {title:"not found",content:""};
            console.log(err);
          }else{
            //console.log('updateblog');
            res.render('edit',{post:foundPost});
          }
        });
      }catch{e=>console.log(e.message)}
    }
  });

  app.post("/edit", function(req, res){
    const uID =  req.body.postID.toString();
    const uTitle= req.body.postTitle;
    const uContent=req.body.postBody;    
    Post.findByIdAndUpdate(uID,{title:uTitle,content:uContent},function(err, updatedBlog){
      if(err){
        console.log(err.message);
      }else{        
        Post.find({},function(err,allPosts){         
          res.render('home',{startingContent: homeStartingContent,posts:allPosts});               
        });
      }     
    });
  });


}