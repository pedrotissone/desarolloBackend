import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { config } from "../config/config.js"
import multer from "multer"
import crypto from "crypto" //modulo nativo de node, lo cambié por bcrypt
import bcrypt from "bcrypt"
import passport from "passport"
import jwt from "jsonwebtoken"

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
              console.warn('Token inválido:', err.message); // Log para depuración
          } else {
              req.user = decoded; // solo devuelve req.user si el token es valido
              console.log(req.user)
          }
      });
  }
  next();
}



export { __dirname, upload, generateHash, validaPassword, SECRET, passportCall, verifyJWT };
