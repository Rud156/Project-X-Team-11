import {  Math } from 'phaser';
import { PlayerDirection } from './PlayerController';

export class Player {
  private _playerSprite: any;
  private _assetName: string;

  private _sceneCamera: any;

  //#region Creation

  constructor(assetName: string, camera: any) {
    this._assetName = assetName;
    this._sceneCamera = camera;
  }

  public create(x: number, y: number, z: number) {
    this._playerSprite = this._sceneCamera.create(x, y, z, this._assetName);
    this._playerSprite.size = new Math.Vector2(1, 1);
  }

  //#endregion

  //#region Update

  public update(deltaTime: number, currentSpeed: number, controlDirection: PlayerDirection) {
    if (controlDirection == PlayerDirection.Left) {
      this._playerSprite.x -= currentSpeed * deltaTime;
    } else if (controlDirection == PlayerDirection.Right) {
      this._playerSprite.x += currentSpeed * deltaTime;
    }
  }

  //#endregion

  //#region External Functions

  public setPlayerPosition(x: number, y: number, z: number): void {
    this._playerSprite.x = x;
    this._playerSprite.y = y;
    this._playerSprite.z = z;
  }

  public getPlayerPosition(): Math.Vector4 {
    return this._playerSprite.position;
  }

  public getPlayerScale(): Math.Vector2 {
    return this._playerSprite.scale;
  }

  public getPlayerSize(): Math.Vector2 {
    return this._playerSprite.size;
  }

  //#endregion
}
