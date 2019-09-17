import 'phaser';
import { Types } from 'phaser';

import { MainScene } from './scenes/MainScene';
import GameInfo from './utils/GameInfo';
import { GameOverScene } from './scenes/GameOverScene';
import { HomeScene } from './scenes/HomeScene';

// main game configuration
const config: Types.Core.GameConfig = {
  width: GameInfo.ScreenWidth,
  height: GameInfo.ScreenHeight,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [HomeScene, MainScene, GameOverScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  input: {
    gamepad: true,
  },
};

// game class
export class Game extends Phaser.Game {
  constructor(config: Types.Core.GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.addEventListener('load', () => {
  const game = new Game(config);
});
