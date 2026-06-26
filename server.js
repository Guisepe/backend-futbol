const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración flexible para Railway/Aiven
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la BD: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos con ID: ' + db.threadId);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// 1. Obtener todos los jugadores
app.get('/api/jugadores', (req, res) => {
    db.query('SELECT * FROM jugadores ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 2. Marcar/Desmarcar pago
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

// 3. AGREGAR NUEVO JUGADOR (Admin)
app.post('/api/jugadores', (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

    db.query('INSERT INTO jugadores (nombre) VALUES (?)', [nombre], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Jugador agregado', id: result.insertId });
    });
});

// 4. ELIMINAR JUGADOR (Admin)
app.delete('/api/jugadores/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM jugadores WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Jugador eliminado correctamente' });
    });
});

// 5. Login de Admin
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    db.query('SELECT clave_admin FROM configuracion LIMIT 1', (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0 && results[0].clave_admin === password) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }
    });
});

// Railway asigna automáticamente la variable process.env.PORT en producción
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));