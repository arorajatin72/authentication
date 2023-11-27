import path from "path"; //handling paths
import bcrypt from "bcrypt"; //password hashing
import express from "express"; // web-app framework
import jwt from "jsonwebtoken" // user authentication
import mongoose from "mongoose"; // object modeling
import { urlencoded } from "express";
import cookieParser from "cookie-parser";

mongoose.connect("mongodb://localhost:27017",{dbName: "fullstack"}).then(()=>console.log("Database Connected")) // Database connection

//Defining MongoDB Schemas and Models
const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
})

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
})

const Message = mongoose.model("Message",messageSchema)
const User = mongoose.model("User", userSchema);

// Setting up express application
const app = express();


app.use(express.static(path.join(path.resolve(), "public")))
app.use(urlencoded({ extended: true }))
app.use(cookieParser());

app.set("view engine", "ejs")

//Authentication Middleware
const isAuthenticated = async (req,res,next)=>{
    // Extract the "token" cookie from the request
    const {token} = req.cookies;

    // Check if the "token" cookie exists
    if (token) {

       const decoded = jwt.verify(token,"sfmsmsldlksdmn")
        req.user = await User.findById(decoded._id)
        next();
    } else {
        // Redirect to the login page or any other desired destination
        res.redirect("/");
    }
}


app.get("/",(req,res)=>{
    res.render("login");
});
app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/contact", isAuthenticated, (req, res) => {
    if (req.user) {
        console.log(req.user);
        res.render("index");
    } else {
        // Redirect to the login page if not authenticated
        res.redirect("/");
    }
    
});
app.get("/thanks", isAuthenticated, (req,res)=>{
    res.render("thankyou")
})

app.post("/login",async (req,res)=>{
    const {username, password} = req.body

    let user = await User.findOne({username});

    if(!user){
        return res.redirect("/register")
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        console.log("Incorrect Password")
        return res.render("login")
    }

    const token = jwt.sign({_id: user._id}, "sfmsmsldlksdmn");
    
    res.cookie("token", token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    })
    res.redirect("/contact")

});

app.post("/logout", (req, res) => {
    res.clearCookie("token");
    
    res.redirect("/");
});


app.post("/register",async (req,res)=>{
    const {username, password} = req.body

    let user = await User.findOne({username});

    if(user){
       return res.redirect("/")
    }
    const hashedPassword = await bcrypt.hash(password,10)
    user =  await User.create({
        username: username,
        password: hashedPassword,
        });
    
    const token = jwt.sign({_id: user._id}, "sfmsmsldlksdmn");
    
    res.cookie("token", token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    })
    res.redirect("/contact")
});


app.post("/submit-form",async (req,res)=>{
    const {name, email, message} = req.body
      await Message.create({
        name: name,
        email: email,
        message: message,});
    res.redirect("/thanks")
});














app.listen(5000, () => {
    console.log("Server is listening at port:5000")
})
