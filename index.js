/**
 * @Author: 曾星旗 <me@zengxingqi.com>
 * @Date: 2021-06-05 23:05:08
 * @LastEditors: 曾星旗 <me@zengxingqi.com>
 * @LastEditTime: 2021-06-08 19:30:58
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
  path: "/like",
  transports: ["websocket"],
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});
io.adapter(redisAdapter({ pubClient, subClient }));
const nameSpaced = io.of("like");
function connection(client) {
  function join(room) {
    // 除自己以外
    client.to(room).emit("joined", room, client.id);
  }
  function leave(room) {
    client.to(room).emit("leaved", room, client.id);
  }
  function getClientRoom(err, room) {
    if (err) return;
    logout(room);
  }
  function disconnect() {
    pubClient.get(client.id, getClientRoom);
  }
  function login(room) {
    client.join(room);
    pubClient.set(client.id, room);
    // 给自己发
    const myRoom = nameSpaced.adapter.rooms.get(room);
    if (myRoom) {
      client.emit("online", room, [...myRoom.keys()]);
    }
  }
  function logout(room) {
    client.leave(room);
    client.to(room).emit("logout", room, client.id);
    pubClient.del(client.id);
  }
  client.on("logout", logout);
  client.on("login", login);
  client.on("join", join);
  client.on("leave", leave);
  client.on("disconnect", disconnect);
  client.on("error", client.disconnect);
}

function adapterError() {
  console.log("adapter 错误回调");
}

nameSpaced.on("connection", connection);
io.of("/").adapter.on("error", adapterError);
io.listen(3700);

// io.emit("message", "给所有客户端发送");
// client.broadcast.emit("message", "给所有除了发送者的客户端发送");
// 房间内所有人
// io.in(room).emit("joined", room, [...myRoom.keys()]);
// 除自己，给站点所有人
// client.broadcast.emit("joined", room, client.id);
