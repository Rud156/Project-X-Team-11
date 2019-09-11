import { Math } from 'phaser';
import ExtensionFunctions from '../utils/ExtensionFunctions';

export class ObjectShaker {
  private _shakeActive: boolean;
  private _shakeMultiplier: number;
  private _shakeTimer: number;

  private _shakeOffset: Math.Vector3;

  constructor() {
    this._shakeOffset = new Math.Vector3();
  }

  public update(deltaTime: number, currentX: number, currentY: number, currentZ: number): Math.Vector3 {
    if (this._shakeActive) {
      this._shakeOffset.set(
        ExtensionFunctions.randomInRange(-this._shakeMultiplier, this._shakeMultiplier),
        ExtensionFunctions.randomInRange(-this._shakeMultiplier, this._shakeMultiplier),
        ExtensionFunctions.randomInRange(-this._shakeMultiplier, this._shakeMultiplier)
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

  public startShaking(shakeMultiplier: number, shakeTime: number) {
    this._shakeActive = true;
    this._shakeMultiplier = shakeMultiplier;
    this._shakeTimer = shakeTime;
  }

  public stopShaking(): void {
    this._shakeActive = false;
    this._shakeOffset.set(0, 0, 0);
  }

  public IsShakingActive(): boolean {
    return this._shakeActive;
  }
}
