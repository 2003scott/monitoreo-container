import express, { Request, Response } from 'express'
import morgan from 'morgan'
import cors from 'cors'

// 1. CAMBIO AQUÍ: Agregamos historialHandler a la importación
import { monitorHandler, historialHandler } from './handlers/monitor'
import { containerActionHandler } from './handlers/container' 

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

// Ruta original
app.get('/api/v1/monitor', monitorHandler)

// 2. CAMBIO AQUÍ: Definimos la nueva ruta para ver el historial JSON
app.get('/api/v1/historial', historialHandler)

// Ruta para controlar los contenedores
app.post('/api/v1/containers/:name/:action', containerActionHandler)

export default app