import { Scene, GameObjects, Input } from 'phaser';
import GameInfo from '../utils/GameInfo';
import { MainScene } from './MainScene';

export class GameOverScene extends Scene {
  private _playerScore: number;
  private _scoreText: GameObjects.Text;
  private _resetText: GameObjects.Text;

  private _spaceBar: Input.Keyboard.Key;

  //#region Creation

  constructor() {
    super({
      key: GameInfo.GameOverSceneName,
    });
  }

  create() {
    this.createText();

    this._spaceBar = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
  }

  private createText() {
    this.add
      .text(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight - 50, 'GAME OVER', {
        font: '20px Courier',
        fill: '#ffffff',
      })
      .setAlign('center')
      .setOrigin(0.5);

    this._scoreText = this.add
      .text(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight + 50, `Score: ${Math.floor(this._playerScore)}`, {
        font: '30px Courier',
        fill: '#ffffff',
      })
      .setAlign('center')
      .setOrigin(0.5);

    this._resetText = this.add
      .text(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight + 100, 'Press SPACE to Reset', {
        font: '30px Courier',
        fill: '#ffffff',
      })
      .setAlign('center')
      .setOrigin(0.5);
  }

  //#endregion

  //#region Update

  public update(time: number, delta: number) {
    if (Input.Keyboard.JustDown(this._spaceBar)) {
      // (this.scene.get(GameInfo.MainSceneName) as MainScene).resetScreen(true);
      // this.scene.switch(GameInfo.MainSceneName);
      
      // TODO: Fix This...
      location.href = location.href;
    }
  }

  //#endregion

  //#region External Functions

  public setGameOverScore(score: number) {
    this._playerScore = score;
  }

  //#endregion
}
