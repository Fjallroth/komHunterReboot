const Todo = require('../models/Todo')
const User = require('../models/User')
require('dotenv').config({path: './config/.env'})
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID 
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET 
const callbackURL = 'http://127.0.0.1:2121/todos/StravaCallback'
const axios = require("axios")
const cheerio = require("cheerio")

function hmsToSecondsOnly(str) {
    let p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}
async function leaderBoard(segmentid, userid){
        const segment = await Todo.find({userId: userid, segmentId: segmentid })
        const xomTime = segment[0].leaderBoard[0].timeInSeconds
        const userTime = segment[0].segmentTime
        const timeOffXom = userTime - xomTime
        const percentageOff = (((timeOffXom) / xomTime)*100).toFixed(1)
        if(userTime == xomTime){
            console.log("You have the KOM")
        }
        else if(userTime <= segment[0].leaderBoard[1].timeInSeconds){
            console.log(`You are rank ${segment[0].leaderBoard[1].rank} on the leaderboard`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        else if(userTime <= segment[0].leaderBoard[2].timeInSeconds){
            console.log(`You are rank ${segment[0].leaderBoard[2].rank} on the leaderboard`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        else if(userTime <= segment[0].leaderBoard[3].timeInSeconds){
            console.log(`You are rank ${segment[0].leaderBoard[3].rank} on the leaderboard`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        else if(userTime <= segment[0].leaderBoard[4].timeInSeconds){
            console.log(`You are rank ${segment[0].leaderBoard[4].rank} on the leaderboard`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        else if(userTime <= segment[0].leaderBoard[5].timeInSeconds){
            console.log(`You are rank ${segment[0].leaderBoard[5].rank} on the leaderboard`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        else if(userTime <= segment[0].leaderBoard[6].timeInSeconds){
            console.log(`You are rank ${segment[0].leaderBoard[6].rank} on the leaderboard`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        else if(userTime <= segment[0].leaderBoard[7].timeInSeconds){
            console.log(`You are rank ${segment[0].leaderBoard[7].rank} on the leaderboard`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        else if(userTime <= segment[0].leaderBoard[8].timeInSeconds){
            console.log(`You are rank ${segment[0].leaderBoard[8].rank} on the leaderboard`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        else if(userTime <= segment[0].leaderBoard[9].timeInSeconds){
            console.log(`You are rank ${segment[0].leaderBoard[9].rank} on the leaderboard`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        else{
            const tenthTime = segment[0].leaderBoard[9].timeInSeconds
            const timeOffTenth = userTime - tenthTime
            const percentageOffLB = (((timeOffTenth) / tenthTime)*100).toFixed(1)
            console.log(`You need to ride ${timeOffTenth} seconds faster to get on the leaderboard, that's ${percentageOffLB}% faster`)
            console.log(`You need to ride ${timeOffXom} seconds faster to have the fastest time, that's ${percentageOff}% faster`)
        }
        console.log(xomTime)
        console.log(userTime)
        console.log(timeOffXom)
        console.log(percentageOff)
}


async function timeOffXom(segmentid, userid){
    const segment = await Todo.find({userId:userid, segmentId: segmentid })
    const xomTime = segment[0].leaderBoard[0].timeInSeconds
    const userTime = segment[0].segmentTime
    const timeOffXom = userTime - xomTime
    const percentageOff = (((timeOffXom) / userTime)*100).toFixed(1)
    await Todo.findOneAndUpdate({userId:userid, segmentId: segmentid}, {
        timeOff: timeOffXom   
        })
}
async function getXom(segmentid, userid){
    const url = `https://www.strava.com/segments/${segmentid}`
    try{
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const leaders = []
        const atags =$('tr').each((i, el) =>{
            const item =$(el).text()
            const items =item.split('\n')
            if(items.toString().includes(':')){
            const rank = (parseInt(items.toString().split(',').slice(1,2)))
            const name = (items.toString().split(',').slice(2,3).toString())
            const time = (items.toString().split(',').slice(-2,-1).toString())
            const timeInSeconds = hmsToSecondsOnly(time)
            const contender = {timeInSeconds, rank, name}
            leaders.push(contender)
        }
            
        })
        await Todo.findOneAndUpdate({userId:userid, segmentId: segmentid}, {
            leaderBoard: leaders    
            })
        console.log(leaders)
    }
    catch(error){
        console.error(error);
    }
}
async function updatePR(segmentid, newSegmentTime, userid){
    await Todo.findOneAndUpdate({userId:userid, segmentId: segmentid}, {
    segmentTime: newSegmentTime    
    })
}
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
                { $push: { userActivitylist: data[i].id  } })
            console.log(data[i].id)
    }
        else{
         console.log(`${data[i].id} is already in the user activity list`)
         continue
    } 
}}
async function getActivitySegments(data, userid){
          const efforts = data.segment_efforts
          console.log(data)
          for(let i=0; i < efforts.length ; i++){ 
            const todoItems = await Todo.find({userId:userid, segmentId: efforts[i].segment.id })
            if(todoItems.length == 0){
            await Todo.create({
                segmentId: efforts[i].segment.id, 
                segmentName: efforts[i].segment.name, 
                segmentTime: efforts[i].elapsed_time, 
                completed: false, 
                userId: userid})
                getXom(efforts[i].segment.id, userid)
                timeOffXom(efforts[i].segment.id, userid)
                console.log('Effort has been added!')
        }
            else{
                if(todoItems[0].segmentTime > efforts[i].elapsed_time){
                    const newSegmentTime =  parseInt(efforts[i].elapsed_time)
                    const segmentid = efforts[i].segment.id
                    updatePR(segmentid, newSegmentTime, userid)
                    console.log(`${efforts[i].segment.name} now has a faster time of ${efforts[i].elapsed_time}`)
                    getXom(efforts[i].segment.id, userid)
                    timeOffXom(efforts[i].segment.id, userid)
                    }
                    
                else{
                    console.log(`${efforts[i].segment.id} is already in the user activity list`)
                    getXom(efforts[i].segment.id, userid)
                    timeOffXom(efforts[i].segment.id, userid)
                    continue
                }
                
            } 
            console.log(todoItems)
          }
}
module.exports = {
    getTodos: async (req,res)=>{
        console.log(req.user)
        try{
            const todoItems = await Todo.find({userId:req.user.id})
            const itemsLeft = await Todo.countDocuments({userId:req.user.id,completed: false})
            res.render('todos.ejs', {todos: todoItems, left: itemsLeft, user: req.user})
            leaderBoard("6911346", req.user.id)
            leaderBoard("29006402", req.user.id)
            
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
    },
    getSegments: async (req, res) =>{
        const userid = req.user.id
        const userActivityList = req.user.userActivitylist
        userActivityList.forEach(element => { 
           fetch(`https://www.strava.com/api/v3/activities/${element}?access_token=${req.user.userStravaAccess}`)
           .then(res => res.json())
           .then(data=> getActivitySegments(data, userid) ) 
        })
        res.redirect('/todos')          
    }
}