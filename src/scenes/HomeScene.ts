import { Scene, Input, GameObjects, Sound } from 'phaser';
import GameInfo from '../utils/GameInfo';
import AssetManager from '../utils/AssetManager';
import { ObjectBlinkerManager } from '../managers/ObjectBlinkerManager';

export class HomeScene extends Scene {
  private _spaceBar: Input.Keyboard.Key;
  private _objectBlinkerManager: ObjectBlinkerManager;

  private _startBackground: GameObjects.Sprite;
  private _startText: GameObjects.Text;

  private _backgroundMusic: Sound.BaseSound;

  //#region Creation

  constructor() {
    super({
      key: GameInfo.HomeSceneName,
    });
  }

  public preload(): void {
    this.load.image(AssetManager.StartPageString, AssetManager.StartPage);
    this.load.audio(AssetManager.BackgroundMusicString, [AssetManager.BackgroundMusic]);
    this.load.script(AssetManager.WebFontString, AssetManager.WebFont);
  }

  public create(): void {
    this.add.sprite(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, AssetManager.StartPageString);
    this._startText = this.add.text(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, 'Press SPACE tp Start', {
      font: '30px Cute Font',
      fill: '#ffffff',
    });

    this._objectBlinkerManager = new ObjectBlinkerManager();
    this._objectBlinkerManager.create();

    this._spaceBar = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
    this._objectBlinkerManager.addItemToFlash(this._startText, 3, -1, true);
  }

  //#endregion

  //#region Update

  public update(time: number, delta: number) {
    if (Phaser.Input.Keyboard.JustDown(this._spaceBar)) {
      this.scene.switch(GameInfo.MainSceneName);
    }
  }

  //#endregion
}
