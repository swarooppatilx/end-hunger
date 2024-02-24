const { render } = require("ejs");
const express = require("express");
const bodyParser = require('body-parser');
const path = require("path");
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set("views",path.resolve(__dirname,"views"));
app.set("view engine","ejs");

const databaseUrl = process.env.DATABASE_URL;

//Mongo DB
   
mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Step 3: Create a Mongoose model for your posts
const postSchema = new mongoose.Schema({
  title: String,
  image: String,
  location: String,
  description: String
});

const Post = mongoose.model('Post', postSchema);

//End Mongo DB

//Multer File upload

// Set up Multer storage and upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
  },
});

const upload = multer({ storage: storage });
//End multer

app.get('/',(req,res)=>{
    var name = 'swaroop';
    res.render('index', { name });
});

app.get('/find', async (req, res) => {
 //All
  try {
    // Fetch data from MongoDB
    const cards = await Post.find();

    // Render the view with the fetched data
    res.render('find', { cards });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }

});

app.get('/share',(req,res)=>{
    res.render('share');
});
app.post('/share',upload.single('image'), (req,res)=>{
 
    // Save the file path to MongoDB
    const imagePath = 'uploads/' + req.file.filename; // Adjust the path accordingly
 
// Step 4: Use the model to create and save a new post
req.body.image = imagePath;
const newPost = new Post(req.body);

newPost.save()
  .then((savedPost) => {
    res.redirect('/find');
    console.log('Post saved:', savedPost, "Img path", imagePath);
  })
  .catch((error) => {
    console.error('Error saving post:', error);
  });

});
app.get('/farmers',(req,res)=>{
    res.render('farmers');
});

app.use((req,res)=>{
    res.status(404).send("Oops! The requested page was not found")
});
app.listen(8080, ()=>{
    console.log('Server listening on port 8080...')
});