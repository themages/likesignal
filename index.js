/**
 * @Author: 曾星旗 <me@zengxingqi.com>
 * @Date: 2021-06-05 23:05:08
 * @LastEditors: 曾星旗 <me@zengxingqi.com>
 * @LastEditTime: 2021-06-07 00:16:29
 * @Description: socket 主入口
 * @FilePath: /likesignal/index.js
 */
const redis = require("redis");
const redisAdapter = require("socket.io-redis");
// 使用密码，注意安全组的端口访问限制
const pubClient = redis.createClient("7120", "localhost", {
  auth_pass: "r2570",
});
const subClient = pubClient.duplicate();
const io = require("socket.io")({
  path: "/",
  transports: ["websocket"],
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});
io.adapter(redisAdapter({ pubClient, subClient }));
io.on("connection", (client) => {
  console.log("user connect!", client.id);
  // io.emit("message", "给所有客户端发送");
  // client.broadcast.emit("message", "给所有除了发送者的客户端发送");
  client.on("disconnect", () => {
    console.log("user disconnect!", client.adapter.rooms);
  });
  client.on("join", (room) => {
    client.join(room);
    const myRoom = io.sockets.adapter.rooms.get(room);
    if (myRoom) {
      // const users = myRoom.length;
      // 给自己发
      // client.emit("joined", room, client.id);
      // 除自己以外
      client.to(room).emit("joined", room, client.id);
      // 房间内所有人
      // io.in(room).emit("joined", room, client.id);
      // 除自己，给站点所有人
      // client.broadcast.emit("joined", room, client.id);
    }
    console.log("user joined room!", room, myRoom);
  });
  client.on("leave", (room) => {
    client.leave(room);
    // client.broadcast.emit("leaved", room, client.id);
    client.to(room).emit("leaved", room, client.id);
    console.log("user leave room!", room);
  });
  client.on("error", () => {
    client.disconnect();
  });
});
io.of("/").adapter.on("error", function () {
  console.error("触发错误回调");
});
io.listen(3700);
