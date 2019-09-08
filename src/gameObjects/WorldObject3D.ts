import GameInfo from '../utils/GameInfo';

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

    if (this._objectSprite.z > this._sceneCamera.z + 32) {
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
}
