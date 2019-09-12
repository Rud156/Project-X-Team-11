import { Scene, GameObjects } from 'phaser';
import GameInfo from '../utils/GameInfo';

export class GameOverScene extends Scene {
  private _playerScore: number;
  private _scoreText: GameObjects.Text;

  //#region Creation

  constructor() {
    super({
      key: GameInfo.GameOverSceneName,
    });
  }

  create() {
    this.add
      .text(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight - 100, 'GAME OVER', {
        font: '20px Courier',
        fill: '#ffffff',
      })
      .setAlign('center')
      .setOrigin(0.5);

    this._scoreText = this.add
      .text(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight + 100, `Score: ${Math.floor(this._playerScore)}`, {
        font: '30px Courier',
        fill: '#ffffff',
      })
      .setAlign('center')
      .setOrigin(0.5);
  }

  //#endregion

  //#region External Functions

  public setGameOverScore(score: number) {
    this._playerScore = score;
  }

  //#endregion
}
