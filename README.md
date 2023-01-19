# komHunterReboot
A Strava data analysis tool for cyclists looking to improve their performance and compete on Strava leaderboards. Because lots of us love cycling and friendly competition, but not quite enough to pay for Strava premium!

# Features
- Create an account and authorize access to Strava data
- Collects all of the user's activities and segments
- Records the user's completion time for each segment
- Utilizes a web scraper to gather the leaderboard for each segment
- Show how much faster the user need to ride in order to make it into the top 10 or even take first place

# Technologies
- ejs
- nodejs:
    - bcrypt, 
    - connect-mongo, 
    - dotenv, ejs, express, 
    - express-flash, 
    - express-session, 
    - mongodb, 
    - mongoose, 
    - morgan, 
    - nodemon, 
    - passport, 
    - passport-local, 
    - validator
- MongoDB
- css
- cheerio web scraping module (web scraping was used as an alternative to the Strava API as using the API in this case would send too many calls, the Strava API is limited to 100 calls every 15 minutes and users typically have thousands of segments)

# Usage
- Clone the repo
- `git clone https://github.com/Fjallroth/komHunterReboot.git`
- Install dependencies
- Create a .env file with your mongoDB connection string and strava API information
- Run the app
- Use the app by creating an account, log in and authorize access to Strava data
- Note: This is a work in progress, and is not yet ready for production use.

# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

# License
MIT

# Author
Fjallroth