// Cria uma cópia datada do banco em backups/ — rode: npm run backup
const fs = require("fs");
const path = require("path");

const origem = path.join(__dirname, "..", "dados", "clinica.db");
if (!fs.existsSync(origem)) {
  console.error("Banco ainda não existe (rode o servidor ao menos uma vez).");
  process.exit(1);
}

const pasta = path.join(__dirname, "..", "backups");
fs.mkdirSync(pasta, { recursive: true });

const carimbo = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
const destino = path.join(pasta, `clinica-${carimbo}.db`);
fs.copyFileSync(origem, destino);
console.log("Backup criado:", destino);
