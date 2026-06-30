const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión Flexible: Usa variables de entorno para Railway, o cae en local si no existen
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'futbol',
  port: process.env.DB_PORT || 3306,
  // El SSL es obligatorio para bases de datos en la nube como Aiven
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la Base de Datos:', err);
  } else {
    console.log('¡Conexión exitosa a la base de datos!');
  }
});

// 1. Obtener todos los jugadores
app.get('/api/jugadores', (req, res) => {
  db.query('SELECT * FROM jugadores ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 2. Registrar nuevo jugador
app.post('/api/jugadores', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

  db.query('INSERT INTO jugadores (nombre) VALUES (?)', [nombre], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Jugador agregado', id: result.insertId });
  });
});

// 3. Actualizar pago de un jugador
app.put('/api/jugadores/:id', (req, res) => {
  const { id } = req.params;
  const { pago_completado, monto_pagado } = req.body;
  
  db.query(
    'UPDATE jugadores SET pago_completado = ?, monto_pagado = ? WHERE id = ?',
    [pago_completado, monto_pagado, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Jugador actualizado correctamente' });
    }
  );
});

// 4. Eliminar jugador
app.delete('/api/jugadores/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM jugadores WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Jugador eliminado correctamente' });
  });
});

// Ruta de simulación de login para evitar errores 404 en el frontend
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  // Modifica esto después si quieres una contraseña real
  res.json({ success: true, message: 'Login exitoso' });
});

// Railway asigna el puerto automáticamente mediante process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});