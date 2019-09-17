import { GameObjects, Scene } from 'phaser';
import GameInfo from '../utils/GameInfo';

export class ScrollingBackgroundManager {
  private _backgroundImages: Array<GameObjects.Image>;

  private _currentXPosition: number;
  private _previousPlayerXPosition: number;

  private _scene: Scene;

  //#region Creation

  constructor(scene: Scene) {
    this._scene = scene;
    this._backgroundImages = [];
  }

  public create(assetString: string) {
    this._currentXPosition = 0;
    const startingXPosition = -Math.floor(GameInfo.ScrollingBackgroundCount / 2) * GameInfo.HalfScreenWidth;

    for (let i = 0; i < GameInfo.ScrollingBackgroundCount; i++) {
      const backgroundImage = this._scene.add
        .image(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, assetString)
        .setDepth(-5000)
        .setDisplaySize(GameInfo.ScreenWidth, GameInfo.ScreenHeight)
        .setSize(GameInfo.ScreenWidth, GameInfo.ScreenHeight);

      backgroundImage.setPosition(startingXPosition + i * GameInfo.ScreenWidth, GameInfo.HalfScreenHeight);

      this._backgroundImages.push(backgroundImage);
    }
  }

  //#endregion

  //#region Update

  public update(deltaTime: number, positionX: number) {
    this.updateScrolling(deltaTime, positionX);
  }

  //#endregion

  //#region External Functions

  public resetScrolling(): void {
    this._currentXPosition = 0;
    this._previousPlayerXPosition = 0;

    const startingXPosition = -Math.floor(GameInfo.ScrollingBackgroundCount / 2) * GameInfo.HalfScreenWidth;

    for (let i = 0; i < this._backgroundImages.length; i++) {
      this._backgroundImages[i].x = startingXPosition + i * GameInfo.ScreenWidth;
    }
  }

  //#endregion

  //#region Utility Functions

  private updateScrolling(deltaTime: number, positionX: number): void {
    const playerPositionDiff = this._previousPlayerXPosition - positionX;
    if (playerPositionDiff > 0) {
      for (const backgroundImage of this._backgroundImages) {
        backgroundImage.x += GameInfo.ScrollingBackgroundSpeed * deltaTime;
      }
    } else if (playerPositionDiff < 0) {
      for (const backgroundImage of this._backgroundImages) {
        backgroundImage.x -= GameInfo.ScrollingBackgroundSpeed * deltaTime;
      }
    }

    this._previousPlayerXPosition = positionX;
    this.rePositionChildren();
  }

  private rePositionChildren(): void {
    const firstElement = this._backgroundImages[0];
    const lastElement = this._backgroundImages[this._backgroundImages.length - 1];

    if (lastElement.x < GameInfo.HalfScreenWidth) {
      this._backgroundImages.shift();
      firstElement.x = lastElement.x + GameInfo.ScreenWidth;
      this._backgroundImages.push(firstElement);
    } else if (firstElement.x > GameInfo.HalfScreenWidth) {
      this._backgroundImages.pop();
      lastElement.x = firstElement.x - GameInfo.ScreenWidth;
      this._backgroundImages.unshift(lastElement);
    }
  }

  //#endregion
}
