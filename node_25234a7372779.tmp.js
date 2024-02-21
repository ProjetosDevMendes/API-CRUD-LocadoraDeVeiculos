const PORT = 3000;
const { dbconfig } = require("./dbconfig.js");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.use(bodyParser.json());

// Rota para criar novo cliente
app.post("/Clientes", async (req, res) => {
  try {
    const dadosCliente = req.body;

    console.log("Novo cliente recebido:", dadosCliente);
    const idNovoCliente = await salvarNovoCliente(dadosCliente);
    console.log(idNovoCliente);

    res.status(200).json(idNovoCliente);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao processar o Webhook.");
  }
});

async function salvarNovoCliente(dadosCliente) {
  try {
    const connection = await mysql.createConnection(dbconfig);
    const query =
      "INSERT INTO Cliente (nome, telefone, email, cpf) VALUES (?, ?, ?, ?)";
    const [results] = await connection.execute(query, [
      dadosCliente.nome,
      dadosCliente.telefone,
      dadosCliente.email,
      dadosCliente.cpf,
    ]);
    connection.end();
    console.log(
      "Novo cliente salvo com sucesso no banco de dados!",
      results.insertId
    );
    return results.insertId;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Rota para buscar informações de veículo
app.get("/Veiculo", async (req, res) => {
  try {
    const idVeiculo = req.query.idVeiculo;
    console.log("Trazendo informações do veículo de ID: " + idVeiculo);

    console.log(dbconfig);

    const informacoesVeiculo = await trazerInformacoesVeiculo(idVeiculo);

    if (informacoesVeiculo) {
      res.status(200).json(informacoesVeiculo);
    } else {
      res
        .status(404)
        .json({ mensagem: `Nenhum carro encontrado com ID ${idVeiculo}.` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao processar a solicitação.");
  }
});

async function trazerInformacoesVeiculo(idVeiculo) {
  try {
    const connection = await mysql.createConnection(dbconfig);

    const [results] = await connection.execute(
      "SELECT marca, modelo, categoria, url_veiculo FROM Veiculo WHERE id = ?",
      [idVeiculo]
    );

    connection.end();

    if (results.length === 0) {
      console.log(`Nenhum carro encontrado com ID ${idVeiculo}.`);
      return null;
    } else {
      console.log(`Carro de ID ${idVeiculo} encontrado:`);
      console.log(results[0]);
      return results[0];
    }
  } catch (err) {
    console.error("Erro na consulta:", err);
    throw err;
  }
}

app.get("/TrazerVeiculo", async (req, res) => {
  try {
    const categoria = req.query.categoria;
    console.log("Trazendo veiculos da: " + categoria);

    const informacoesVeiculoCategoria = await trazerInformacoesCategoria(
      categoria
    );

    if (informacoesVeiculoCategoria) {
      res.status(200).json(informacoesVeiculoCategoria);
    } else {
      res
        .status(404)
        .json({ mensagem: `Nenhuma categoria encontrada ${categoria}.` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao processar a solicitação.");
  }
});

async function trazerInformacoesCategoria(categoria) {
  try {
    const connection = await mysql.createConnection(dbconfig);

    const [results] = await connection.execute(
      "SELECT id, marca, modelo FROM Veiculo WHERE categoria = ?",
      [categoria]
    );

    connection.end();

    if (results.length === 0) {
      console.log(`Nenhum carro encontrado na categoria ${categoria}.`);
      return null;
    } else {
      console.log(`Carro da ${categoria} encontrado:`);
      console.log(results);
      return results;
    }
  } catch (err) {
    console.error("Erro na consulta:", err);
    throw err;
  }
}

//  Rota para verificar se o número de telefone pertence a um cliente
app.get("/VerificarCliente/:telefone", async (req, res) => {
  try {
    const { telefone } = req.params;
    if (!telefone) {
      return res
        .status(400)
        .json({ mensagem: "O parâmetro telefone é obrigatório." });
    }

    console.log(
      "Verificando se o número de telefone pertence a um cliente: " + telefone
    );

    async function verificarClientePorTelefone(telefone) {
      const connection = await mysql.createConnection(dbconfig);
      const [results] = await connection.execute(
        "SELECT telefone FROM Cliente WHERE telefone = ?",
        [telefone]
      );
      return results;
    }

    const clienteEncontrado = await verificarClientePorTelefone(telefone);

    if (clienteEncontrado.length > 0) {
      res.status(200).json({ mensagem: "Cliente" });
    } else {
      res.status(200).json({ mensagem: "Não é cliente" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
});

// Rota para buscar informações do cliente pelo CPF
app.get("/Cliente/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;
    if (!cpf) {
      return res
        .status(400)
        .json({ mensagem: "O parâmetro CPF é obrigatório." });
    }

    console.log("Trazendo informações do cliente pelo CPF: " + cpf);

    async function trazerInformacoesClientePorCPF(cpf) {
      const connection = await mysql.createConnection(dbconfig);
      const [results] = await connection.execute(
        "SELECT nome FROM Cliente WHERE cpf = ?",
        [cpf]
      );
      return results; // Retorna os resultados da consulta PENSA YAGO !!, NÃO DEFINA UMA FUNÇÃO DENTRO E TENTE ACESSAR POR FORA DA FUNCTION
    }

    const informacoesCliente = await trazerInformacoesClientePorCPF(cpf);

    if (informacoesCliente.length > 0) {
      const nomeCliente = informacoesCliente[0].nome;

      res.status(200).json({ nome: nomeCliente });
    } else {
      res
        .status(404)
        .json({ mensagem: `Nenhum cliente encontrado com CPF ${cpf}.` });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
});
