const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 10000 });

let players = [];
let game = {
  ball: { x: 400, y: 300, vx: 4, vy: 2 },
  paddle1: { y: 250 },
  paddle2: { y: 250 },
  score1: 0,
  score2: 0
};

function resetBall() {
  game.ball = { x: 400, y: 300, vx: 4 * (Math.random() > 0.5 ? 1 : -1), vy: 2 };
}

wss.on('connection', (ws) => {
  console.log("玩家连接");
  players.push(ws);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === "move") {
        if (msg.player === 1) game.paddle1.y = msg.y;
        if (msg.player === 2) game.paddle2.y = msg.y;
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    players = players.filter(p => p !== ws);
  });
});

setInterval(() => {
  game.ball.x += game.ball.vx;
  game.ball.y += game.ball.vy;

  if (game.ball.y <= 0 || game.ball.y >= 600) game.ball.vy *= -1;

  if (game.ball.x <= 50 && game.ball.y > game.paddle1.y && game.ball.y < game.paddle1.y + 100) {
    game.ball.vx *= -1;
  }
  if (game.ball.x >= 750 && game.ball.y > game.paddle2.y && game.ball.y < game.paddle2.y + 100) {
    game.ball.vx *= -1;
  }

  if (game.ball.x < 0) {
    game.score2++;
    resetBall();
  }
  if (game.ball.x > 800) {
    game.score1++;
    resetBall();
  }

  players.forEach(p => {
    if (p.readyState === WebSocket.OPEN) {
      p.send(JSON.stringify(game));
    }
  });
}, 1000 / 60);

console.log("服务器运行在端口 10000");
