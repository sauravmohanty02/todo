
const express= require("express");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
// const encrypt= require("mongoose-encryption");
// require('dotenv').config();
// const md5= require("md5");
const session= require('express-session');
const passport = require("passport");
const passportLocalMongoose= require('passport-local-mongoose');

const app= express();

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));

app.set('view engine','ejs');

app.use(session(
    {
        secret: "thisissecret",
        resave: false,
        saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);
var res= "mongodb+srv://admin-saurav:test123@cluster0.c173uac.mongodb.net/userdb";

mongoose.connect(res, { useNewUrlParser: true });

// mongoose.set("useCreateIndex",true);

const itemsSchema={
    name:String,
    usr: Object
};

const userSchema= new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User= new mongoose.model("User",userSchema);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/",function(req,res)
{
    res.render("home");
});

app.get("/login",function(req,res)
{
    res.render("login");
});

app.get("/register",function(req,res)
{
    res.render("register");
});



const Item= mongoose.model("item",itemsSchema);

// const User= mongoose.model("User",userSchema);

// const item1= new Item(
//     {
//         name: "Welcome to your todolist"
//     });

// const item2= new Item(
//         {
//             name: "+ button"
//         });

// const item3= new Item(
//      {
//             name: "-- button"
//         });

// const defaultitems=[item1,item2,item3];


app.get("/todo",function(req,res)
{
    if(req.isAuthenticated())
    {
        console.log(req.username);

        Item.find({usr: u},function(err, founditems)
        {
            // if(founditems.length===0)
            // {
            //     Item.insertMany(defaultitems,function(err)
            //     {
            //         if(err)
            //         {
            //             console.log(err);
            //         }
            //         else
            //         {
            //             console.log("Success");
            //         }
            //     });
            // }
            // else
            // {
            //res.render("list",{nwlst:founditems});
            // }

            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render("list",{nwlst:founditems});
            }
        });
    }
    else
    {
        res.redirect("/login");
    }
    

    
});

app.listen(process.env.PORT || 3000,function()
{
    console.log("server is on");
});


app.post("/register",function(req,res)
{
    // const newUser= new User(
    //     {
    //         email: req.body.username,
    //         password: md5(req.body.password)
    //     });
    
    // newUser.save(function(err)
    // {
    //     if(err)
    //     {
    //         console.log(err);
    //     }
    //     else
    //     {
    //         nam= ""+req.body.username;
    //         res.redirect("/todo");
    //     }
    // });

    User.register(
        {username: req.body.username}, req.body.password, function(err,user)
        {
            if(err)
            {
                console.log(err);
                res.redirect("/register");
            }
            else
            {
                passport.authenticate("local")(req,res,function()
                {

                    res.redirect("/todo");
                });
            }
        })
});

app.get("/logout",function(req,res)
{
    req.logout(function(err) 
    {
        if (err) 
        { 
            return next(err); 
        }
    })

    res.redirect('/');
})

var u;
app.post("/login",function(req,res)
{
    // const  username= req.body.username;
    // const password= md5(req.body.password);
    
    // User.findOne({email:username},function(err,found)
    // {
    //     if(err)
    //     {
    //         console.log(err);
    //     }
    //     else
    //     {
    //         if(found)
    //         {
    //             if(found.password=== password)
    //             {
    //                 nam= ""+req.body.username;
    //                 res.redirect("/todo");
    //             }
    //         }
    //     }
    // });

    const user= new User(
        {
            username: req.body.username,
            password: req.body.password
        });
    
    req.login(user,function(err)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            passport.authenticate("local")(req,res,function()
            {
                u= req.body.username;
                res.redirect("/todo");
            })
        }
    })
});

app.post("/todo",function(req,res)
{
    var itm= req.body.newitem;
    const item= new Item(
    {
        name: itm,
        usr: u
    });

    item.save();

    res.redirect("/todo");
    // console.log(itm);
});

app.post("/delete",function(req,res)
{
    const chkid= req.body.checkbox;

    Item.findByIdAndRemove(chkid,function(err)
    {
        if(!err)
        {
            console.log("deleted checked item");
            res.redirect("/todo");
        }
    })
}); 