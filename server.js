const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Usamos createPool para que maneje reconexiones automáticas si el servidor se cae
const db = process.env.DATABASE_URL 
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'futbol',
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

// Verificar estado de la base de datos de manera limpia con el Pool
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error crítico conectando a la Base de Datos con el Pool:', err.message);
  } else {
    console.log('¡Conexión exitosa y estable a la base de datos de Railway mediante Pool!');
    connection.release(); // Libera la verificación inicial
  }
});

// 1. Obtener todos los jugadores
app.get('/api/jugadores', (req, res) => {
  db.query('SELECT * FROM jugadores ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error("Error en SELECT:", err);
      return res.status(500).json({ error: 'Error al obtener jugadores de la base de datos' });
    }
    res.json(results || []);
  });
});

// 2. Registrar nuevo jugador
app.post('/api/jugadores', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

  db.query('INSERT INTO jugadores (nombre) VALUES (?)', [nombre], (err, result) => {
    if (err) {
      console.error("Error en INSERT:", err);
      return res.status(500).json({ error: 'Error al registrar el jugador' });
    }
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
      if (err) {
        console.error("Error en UPDATE:", err);
        return res.status(500).json({ error: 'Error al actualizar el estado de pago' });
      }
      res.json({ message: 'Jugador actualizado correctamente' });
    }
  );
});

// 4. Eliminar jugador
app.delete('/api/jugadores/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM jugadores WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error("Error en DELETE:", err);
      return res.status(500).json({ error: 'Error al eliminar el jugador' });
    }
    res.json({ message: 'Jugador eliminado correctamente' });
  });
});

// Ruta de simulación de login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  res.json({ success: true, message: 'Login exitoso' });
});

// Port flexible para Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});