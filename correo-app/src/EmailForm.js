import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, TextareaAutosize, Grid, Typography } from '@mui/material';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * @method 
   */
  const handleImageUpload = async () => {
    if (selectedImage) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('recipient', recipient);
        formData.append('subject', subject);
        formData.append('body', body);
        formData.append('senderEmail', senderEmail);

        await axios.post('http://localhost:3000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Imagen cargada con éxito');
      } catch (error) {
        setErrorMessage(
          error.response ? error.response.data : error.message
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = (event) => {
    setSelectedImage(event.target.files[0]);
    setErrorMessage('');
  };

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={10} sm={8} md={6} lg={4}>
        <Typography variant="h5" align="center" gutterBottom>
          Push
        </Typography>

        <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="upload-file" />
        <label htmlFor="upload-file" style={{ display: 'block', marginBottom: '1rem' }}>
          <Button variant="contained" component="span" color="primary" fullWidth>
            {selectedImage ? 'Imagen cargada' : 'Cargar imagen'}
          </Button>
        </label>

        <TextField
          label="Destinatario"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />

        <TextField
          label="Asunto"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />

        <TextareaAutosize
          placeholder="Cuerpo"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          minRows={3}
          maxRows={6}
          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}
        />

        <TextField
          type="email"
          label="Correo de envío"
          value={senderEmail}
          onChange={(event) => setSenderEmail(event.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />

        <Button
          onClick={handleImageUpload}
          disabled={!selectedImage || loading}
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          style={{ marginTop: '1rem' }}
        >
          {loading ? 'Enviando...' : 'Enviar push'}
        </Button>

        {errorMessage && (
          <Typography variant="body2" color="error" align="center" style={{ marginTop: '1rem' }}>
            {errorMessage}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default App;
