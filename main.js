import { Game } from './game/Game.js';

const canvas = document.getElementById('game-canvas');
canvas.width = 480;
canvas.height = 720;

const game = new Game(canvas);
game.start();