import express from 'express'
import cors from 'cors' //importa los paquetes cors --permisos de accesos
import { fileURLToPath } from 'url'
import clientesRoutes from './routes/clientes.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import pedidosRoutes from './routes/pedidos.routes.js'
import productosRoutes from './routes/productos.routes.js'
import detalleRoutes from './routes/detalleP.routes.js'
import path from 'path'

//definir el modulo de ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const corsOptions={
    origin:'http://localhost:8100',//la direccion ip del servidor
    methods:['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    cedentials:true
}
app.use(cors(corsOptions));
app.use(express.json()); // Para que interprete los objetos JSON
app.use(express.urlencoded({extended:true})); //se añade para poder receptar formularios
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Rutas
app.use('/api', clientesRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', productosRoutes); 
app.use('/api', pedidosRoutes);
app.use('/api', detalleRoutes);


// Middleware para rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Endpoint not found'
    });
});

export default app;
