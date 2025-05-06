import app from './app.js';

const PORT = process.env.PORT || 3000;

// Escuchar en 0.0.0.0 para aceptar conexiones desde cualquier IP dentro de la red Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Notifications-Service on port ${PORT}`);
});