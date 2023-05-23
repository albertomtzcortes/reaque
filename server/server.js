express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const nodemailer = require('nodemailer');

const app = express();
const cors = require('cors');


AWS.config.update({
  accessKeyId: 'Addd',
  secretAccessKey: 'dd',
  region: 'us-east-2'
});


const s3 = new AWS.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'readd',
    key: (req, file, cb) => {
      const extension = file.originalname.split('.').pop();
      const filename = `${Date.now()}.${extension}`;
      cb(null, filename);
    }
  })
});

app.use(express.json());
app.use(cors());

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imageKey = req.file.key;
    const { recipient, subject, body, senderEmail } = req.body;

    const transporter = nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2010-12-01' })
    });

    const mailOptions = {
      from: senderEmail,
      to: recipient,
      subject: subject,
      html: body
    };

    await transporter.sendMail(mailOptions);

    console.log('Correo electrónico enviado correctamente');
    res.status(200).json({ message: 'Imagen cargada y correo electrónico enviado' });
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    res.status(500).json({ error: 'Error al enviar el correo electrónico' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor Express en funcionamiento en el puerto ${port}`);
});