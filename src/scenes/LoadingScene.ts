import { Scene } from 'phaser';
import AssetManager from '../utils/AssetManager';
import GameInfo from '../utils/GameInfo';

export class LoadingScene extends Scene {
  private _timer = 1;

  preload() {
    this.load.script(AssetManager.WebFontString, AssetManager.WebFont);
  }

  create() {
    //@ts-ignore
    window.WebFont.load({
      google: {
        families: [AssetManager.DefaultFontName],
      },
      active: () => {
        console.log('WebFont Loaded. Loading Screen');
      },
    });
  }

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    this._timer -= deltaTime;
    if (this._timer <= 0) {
      this.scene.switch(GameInfo.HomeSceneName);
    }
  }
}
