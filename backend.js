const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

let game = {
  paddle1: { y: 250 },
  paddle2: { y: 250 },
  ball: { x: 400, y: 300, vx: 4, vy: 2 },
  score1: 0, score2: 0
};

function reset() {
  game.ball = { x:400, y:300, vx: 4*(Math.random()>0.5?1:-1), vy:2 };
}

setInterval(() => {
  game.ball.x += game.ball.vx;
  game.ball.y += game.ball.vy;
  if (game.ball.y <=0 || game.ball.y>=600) game.ball.vy *= -1;
  if (game.ball.x < 50 && game.ball.y>game.paddle1.y && game.ball.y<game.paddle1.y+100) game.ball.vx *= -1;
  if (game.ball.x > 750 && game.ball.y>game.paddle2.y && game.ball.y<game.paddle2.y+100) game.ball.vx *= -1;
  if (game.ball.x < 0) { game.score2++; reset(); }
  if (game.ball.x > 800) { game.score1++; reset(); }
}, 15);

app.get('/', (req,res) => res.sendFile('index.html', {root:'.'}));
app.get('/game', (req,res) => res.json(game));
app.post('/move', (req,res) => {
  let p = req.body.player;
  let y = req.body.y;
  if (p === 1) game.paddle1.y = y;
  if (p === 2) game.paddle2.y = y;
  res.send('ok');
});

app.listen(PORT, () => console.log('ok'));
