const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Conexão com banco SQLite
const db = new sqlite3.Database("./database.db");

// Criar tabelas caso não existam
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT UNIQUE,
      senha TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modelo TEXT,
      placa TEXT,
      usuario_id INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS multas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT,
      valor REAL,
      vencimento TEXT,
      veiculo_id INTEGER
    )
  `);
});

// Rota de cadastro
app.post("/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;

  db.run(
    `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`,
    [nome, email, senha],
    function (err) {
      if (err) return res.status(400).json({ erro: "Email já existe" });

      return res.json({ sucesso: true, id: this.lastID });
    }
  );
});

// Rota de login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get(
    `SELECT * FROM usuarios WHERE email = ? AND senha = ?`,
    [email, senha],
    (err, row) => {
      if (row) return res.json({ sucesso: true, usuario: row });

      return res.status(401).json({ erro: "Credenciais inválidas" });
    }
  );
});

// Inicia servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
