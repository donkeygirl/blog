const mongoose=require('mongoose');
const {Schema} = mongoose;
mongoose.set('strictQuery', false);

const postSchema = new Schema({    
    title: {
        type:String,
        unique: true,
        require:true
    },
    content:String
});
const Post = mongoose.model('Post', postSchema);

module.exports=Post;
//module.exports={Post}; this doesn't work