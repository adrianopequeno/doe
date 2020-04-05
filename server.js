/** Configurando o servidor */
const express = require("express")
const server = express()

/** Configurar o servidor para apresentar aquivos estáticos */
server.use(express.static('public'))

/** Habilitar body do formumário */
server.use(express.urlencoded({ extended: true }))

/** Configurando a conexão com o banco de dados Postgres */
const Pool = require("pg").Pool
const db = new Pool({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: 'doe'
})

/** Configurando a template engine */
const nunjucks = require("nunjucks")
nunjucks.configure("./", {
  express: server,
  noCache: true, // não faz cache
})

/** Configurara a apresentatção da página */
server.get("/", function (req, res) {
  const querySelect = `SELECT * FROM donors`

  db.query(querySelect, function (err, result) {
    if (err) return res.send("Erro na seleção do banco de dados!")

    const donors = result.rows
    return res.render("index.html", { donors })
  })
})

/** Pegando os dados do formulário pelo Method POST */
server.post("/", function (req, res) {
  // pegar dados do formuário
  const name = req.body.name
  const email = req.body.email
  const blood = req.body.blood

  /** Verificação dos dados */
  if (name == "" || email == "" || blood == "") {
    return res.send("Todos os campos são obrigatórios!")
  }

  /** Colocando os Valores dentro do Bando de Dados Postgres */
  const queryInsert = `
        INSERT INTO donors ("name", "email", "blood")
        VALUES ($1, $2, $3)`
  const values = [name, email, blood]

  db.query(queryInsert, values, function (err) {
    /** Fluxo de erro */
    if (err) return res.send("Erro no bando de dados.")

    /** redireciona para a página inicial - Fluxo ideal */
    return res.redirect("/")
  })

})

/* Ligar o servidor e permitir o acesso na porta 3000 */
server.listen(3000, function () {
  console.log("Iniciei o servidor.")
})