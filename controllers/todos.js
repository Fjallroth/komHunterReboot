const Todo = require('../models/Todo')
const User = require('../models/User')
require('dotenv').config({path: './config/.env'})
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID 
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET 
const callbackURL = 'http://127.0.0.1:2121/todos/StravaCallback'

async function updateUserWithData(data, userid){
    await User.findOneAndUpdate({_id:userid}, {
    userStravaAccount: data.athlete.id, 
    userStravaAccess: data.access_token, 
    userStravaFirstName: data.athlete.firstname,
    userStravaLastName: data.athlete.lastname,
    userStravaRefresh: data.refresh_token,
    userStravaPic: data.athlete.profile,
    usertokenExpire: data.expires_at,
    userSex: data.athlete.sex
  },{
    new: true})
     
}
async function listActivities(data, userid){
     const userprofile = await User.findOne({_id:userid})
     console.log(userprofile)
     const activitylist = userprofile.userActivitylist
    for(let i=0; i < data.length; i++){
        if(activitylist.includes(data[i].id) == false){
        await User.findOneAndUpdate({_id:userid},
            { $push: { userActivitylist: data[i].id  } },
  function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log(success);
        }
        })
        console.log(data[i].id)
    }
    else{
        console.log(`${data[i].id} is already in the user activity list`)
        continue
    } 
}}
module.exports = {
    getTodos: async (req,res)=>{
        console.log(req.user)
        try{
            const todoItems = await Todo.find({userId:req.user.id})
            const itemsLeft = await Todo.countDocuments({userId:req.user.id,completed: false})
            res.render('todos.ejs', {todos: todoItems, left: itemsLeft, user: req.user})
        }catch(err){
            console.log(err)
        }
    },
    createTodo: async (req, res)=>{
        try{
            await Todo.create({todo: req.body.todoItem, completed: false, userId: req.user.id})
            console.log('Todo has been added!')
            res.redirect('/todos')
        }catch(err){
            console.log(err)
        }
    },
    markComplete: async (req, res)=>{
        try{
            await Todo.findOneAndUpdate({_id:req.body.todoIdFromJSFile},{
                completed: true
            })
            console.log('Marked Complete')
            res.json('Marked Complete')
        }catch(err){
            console.log(err)
        }
    },
    markIncomplete: async (req, res)=>{
        try{
            await Todo.findOneAndUpdate({_id:req.body.todoIdFromJSFile},{
                completed: false
            })
            console.log('Marked Incomplete')
            res.json('Marked Incomplete')
        }catch(err){
            console.log(err)
        }
    },
    deleteTodo: async (req, res)=>{
        console.log(req.body.todoIdFromJSFile)
        try{
            await Todo.findOneAndDelete({_id:req.body.todoIdFromJSFile})
            console.log('Deleted Todo')
            res.json('Deleted It')
        }catch(err){
            console.log(err)
        }
    },
    linkStrava: (req, res) => {
        if (req.user) {
          return res.redirect(`https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code&scope=activity:read_all`)
        }
        res.render('signup', {
          title: 'Create Account'
        })
      },
      stravaCallback: async (req, res, next) => {
        try{
            console.log(req.query.code)
            await User.findOneAndUpdate({_id:req.user.id},{
                userStravaToken: req.query.code
            })
        }
        catch(err){
            console.log(err)
        } 
        res.redirect('/todos/getUserData') 
    },       
    getUserData: async (req , res) => {
        const userid = req.user.id
    await fetch(`https://www.strava.com/oauth/token?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}&code=${req.user.userStravaToken}&grant_type=authorization_code`, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    })
    .then(res => res.json())
    .then(data =>{updateUserWithData(data, userid)})
    res.redirect('/todos')
    },
    getActivities: async (req, res) =>{
        const userid = req.user.id
    await fetch(`https://www.strava.com/api/v3/athlete/activities?access_token=${req.user.userStravaAccess}`)
    .then(res => res.json())
    .then(data=> listActivities(data, userid) )
    res.redirect('/todos')
    }
}