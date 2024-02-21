const PORT = 3000;
const { dbconfig } = require("./dbconfig.js");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
