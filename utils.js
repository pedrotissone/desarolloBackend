import {fileURLToPath} from "url"
import {dirname, join} from "path"
import multer from "multer"
import crypto from "crypto"

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
    if(tipo !== "image") {
        return cb(new Error())
    }
      cb(null, Date.now() + '-' + file.originalname)
    }
  })  
  const upload = multer({ storage: storage })

  //HASH DE PASSWORDS CON MODULO CRYPTO (así es la sintaxis, muy rara)
  let SECRET = "coderCoder123"
  const generateHash = password => crypto.createHmac("sha256", SECRET).update(password).digest("hex")




  export {__dirname, upload, generateHash};
