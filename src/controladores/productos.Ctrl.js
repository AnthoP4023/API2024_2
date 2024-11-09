import{conmysql} from '../db.js'
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dcles1yod',  // Reemplaza con tu Cloud Name
  api_key: '129117278282968',        // Reemplaza con tu API Key
  api_secret: 'vMTibViWQhHOccgIi2MoBuZKuyM'   // Reemplaza con tu API Secret
})

export const getProductos=
async (req,res) => {
    try {
        const [result]= await conmysql.query(' select * from productos')
        res.json(result)
    } catch (error) {
        return res.status(500).json({message:"Error  al consultar productos"})
    }
}

export const getProductosxid=
async(req, res)=>{
    try {
        const [result]=await conmysql.query('select * from productos where prod_id=?', [req.params.id])
        if(result.length<=0)return res.status(404).json({
            cli_id:0,
            message:"Producto no encontrado"
        })
        res.json(result[0])
    } catch (error) {
        return res.status(500).json({message:'Error  del lado del servidor'})
    }
}

export const postProducto = async (req, res) => {
    try {
        // Verificar si los datos del producto están presentes
        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body;
        console.log("Datos recibidos del cuerpo:", req.body);

        let prod_imagen = null; // Inicia la variable para la imagen

        // Verificar si se subió una imagen
        if (req.file) {
            console.log("Imagen recibida:", req.file);
            // Subir la imagen a Cloudinary
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: 'uploads', // Puedes agregar un folder en Cloudinary si lo deseas
                public_id: `${Date.now()}-${req.file.originalname}` // Usamos el timestamp para garantizar un nombre único
            });

            console.log("Resultado de la carga en Cloudinary:", uploadResult);
            // Obtener la URL segura de la imagen subida
            prod_imagen = uploadResult.secure_url;
        } else {
            console.log("No se recibió ninguna imagen.");
        }

        // Insertar el producto en la base de datos
        const [rows] = await conmysql.query(
            'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) VALUES (?, ?, ?, ?, ?, ?)',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen]
        );

        console.log("Producto insertado con ID:", rows.insertId);

        // Responder con el id del producto insertado
        res.status(201).json({ id: rows.insertId });

    } catch (error) {
        console.error("Error al crear el producto:", error);
        return res.status(500).json({ message: 'Error del lado del servidor', error: error.message });
    }
};

// Ruta PUT para actualizar un producto
export const putProductos = async (req, res) => {
    try {
        const { id } = req.params;
        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen } = req.body;

        let newProd_imagen = prod_imagen; // Si ya se pasó una URL de imagen, la usaremos

        // Verificar si se subió una nueva imagen
        if (req.file) {
            // Subir la nueva imagen a Cloudinary
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: 'uploads',
                public_id: `${Date.now()}-${req.file.originalname}` // Usar un nombre único
            });

            // Obtener la URL segura de la imagen subida
            newProd_imagen = uploadResult.secure_url;
        }

        // Actualizar el producto en la base de datos
        const [result] = await conmysql.query(
            'UPDATE productos SET prod_codigo = ?, prod_nombre = ?, prod_stock = ?, prod_precio = ?, prod_activo = ?, prod_imagen = ? WHERE prod_id = ?',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, newProd_imagen, id]
        );

        if (result.affectedRows <= 0) {
            return res.status(404).json({
                message: 'Producto no encontrado'
            });
        }

        // Obtener el producto actualizado
        const [rows] = await conmysql.query('SELECT * FROM productos WHERE prod_id = ?', [id]);
        res.json(rows[0]);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error del lado del servidor' });
    }
};


export const patchProductos=
async (req,res)=>{
    try {
        const {id}=req.params
        //console.log(req.body)
        const {prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen}=req.body
        console.log(prod_nombre)
        const [result]=await conmysql.query('update productos set prod_codigo = IFNULL(?, prod_codigo), prod_nombre = IFNULL(?, prod_nombre), prod_stock = IFNULL(?, prod_stock), prod_precio = IFNULL(?, prod_precio), prod_activo = IFNULL(?, prod_activo), prod_imagen = IFNULL(?, prod_imagen) WHERE prod_id = ?',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen, id])

        if(result.affectedRows<=0)return res.status(404).json({
            message:'Productos no encontrado'
        })
        const[rows]=await conmysql.query('select * from productos where prod_id=?',[id])
        res.json(rows[0])
        /* res.send({
            id:rows.insertId
        }) */
    } catch (error) {
        return res.status(500).json({message:'error del lado del servidor'})
    }
}

export const deleteProductos=
async(req, res)=>{
    try {
        const[rows]=await conmysql.query(' delete from productos where prod_id=?', [req.params.id])
        if(rows.affectedRows<=0)return res.status(404).json({
            id:0,
            message:"No pudo eliminar el productos"
        })
        return res.status(200).json({
            message: "Cliente eliminado correctamente"     
         }); 
    } catch (error) {
        return res.status(500).json({message:"Error al lado del servidor"})
    }
}
