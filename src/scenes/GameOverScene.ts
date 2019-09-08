import { Scene } from 'phaser';
import GameInfo from '../utils/GameInfo';

export class GameOverScene extends Scene {
  constructor() {
    super({
      key: GameInfo.GameOverSceneName,
    });
  }

  create() {
    this.add
      .text(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, 'GAME OVER', {
        font: '20px Courier',
        fill: '#ffffff',
      })
      .setAlign('center')
      .setOrigin(0.5);
  }
}
