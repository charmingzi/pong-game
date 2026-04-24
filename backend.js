const WebSocket = require('ws');
// 适配Render自动端口，不写死端口
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });

let players = [];
// 固定双人位：第1个进=玩家1，第2个进=玩家2
let playerSeq = 1;

let game = {
  ball: { x: 400, y: 300, vx: 4, vy: 2 },
  paddle1: { y: 250 },
  paddle2: { y: 250 },
  score1: 0,
  score2: 0
};

function resetBall() {
  game.ball = { 
    x: 400, 
    y: 300, 
    vx: 4 * (Math.random() > 0.5 ? 1 : -1), 
    vy: 2 
  };
}

wss.on('connection', (ws) => {
  let curPlayer = playerSeq;
  playerSeq = playerSeq === 1 ? 2 : 1;
  players.push(ws);

  // 告诉当前玩家自己是1P还是2P
  ws.send(JSON.stringify({type:"role", p:curPlayer}));

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
    playerSeq = 1;
  });
});

// 游戏主循环
setInterval(() => {
  game.ball.x += game.ball.vx;
  game.ball.y += game.ball.vy;

  // 上下墙反弹
  if (game.ball.y <= 0 || game.ball.y >= 600) game.ball.vy *= -1;

  // 左右球拍碰撞
  if (game.ball.x <= 40 && game.ball.y > game.paddle1.y && game.ball.y < game.paddle1.y + 100) {
    game.ball.vx *= -1;
  }
  if (game.ball.x >= 750 && game.ball.y > game.paddle2.y && game.ball.y < game.paddle2.y + 100) {
    game.ball.vx *= -1;
  }

  // 进球计分
  if (game.ball.x < 0) {
    game.score2++;
    resetBall();
  }
  if (game.ball.x > 800) {
    game.score1++;
    resetBall();
  }

  // 全员同步游戏数据
  players.forEach(p => {
    if (p.readyState === WebSocket.OPEN) {
      p.send(JSON.stringify(game));
    }
  });
}, 1000 / 60);

console.log(`服务运行端口：${PORT}`);
