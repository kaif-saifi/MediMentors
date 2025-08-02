const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
const port = 2000
const app = express();
require('dotenv').config();


const session = require('express-session');

app.use(session({
    // secret: 'mongodb://localhost:27017/',
    // secret: 'mongodb+srv://KaifSaifi:KaifClusterOne@cluster0.8mk2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    secret:process.env.MONGO_URI,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false}
}));


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}
app.use(express.static(path.join(__dirname,'/public/')))
app.use(express.static(path.join(__dirname, 'public')));

// app.use(bodyParser.urlencoded({ extended: false }))
// mongoose.connect('mongodb://localhost:27017/SignUp', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// app.use(bodyParser.urlencoded({ extended: false }))
// mongoose.connect('mongodb+srv://KaifSaifi:KaifClusterOne@cluster0.8mk2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/SignUp', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
app.use(bodyParser.urlencoded({ extended: false }))
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const db = mongoose.connection
db.once('open', () => {
    console.log("connected to mongoose")
})
db.on('error', (error) => {
    console.error("MongoDB connection error:", error);
});
const userSchema = new mongoose.Schema({
    fname: String,
    femail: String,
    fpassword:String
    
});
const users = mongoose.model("data", userSchema)
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/Signup.html'))
    // res.sendFile(path.join(__dirname,'/public/images/MediMentors.jpg'))

    console.log("Listning.....")
})



app.post('/submit', async (req, res) => {
    console.log(req.body);
    const { fname, femail,fpassword } = req.body
    const user = new users({
        fname,
        femail,
        fpassword
    })
    await user.save()
    console.log(user)
    res.send("Successfully submited")
    // const home = document.createElement('a')
    // const btn = document.getElementById('Sumbit')
    // home.href='/public/home.html'
    // home.appendChild(btn)
})





// login page 

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'))
   

    console.log("Listning.....")
})
app.get('/Signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/Signup.html'))
   
    

    
})
// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ femail: email });

//     if (user && user.fpassword === password) {
//         req.session.user = user;
//         res.json({ success: true, name: user.fname, email: user.femail });
//     } else {
//         res.json({ success: false, message: "Invalid credentials" });
//     }
// });
// app.get("/home", isLoggedIn, function (req, res) {
//     res.render("home");
// });
// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) return next();
//     res.redirect("/login");
// }


//handling login

app.post('/login',async(req,res)=>{
    try{
const user = await users.findOne({fname : req.body.fname})
if(user){
    const result = req.body.fpassword===user.fpassword
    if (result) {
        req.session.user = user;
        res.sendFile(path.join(__dirname,'/public/home.html'));
      } else {
        res.status(400).json({ error: "password doesn't match" });
      }
    } else {
      res.status(400).json({ error: "User doesn't exist" });
    }}catch (error) {
        res.status(400).json({ error });
      }
})
// Home page route
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/home.html'));
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }
    res.redirect('home', { user: req.session.user }); 
});
app.get('/start', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/Entries.html'))
   

   
})
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/home.html'))
   

   
})


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});
app.listen(port,()=>{
    console.log(`App is listnig at http://localhost:${port}/`)
})