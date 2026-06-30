const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión Directa: Si está en Railway usa tu URL interna, si no, cae en local
const db = process.env.PORT 
  ? mysql.createConnection('mysql://root:BmXRGaXRtiNyOEQUYzOBKyouluOZUHJJ@mysql.railway.internal:3306/railway')
  : mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'futbol',
      port: 3306
    });

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la Base de Datos:', err);
  } else {
    console.log('¡Conexión exitosa a la base de datos de Railway!');
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
  res.json({ success: true, message: 'Login exitoso' });
});

// Port flexible para Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});