const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());
const userModel = require("./models/user");

app.get('/',(req,res) => {   
res.render('index');
});

app.post('/create', async (req,res)=> {
    let{username,email,password,age}  = req.body;
    
    try {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);
        
        let createdUser = await userModel.create({
            username,
            email,
            password: hash,
            age
        });
        
        let token = jwt.sign({email},'secret');
        res.cookie("token",token);
        res.send(createdUser);
    }
    catch(err) {
        console.log("Error:", err);
        res.send("Something went wrong");
    }
});

app.get("/login" , (req,res) => {
    res.render('login');
});

app.post("/login" ,async (req,res) => {
   let user =  await userModel.findOne({email: req.body.email});
   if(!user) return res.send("Something went wrong");

   try {
    let result = await bcrypt.compare(req.body.password, user.password);
    
    if(result){
      let token = jwt.sign({email: user.email},'secret');
      res.cookie("token",token); 
      res.send("yes! you can login");
    }
    else res.send("Something went wrong");
   }
   catch(err) {
    console.log("Error:", err);
    res.send("Something went wrong");
   }
});

app.get("/logout", (req,res) => {
    res.cookie("token", "");
    res.redirect("/");
});

app.listen(3000);