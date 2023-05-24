
express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const nodemailer = require('nodemailer');
const mysql = require('mysql');

const app = express();
const cors = require('cors');


AWS.config.update({
  accessKeyId: 'AKIAX4dd',
  secretAccessKey: '37Hddd',
  region: 'us-east-2'
});

const s3 = new AWS.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'reactbucd',
    key: (req, file, cb) => {
      const extension = file.originalname.split('.').pop();
      const filename = `${Date.now()}.${extension}`;
      cb(null, filename);
    }
  })
});



const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123',
  database: 'database'
});

dbConnection.connect((error) => {
  if (error) {
    console.error('Error al conectar a la base de datos:', error);
  } else {
    console.log('Conexión exitosa a la base de datos');
   
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        senderEmail VARCHAR(255) NOT NULL,
        imageKey VARCHAR(255) NOT NULL
      )
    `;
    dbConnection.query(createTableQuery, (error) => {
      if (error) {
        console.error('Error al crear la tabla:', error);
      } else {
        console.log('Tabla creada o ya existente');
      }
    });
  }
}); 

app.use(express.json());
app.use(cors());

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imageKey = req.file.key;
    const { recipient, subject, body, senderEmail } = req.body;

    const transporter = nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' }),
      sendingRate: 5,
      configurationSet: 'ejemplobukets22'
    });

    const mailOptions = {
      from: senderEmail,
      to: recipient,
      subject: subject,
      html: body
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado correctamente');
    console.log('ID del mensaje:', info.messageId);

    const message = {
      recipient: recipient,
      subject: subject,
      body: body,
      senderEmail: senderEmail,
      imageKey: imageKey
    };

    dbConnection.query('INSERT INTO messages SET ?', message, (error, result) => {
      if (error) {
        console.error('Error al guardar el mensaje en la base de datos:', error);
        res.status(500).json({ error: 'Error al guardar el mensaje en la base de datos' });
      } else {
        console.log('Mensaje guardado en la base de datos');
        res.status(200).json({ message: 'Imagen cargada, correo electrónico enviado y mensaje guardado' });
      }
    });
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    res.status(500).json({ error: 'Error al enviar el correo electrónico' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor Express en funcionamiento en el puerto ${port}`);
});
