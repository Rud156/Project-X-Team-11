import { Types, Math } from 'phaser';
import GameInfo from '../utils/GameInfo';
import { WorldObject } from './WorldObject';

export class Player {
  private _playerSprite: any;
  private _assetName: string;

  private _sceneCamera: any;

  constructor(assetName: string, camera: any) {
    this._assetName = assetName;
    this._sceneCamera = camera;
  }

  public create(x: number, y: number, z: number) {
    this._playerSprite = this._sceneCamera.create(x, y, z, this._assetName);
    this._playerSprite.size = new Math.Vector2(1, 1);
  }

  public update(deltaTime: number, keyboardControls: Types.Input.Keyboard.CursorKeys) {
    if (keyboardControls.left.isDown) {
      this._playerSprite.x -= GameInfo.PlayerHorizontalSpeed * deltaTime;
    } else if (keyboardControls.right.isDown) {
      this._playerSprite.x += GameInfo.PlayerHorizontalSpeed * deltaTime;
    }

    //this._sceneCamera.x = this._playerSprite.x;
  }

  public getPlayerPosition(): Math.Vector3 {
    return new Math.Vector3(this._playerSprite.x, this._playerSprite.y, this._playerSprite.z);
  }

  public getPlayerScale(): Math.Vector2 {
    return this._playerSprite.scale;
  }

  public getPlayerSize(): Math.Vector2 {
    return new Math.Vector2(147,128);//this._playerSprite.size;
  }
}
