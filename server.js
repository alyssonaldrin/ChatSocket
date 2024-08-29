import { Server } from "socket.io";

const port = process.argv[2] || 3000;
const io = new Server(port);
console.log("Servidor rodando na porta: " + port);

let clients = [];

io.of("/").on("connect", (socket) => {
  function validateNickname() {
    if (!nickname) {
      socket.emit(
        "broadcast",
        "Ao entrar você deve usar o comando !nick para definir seu nickname!"
      );
      socket.disconnect();
    }
  }

  let nickname = null;
  console.log("Novo cliente se conectou!");

  socket.on("disconnect", (reason) => {
    clients = clients.filter((client) => client.id !== socket.id);
    socket.broadcast.emit("broadcast", `!left ${nickname}`);
    console.log(
      `\n${nickname || "Desconhecido"} se desconectou, razão: ${reason}`
    );
    console.log("Número de clientes: %d", clients.length);
  });

  socket.on("nick", (input) => {
    if (nickname) {
      socket.emit(
        "broadcast",
        "Você já escolheu um nickname, use !changenickname para alterá-lo!"
      );
      return;
    }

    nickname = input;
    clients.push({ id: socket.id, nickname: input });
    socket.broadcast.emit("broadcast", `${nickname} acabou de entrar!`);
    broadcastUsersResponse(socket);
  });

  socket.on("users", () => {
    validateNickname();

    broadcastUsersResponse(socket);
  });

  socket.on("msg", (msg) => {
    validateNickname();

    console.log(msg);
    socket.broadcast.emit("broadcast", `msg ${nickname} ${msg}`);
  });

  socket.on("changenickname", (input) => {
    validateNickname();

    const oldNickname = nickname;
    nickname = input;
    const client = clients.find((client) => client.id === socket.id);
    client.nickname = input;
    socket.broadcast.emit(
      "broadcast",
      `!changenickname ${oldNickname} ${input}`
    );
    socket.emit("broadcast", `!changenickname ${oldNickname} ${input}`);
  });

  socket.on("poke", (input) => {
    validateNickname();

    const poked = clients.find((client) => client.nickname === input);
    socket.broadcast.emit("broadcast", `!poke ${nickname} ${poked.nickname}`);
    socket.emit("broadcast", `!poke ${nickname} ${poked.nickname}`);
  });
});

function broadcastUsersResponse(socket) {
  let users = `!users ${clients.length}`;
  clients.forEach((client) => {
    users += ` ${client.nickname}`;
  });
  socket.emit("broadcast", users);
}
