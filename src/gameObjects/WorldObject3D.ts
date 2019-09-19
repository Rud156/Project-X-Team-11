import GameInfo from '../utils/GameInfo';
import { Math } from 'phaser';
import { WorldObject } from './WorldObject';

export class WorldObject3D {
  private _objectSprite: any;
  private _assetName: string;
  private _sceneCamera: any;

  private _objectOutOfView: boolean;
  private _unProjectedPosition: Math.Vector4;

  private _data: any;

  //#region Creation

  constructor(assetName: string, camera: any) {
    this._sceneCamera = camera;
    this._assetName = assetName;

    this._data = {};
  }

  public create(x: number, y: number, initialZ: number): void {
    this._objectSprite = this._sceneCamera.create(x, y, initialZ, this._assetName);
    this._unProjectedPosition = new Math.Vector4();
  }

  //#endregion

  //#region Update

  public update(deltaTime: number, currentSpeed: number): void {
    this._objectSprite.z += currentSpeed * deltaTime;

    if (this._objectSprite.z > this._sceneCamera.z + GameInfo.DistanceRemoveBehindCamera) {
      this._objectOutOfView = true;
    }
  }

  //#endregion

  //#region External Functions

  public setSize(x: number, y: number) {
    this._objectSprite.size = { x, y };
  }

  public setTint(color: number) {
    this._objectSprite.gameObject.setTint(color);
  }

  public setData(data: any) {
    this._data = data;
  }

  public getData(): any {
    return this._data;
  }

  public get flipX(): boolean {
    return this._objectSprite.gameObject.flipX;
  }

  public set flipX(v: boolean) {
    this._objectSprite.gameObject.flipX = v;
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

  public getObjectPosition(): Math.Vector4 {
    return this._objectSprite.position;
  }

  public getObjectScale(): Math.Vector2 {
    return this._objectSprite.scale;
  }

  public getObjectSize(): Math.Vector2 {
    return this._objectSprite.size;
  }

  public getUnProjectedVector(): Math.Vector4 {
    return this._unProjectedPosition;
  }

  public setUnProjectedVector(unProjectedVector: Math.Vector4) {
    this._unProjectedPosition = unProjectedVector;
  }

  //#endregion
}
