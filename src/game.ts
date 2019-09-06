import 'phaser';
import { Types } from 'phaser';

import { MainScene } from './scenes/mainScene';

// main game configuration
const config: Types.Core.GameConfig = {
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: 'game',
  scene: MainScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
    },
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
