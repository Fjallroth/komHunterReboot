const express = require('express')
const router = express.Router()
const todosController = require('../controllers/todos') 
const { ensureAuth } = require('../middleware/auth')

router.get('/', ensureAuth, todosController.getTodos)

router.post('/createTodo', todosController.createTodo)

router.put('/markComplete', todosController.markComplete)

router.put('/markIncomplete', todosController.markIncomplete)

router.delete('/deleteTodo', todosController.deleteTodo)

router.get('/linkStrava', ensureAuth, todosController.linkStrava)

router.get('/StravaCallback', ensureAuth, todosController.stravaCallback)

router.get('/getlink', ensureAuth, todosController.getlinkpage)

router.get('/getActivities', ensureAuth, todosController.getActivities)

router.get('/getSegments', ensureAuth, todosController.getSegments)

router.get('/sortTimeOff', ensureAuth, todosController.getsortTimeOff)

router.get('/sortSegments', ensureAuth, todosController.getsortSegment)



module.exports = router