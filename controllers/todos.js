const Todo = require('../models/Todo')
const User = require('../models/User')
require('dotenv').config({path: './config/.env'})
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID 
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET 
const callbackURL = 'http://127.0.0.1:2121/todos/StravaCallback'

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
                    UserStravaToken: req.query.code
                })
                console.log('Token added to user')
                res.redirect('/todos')
            }catch(err){
                console.log(err)
            }
        }
}
        //passport.authenticate('strava', { failureRedirect: '/auth/strava' }),
          //console.log(req.query)
          //console.log(req.query.code)
        //   req.post(
        //     `https://www.strava.com/oauth/token?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}&code=${req.query.code}&grant_type=authorization_code`,
        //     { json: { key: 'value' } },
        //     async function (error, response, body) {
        //         if (!error && response.statusCode == 200) {
        //             console.log(body);
                    
        //         }//problem here with user.id not being available
//                 await User.findOneAndUpdate({userId:req.user.id}, {
//                   userStravaAccount: response.body.athlete.id, 
//                   userStravaToken: response.body.access_token, 
//                   userStravaFirstName: response.body.athlete.firstname,
//                   userStravaLastName: response.body.athlete.lastname,
//                   userStravaRefresh: response.body.refresh_token,
//                   userStravaPic: response.body.athlete.profile
//                 },{
//                   new: true
//                 });
//             }
//         );
      
//         res.redirect('/todos');

//         }