import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { config } from "../config/config.js"
import multer from "multer"
import crypto from "crypto" //modulo nativo de node, ya no lo uso
import bcrypt from "bcrypt"
import passport from "passport"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import winston from "winston"
import { warn } from "console"

//__DIRNAME CASERO
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
//__dirname 01:05:00 (explicacion en la clase de Express Avanzado)



//MULTER DISKSTORAGE CONFIG
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/public/assets/img')
  },
  filename: function (req, file, cb) {    
    //Valido que solo se puedan subir imagenes
    let tipo = file.mimetype.split("/")[0]    
    if (tipo !== "image") {
      return cb(new Error())
    }
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage })

//HASH DE PASSWORDS
let SECRET = config.SECRET
//Hasheo con el modulo crypto de node
// const generateHash = password => crypto.createHmac("sha256", SECRET).update(password).digest("hex")


//Hasheo con una libreria externa mas segura llamada bcrypt (Uso la version síncrona)
const generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
//Le agrego una función adicional para validar por el plus de seguridad que le da los saltos
const validaPassword = (password, passwordHash) => bcrypt.compareSync(password, passwordHash)


//Funcion de callback de passport para configurar manualmente el metodo authenticate con mensajes especificos y demás
const passportCall = (estrategia) => {
  return function (req, res, next) {
    passport.authenticate(estrategia, function (err, user, info, status) {
      if (err) { return next(err) } //Desde passport.config hay error
      if (!user) {//desde passsport devuelvo un done(null, false)
        res.setHeader("Content-Type", "application/json")
        return res.status(401).json({ error: info.message ? info.message : info.toString() }) //info es el tercer argumento que podes darle al done, para dar un mensaje. EJ done(null, false, {message: "no estas autorizado papa"})
      }
      req.user = user; //Si passport devuelve done(null, usuario) creo el req.user
      return next() //passport es un middleware hay que darle next() para que siga
    })(req, res, next);
  };
}

// Middleware para verificar JWT
function verifyJWT(req, res, next) {
  const token = req.cookies["codercookie"];
  if (token) {
      jwt.verify(token, SECRET, (err, decoded) => {
          if (err) {
              logger.debug('Token inválido:', err.message); // Log para depuración
          } else {              
              req.user = decoded; // solo devuelve req.user si el token es valido
              logger.debug(req.user)              
          }
      });
  }
  next();
}

//Configuracion para envio de correos electrónicos
const transporter = nodemailer.createTransport(
  {
    service: "gmail",
    port: "587",
    auth: {
      user: "pedrotissone@gmail.com",
      pass: "dgfwptaknqcxwxsx"
    }
  }
)

// transporter.sendMail(
//   {
//     from: "pedrotissone@gmail.com",
//     to: "tiza90@hotmail.com",
//     subject: "prueba de email con imagen incrustada y adjunto",
//     html: `<h2>Mensaje de prueba</h2> <br> <br>
//     <img src="imgIncrustada"/> <br>`,
//     attachments: [
//       {
//         path: "./src/public/assets/img/1712650680873-champagne y mariposas img3.webp",
//         filename: "imagenDelProyecto.webp",
//         cid: "imgIncrustada"
//       }
//     ]
//   }
// ).then(resultado => console.log(resultado))
// .catch(error => console.log(error))

//Creo una funcion modelo para enviar emails sin adjuntos
const enviarEmail = async (para, asunto, mensaje) => {
    return await transporter.sendMail(
      {
        from: "pedrotissone@gmail.com",
        to: para,
        subject: asunto,
        html: mensaje
      }
    )
}

//Creación y configuración de mi Logger

//1) Creo mis transportes
const transporteDesarrollo = new winston.transports.Console(
  {
    level: "debug",
    format: winston.format.combine(      
      winston.format.json(),
      winston.format.prettyPrint(),
      winston.format.printf(({message})=> {
        return JSON.stringify(message, null, 2)
      })
    )
  }        
)

const transporteProduccion = new winston.transports.File(
  {
    level: "info",
    filename: "./errorLogs.log",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }        
)
//1B) Personalizo los levels a mi gusto
let customLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  http: 4,
  debug: 5
}

//2) Creo mi logger con los transportes
const logger = winston.createLogger(
  {
    levels: customLevels,
    transports: 
    [
      transporteProduccion
    ]
  }
)
//Configuro el logger segun el modo de desarrollo
let MODE = config.MODE
if (MODE == "dev") {
  logger.add(transporteDesarrollo)
}



export { __dirname, upload, generateHash, validaPassword, SECRET, passportCall, verifyJWT, enviarEmail, logger};
