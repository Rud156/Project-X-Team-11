import { GameObjects, Scene } from 'phaser';
import GameInfo from '../utils/GameInfo';
import ExtensionFunctions from '../utils/ExtensionFunctions';

export class WorldObject {
  private _objectSprite: GameObjects.Sprite;

  private _assetName: string;
  private _parentScene: Scene;

  private _x: number;
  private _y: number;
  private _z: number;

  private _isXLeftHalf: boolean;
  private _isYBottomHalf: boolean;

  private _objectOutOfView: boolean;

  //#region Creation

  constructor(assetName: string, parentScene: Scene) {
    this._parentScene = parentScene;
    this._assetName = assetName;
  }

  public create(x: number, y: number, initialZ: number): void {
    this._x = x;
    this._y = y;
    this._z = initialZ;

    if (this._x < GameInfo.HalfScreenWidth) {
      this._isXLeftHalf = true;
    }
    if (this._y >= GameInfo.HalfScreenHeight) {
      this._isYBottomHalf = true;
    }

    this._objectSprite = this._parentScene.add.sprite(-GameInfo.ScreenWidth, -GameInfo.ScreenHeight, this._assetName);
  }

  //#endregion

  //#region Update

  public update(deltaTime: number): void {
    const positionX = this.getPositionX();
    const positionY = this.getPositionY();

    this._objectSprite.setPosition(positionX, positionY);

    this._z -= GameInfo.WorldMovementSpeed * deltaTime; // TODO: Pass this as a paramter later on...
    if (this._z < 1) {
      this._z = 1;
      this._objectOutOfView = true;
    }

    this._objectSprite.scale = ExtensionFunctions.map(this._z, 0, GameInfo.HalfScreenWidth, 1, 0);
  }

  //#endregion

  //#region External Functions

  public isObjectOutOfView(): boolean {
    return this._objectOutOfView;
  }

  public isObjectCollisionValid(): boolean {
    return this._z <= GameInfo.CheckCollisionZLimit;
  }

  public destroy(): void {
    this._objectSprite.destroy();
  }

  //#endregion

  //#region Utility Functions

  private getPositionX(): number {
    let positionX;

    if (this._isXLeftHalf) {
      positionX = ExtensionFunctions.map(this._x / this._z, 1, this._x, GameInfo.HalfScreenWidth, -GameInfo.ScreenWidth);
    } else {
      positionX = ExtensionFunctions.map(this._x / this._z, 1, this._x, GameInfo.HalfScreenWidth, GameInfo.ScreenWidth * 2);
    }

    return positionX;
  }

  private getPositionY(): number {
    let positionY;

    if (this._isYBottomHalf) {
      positionY = ExtensionFunctions.map(this._y / this._z, 1, this._y, GameInfo.HalfScreenHeight, GameInfo.ScreenHeight * 2);
    } else {
      positionY = ExtensionFunctions.map(this._y / this._z, 1, this._y, GameInfo.HalfScreenHeight, -GameInfo.ScreenHeight);
    }

    return positionY;
  }

  //#endregion
}
