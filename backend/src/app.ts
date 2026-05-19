import express, { Request, Response } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { monitorHandler } from './handlers/monitor'

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

app.get('/api/monitor', monitorHandler)

export default app