import { Types, Math } from 'phaser';
import GameInfo from '../utils/GameInfo';

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
    this._playerSprite.size = new Math.Vector2(5, 2);
  }

  public update(deltaTime: number, keyboardControls: Types.Input.Keyboard.CursorKeys) {
    if (keyboardControls.left.isDown) {
      this._playerSprite.x -= GameInfo.PlayerHorizontalSpeed * deltaTime;
    } else if (keyboardControls.right.isDown) {
      this._playerSprite.x += GameInfo.PlayerHorizontalSpeed * deltaTime;
    }

    this._sceneCamera.x = this._playerSprite.x;
  }
}
