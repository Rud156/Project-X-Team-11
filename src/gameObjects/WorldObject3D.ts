import GameInfo from '../utils/GameInfo';
import { Math } from 'phaser';

export class WorldObject3D {
  private _objectSprite: any;
  private _assetName: string;
  private _sceneCamera: any;

  private _objectOutOfView: boolean;

  constructor(assetName: string, camera: any) {
    this._sceneCamera = camera;
    this._assetName = assetName;
  }

  public create(x: number, y: number, initialZ: number): void {
    this._objectSprite = this._sceneCamera.create(x, y, initialZ, this._assetName);
  }

  public update(deltaTime: number): void {
    this._objectSprite.z += GameInfo.WorldMovementSpeed * deltaTime;

    if (this._objectSprite.z > this._sceneCamera.z + GameInfo.DistanceRemoveBehindCamera) {
      this._objectOutOfView = true;
    }
  }

  public isObjectOutOfView(): boolean {
    return this._objectOutOfView;
  }

  public isObjectCollisionValid(): boolean {
    return this._objectSprite.z >= this._sceneCamera.z;
  }

  public destroy(): void {
    this._sceneCamera.remove(this._objectSprite);
  }

  public getObjectPosition(): Math.Vector3 {
    return new Math.Vector3(this._objectSprite.x, this._objectSprite.y, this._objectSprite.z);
  }

  public getObjectScale(): Math.Vector2 {
    return this._objectSprite.scale;
  }

  public getObjectSize(): Math.Vector2 {
    return this._objectSprite.size;
  }
}
