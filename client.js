import io from "socket.io-client";
import readline from "readline";

const VALID_COMMANDS = [
  "!nick",
  "!users",
  "!sendmsg",
  "!changenickname",
  "!poke",
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const url = process.argv[2] || "http://localhost:3000";
let socket = io(url);

socket.on("broadcast", (msg) => {
  console.log(msg);
});

socket.on("disconnect", () => {
  console.log(`Conexão com o servidor fechada!`);
  process.exit();
});

socket.on("error", (err) => {
  console.error("Erro de conexão:", err.message);
});

rl.on("line", (input) => {
  const inputTrim = input.trim();
  const inputSplits = inputTrim.split(" ");
  const command = inputSplits.shift();

  if (!VALID_COMMANDS.includes(command)) {
    console.log("Comando desconhecido\nComandos possíveis:");
    VALID_COMMANDS.forEach((command) => {
      console.log(`${command}`);
    });
    return;
  }

  const message = inputSplits.join(" ");

  switch (command) {
    case "!nick":
      socket.emit("nick", message);
      return;
    case "!users":
      socket.emit("users");
      return;
    case "!sendmsg":
      socket.emit("msg", message);
      return;
    case "!changenickname":
      socket.emit("changenickname", message);
      return;
    case "!poke":
      socket.emit("poke", message);
      return;
    default:
      return;
  }

  // if (command === "!nick ") {
  //   socket.emit("nick", message);
  // } else if (message.startsWith("!sendmsg ")) {
  //   if (currentNickname) {
  //     const text = message.slice(10).trim();
  //     broadcast(`!msg ${currentNickname} ${text}\n`);
  //   } else {
  //     socket.end("Você deve definir um nickname primeiro\n");
  //   }
  // } else if (message.startsWith("!poke ")) {
  //   if (currentNickname) {
  //     const target = message.slice(6).trim();
  //     if (clients[target]) {
  //       clients[target].write(`!poke ${currentNickname}\n`);
  //     } else {
  //       socket.write(`Usuário ${target} não encontrado\n`);
  //     }
  //   } else {
  //     socket.end("Você deve definir um nickname primeiro\n");
  //   }
  // }
});
