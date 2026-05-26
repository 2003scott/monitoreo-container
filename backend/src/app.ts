import express, { Request, Response } from 'express'
import morgan from 'morgan'
import cors from 'cors'

import { monitorHandler, historialHandler } from './handlers/monitor'
import { containerActionHandler } from './handlers/container' 
import { databaseSnapshotHandler } from './handlers/database'

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cors({
    credentials: true,
    origin: "*"
}))

app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Service monitor is running!' })
})

app.get('/api/v1/monitor', monitorHandler)

app.get('/api/v1/historial', historialHandler)

app.get('/api/v1/databases', databaseSnapshotHandler)

app.post('/api/v1/containers/:name/:action', containerActionHandler)

export default app