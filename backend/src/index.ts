import express from 'express'
import cors from 'cors'
import webUserRoute from './routes/webUser'
import permissionRoute from './routes/permission'
import usersRoute from './routes/user'
import statsRoute from './routes/stats'
import clansRoute from './routes/clans'
import { mongoClient } from './modules/mongo'
import productsRoute from './routes/product'

mongoClient.connect().then(()=>console.log('Connected to MongoDB')).catch(console.error)

const app = express()
app.use(cors())
app.use('/api/web', webUserRoute)
app.use('/api/permissions', permissionRoute)
app.use('/api/users', usersRoute)
app.use('/api/stats', statsRoute)
app.use('/api/products', productsRoute)
app.use('/api/clans', clansRoute)
app.listen(4000, () => {
    console.log('App Listening on Port 4000')
})