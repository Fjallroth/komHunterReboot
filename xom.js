const axios = require("axios")
const cheerio = require("cheerio")

const url = "https://www.strava.com/segments/22058575"

function hmsToSecondsOnly(str) {
    let p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

async function getXom(){
    try{
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const leaders = []
        const atags =$('tr').each((i, el) =>{
            const item =$(el).text()
            const items =item.split('\n')
            //console.log(`${i} ${items}`)
            if(items.toString().includes(':')){
            const rank = (items.toString().split(',').slice(1,2).toString())
            const name = (items.toString().split(',').slice(2,3).toString())
            const time = (items.toString().split(',').slice(-2,-1).toString())
            const timeInSeconds = hmsToSecondsOnly(time)
            const contender = [rank, name, timeInSeconds]
            leaders.push(contender)
        }
            
        })
        console.log(leaders)
        console.log(`${leaders[0][1]} is in first place with a time of ${leaders[0][2]} seconds`)

    }
    catch(error){
        console.error(error);
    }
}

getXom()