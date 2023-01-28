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
async function komHunter(segmentid, userid){
        const segment = await Todo.find({userId: userid, segmentId: segmentid })
        if(segment[0].leaderBoard.length >=3){
        //console.log(segmentid)
        //console.log(segment[0].segmentName)
        console.log(segment[0].leaderBoard)
        const xomTime = segment[0].leaderBoard[0].timeInSeconds
        const userTime = segment[0].segmentTime
        const timeOffXom = userTime - xomTime
        const percentageOff = (((timeOffXom) / xomTime)*100).toFixed(1)
        await Todo.findOneAndUpdate({userId:userid, segmentId: segmentid}, {
            xomTime: xomTime,
            timeOffXom: timeOffXom,
            percentageOff:  percentageOff
            })
            let rank = 11;
            for (let i = 0; i < segment[0].leaderBoard.length; i++) {
                if (userTime <= segment[0].leaderBoard[i].timeInSeconds) {
                    rank = segment[0].leaderBoard[i].rank;
                    break;
                }
            }
    
            await Todo.findOneAndUpdate({ userId: userid, segmentId: segmentid }, { rank });
    
            if (rank < 11) {
                console.log("You are on the leaderboard");
            } else if((typeof leaderboard == "undefined")){
                console.log(`problem with leaderboard for ${segmentid}`)
            }
                else{
                const length = leaderboard.length
                const tenthTime = segment[0].leaderBoard[length].timeInSeconds;
                const timeOffTenth = userTime - tenthTime;
                const percentageOffLB = (((timeOffTenth) / tenthTime) * 100).toFixed(1);
                await Todo.findOneAndUpdate({ userId: userid, segmentId: segmentid }, {
                    timeOffLB: timeOffTenth,
                    percentOffLB: percentageOffLB,
                    rank: 11
                });
            }
        }
    }
    async function getXom(segmentid, userid){
        const url = `https://www.strava.com/segments/${segmentid}`
        //console.log(url)
        const retries = 5;
        const delay = 1000;
    
        for (let i = 0; i <= retries; i++) {
            try{
                const response = await axios.get(url);
                const $ = cheerio.load(response.data);
                const leaders = []
                const atags =$('tr').each((i, el) =>{
                    const item =$(el).text()
                    const items =item.split('\n')
                    if(items.toString().includes('W')){
                    const rank = (parseInt(items.toString().split(',').slice(1,2)))
                    const name = (items.toString().split(',').slice(2,3).toString())
                    const time = (items.toString().split(',').slice(-2,-1).toString())
                    const timeInSeconds = hmsToSecondsOnly(time)
                    const contender = {timeInSeconds, rank, name}
                    //console.log(contender)
                    leaders.push(contender)
                }
                })
                if(leaders.length>9){
                await Todo.findOneAndUpdate({userId:userid, segmentId: segmentid}, {
                    leaderBoard: leaders    
                    })
                console.log(leaders)}
                else {
                    console.log(`Not enough leaders, retrying in ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                break;
            }
            catch(error){
                console.error(`Error: ${error} Retrying...`);
                if (i === retries) {
                    console.error("Maximum retries exceeded. Aborting.")
                }
            }
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
        const delay = 100
          const efforts = data.segment_efforts
          //console.log(data)
          if(typeof efforts !== "undefined"){
          for(let i=0; i < efforts.length ; i++){ 
            const todoItems = await Todo.find({userId:userid, segmentId: efforts[i].segment.id })
            const segmentid = efforts[i].segment.id
            if(todoItems.length == 0){
            await Todo.create({
                segmentId: efforts[i].segment.id, 
                segmentName: efforts[i].segment.name, 
                segmentTime: efforts[i].elapsed_time, 
                completed: false, 
                userId: userid})

              await new Promise((resolve) => setTimeout(resolve, delay));
        await getXom(efforts[i].segment.id, userid)
        await komHunter(segmentid, userid)                   
        console.log('Effort has been added!')
        }
            else{
                if(todoItems[0].segmentTime > efforts[i].elapsed_time){
                    const newSegmentTime =  parseInt(efforts[i].elapsed_time)
                    const segmentid = efforts[i].segment.id
                    updatePR(segmentid, newSegmentTime, userid)
                    console.log(`${efforts[i].segment.name} now has a faster time of ${efforts[i].elapsed_time}`)
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    await getXom(efforts[i].segment.id, userid)
                    await komHunter(segmentid, userid)
                    
                    }
                    
                else{
                    console.log(`${efforts[i].segment.id} is already in the user activity list`)
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    await getXom(efforts[i].segment.id, userid)
                    await komHunter(segmentid, userid)
                    continue
                }
                
            } 
            //console.log(todoItems)
          }
    }
else{
    console.log("API rate limit exceeded, come back in an hour and try again")
}}
async function getUserData(userid, userStravaToken){
await fetch(`http://www.strava.com/oauth/token?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}&code=${userStravaToken}&grant_type=authorization_code`, {
method: 'POST',
headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}
})
.then(res => res.json())
.then(data =>{updateUserWithData(data, userid)})
}
module.exports = {
    getTodos: async (req,res)=>{
        console.log(req.user)
        try{
            const todoItems = await Todo.find({userId:req.user.id}).sort({rank: 1})
            const itemsLeft = await Todo.countDocuments({userId:req.user.id,completed: false})
            res.render('todos.ejs', {todos: todoItems, left: itemsLeft, user: req.user})          
        }catch(err){
            console.log(err)
        }
    },
    getlinkpage: async (req,res)=>{
        console.log(req.user)
        try{
            res.render('stravalink.ejs')          
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
    linkStrava: (req, res, next) => {
        if (req.user) {
            console.log(req.session)
            const state = req.sessionID;
            return res.redirect(`http://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code&scope=activity:read_all&state=${state}`)
            }
            console.log(req.sessionID)
          res.redirect('/todos')
        },
      stravaCallback: async (req, res, next) => {
        console.log(req.sessionID)
        try{
            console.log(req.query.code)
            console.log(req.session)
            await User.findOneAndUpdate({_id:req.user.id},{
                userStravaToken: req.query.code
            })
        }
        catch(err){
            console.log(err)
            res.sendStatus(500);
            return;
        } 
        const userid = req.user.id
        const userStravaToken = req.query.code
        getUserData(userid, userStravaToken)
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