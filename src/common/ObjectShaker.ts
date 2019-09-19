import { Math } from 'phaser';
import ExtensionFunctions from '../utils/ExtensionFunctions';

export class ObjectShaker {
  private _shakeActive: boolean;
  private _shakeTimer: number;

  private _shakeMultiplierX: number;
  private _shakeMultiplierY: number;
  private _shakeMultiplierZ: number;

  private _shakeOffset: Math.Vector3;

  //#region Creation

  constructor() {
    this._shakeOffset = new Math.Vector3();
    this._shakeActive = true;
  }

  //#endregion

  //#region Update

  public update(deltaTime: number, currentX: number, currentY: number, currentZ: number): Math.Vector3 {
    if (this._shakeActive) {
      this._shakeOffset.set(
        ExtensionFunctions.randomInRange(-this._shakeMultiplierX, this._shakeMultiplierX),
        ExtensionFunctions.randomInRange(-this._shakeMultiplierY, this._shakeMultiplierY),
        ExtensionFunctions.randomInRange(-this._shakeMultiplierZ, this._shakeMultiplierZ)
      );

      this._shakeTimer -= deltaTime;
      if (this._shakeTimer <= 0) {
        this.stopShaking();
      }
      
    } else {
      this._shakeOffset.set(0, 0, 0);
    }

    this._shakeOffset.x += currentX;
    this._shakeOffset.y += currentY;
    this._shakeOffset.z += currentZ;

    return this._shakeOffset;
  }

  //#endregion

  //#region External Functions

  public startShaking(shakeTime: number, shakeMultiplierX: number, shakeMultiplierY: number, shakeMultiplierZ: number) {
    this._shakeActive = true;
    this._shakeTimer = shakeTime;

    this._shakeMultiplierX = shakeMultiplierX;
    this._shakeMultiplierY = shakeMultiplierY;
    this._shakeMultiplierZ = shakeMultiplierZ;
  }

  //#endregion

  //#region Utility Functions

  private stopShaking(): void {
    this._shakeActive = false;
    this._shakeOffset.set(0, 0, 0);
  }

  //#endregion
}
