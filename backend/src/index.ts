import express from 'express'
import cors from 'cors'
import webUserRoute from './routes/webUser'
import { MongoClient } from 'mongodb'
import { mongoClient } from './modules/mongo'

mongoClient.connect().then(()=>console.log('Connected to MongoDB')).catch(console.error)

const app = express()
app.use(cors())
app.use('/api/web', webUserRoute)
app.listen(8080, () => {
    console.log('App Listening on Port 8080')
})