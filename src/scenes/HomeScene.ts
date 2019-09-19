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

  preload(): void {
    this.load.image(AssetManager.StartPageString, AssetManager.StartPage);
    this.load.audio(AssetManager.BackgroundMusicString, [AssetManager.BackgroundMusic]);
    this.load.script(AssetManager.WebFontString, AssetManager.WebFont);
  }

  create(): void {
    this._startBackground = this.add.sprite(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, AssetManager.StartPageString);
    this._startBackground.setDisplaySize(GameInfo.ScreenWidth, GameInfo.ScreenHeight);

    this._objectBlinkerManager = new ObjectBlinkerManager();
    this._objectBlinkerManager.create();

    //@ts-ignore
    window.WebFont.load({
      google: {
        families: [AssetManager.DefaultFontName],
      },
      active: () => {
        console.log('WebFont Loaded. HomeScreen');

        this._startText = this.add
          .text(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, 'Press SPACE to Start', {
            fontFamily: AssetManager.DefaultFontName,
            fill: '#ffffff',
            fontSize: 30,
          })
          .setAlign('center')
          .setOrigin(0.5);

        this._objectBlinkerManager.addItemToFlash(this._startText, 3, -1, true);
      },
    });

    this._spaceBar = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);

    this._backgroundMusic = this.sound.add(AssetManager.BackgroundMusicString, {
      loop: true,
      volume: 0.3,
    });
    this._backgroundMusic.play();
  }

  //#endregion

  //#region Update

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    if (Phaser.Input.Keyboard.JustDown(this._spaceBar)) {
      this.scene.switch(GameInfo.MainSceneName);
      this._backgroundMusic.stop();
    }

    this._objectBlinkerManager.update(deltaTime);
  }

  //#endregion
}
