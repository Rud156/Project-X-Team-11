import { GameObjects } from 'phaser';

class BlinkerItem {
  public displayItem: GameObjects.Components.Alpha;
  public index;
  public blinkRate;
  public blinkCount;
  public isInfinite: boolean;

  private _exitWithZeroAlpha: boolean;
  private _currentAlpha;
  private _isFlashIn;

  constructor(
    displayItem: GameObjects.Components.Alpha,
    index: number,
    blinkRate: number,
    blinkCount: number,
    isInfinite: boolean = false,
    exitWithZeroAlpha: boolean = false
  ) {
    this.displayItem = displayItem;
    this.index = index;
    this.blinkRate = blinkRate;
    this.blinkCount = blinkCount;
    this.isInfinite = isInfinite;

    this._exitWithZeroAlpha = exitWithZeroAlpha;
    this._currentAlpha = 1;
    this._isFlashIn = false;
  }

  public get CurrentAlpha(): number {
    return this._currentAlpha;
  }

  public set CurrentAlpha(v: number) {
    this._currentAlpha = v;
  }

  public get IsFlashIn(): boolean {
    return this._isFlashIn;
  }

  public set IsFlashIn(v: boolean) {
    this._isFlashIn = v;
  }

  public get ExitWithZeroAlpha(): boolean {
    return this._exitWithZeroAlpha;
  }

  public set ExitWithZeroAlpha(v: boolean) {
    this._exitWithZeroAlpha = v;
  }
}

export class ObjectBlinkerManager {
  private _displayItems: Array<BlinkerItem>;
  private _currentIndex: number;

  //#region Creation

  public create(): void {
    this._displayItems = [];
    this._currentIndex = 0;
  }

  //#endregion

  //#region Update

  public update(deltaTime: number): void {
    for (let i = this._displayItems.length - 1; i >= 0; i--) {
      const blinkerItem = this._displayItems[i];

      if (blinkerItem.IsFlashIn) {
        blinkerItem.CurrentAlpha += blinkerItem.blinkRate * deltaTime;
        if (blinkerItem.CurrentAlpha >= 1) {
          blinkerItem.IsFlashIn = false;
          blinkerItem.CurrentAlpha = 1;

          if (!blinkerItem.ExitWithZeroAlpha) {
            blinkerItem.blinkCount -= 1;
          }
        }
      } else {
        blinkerItem.CurrentAlpha -= blinkerItem.blinkRate * deltaTime;
        if (blinkerItem.CurrentAlpha <= 0) {
          blinkerItem.IsFlashIn = true;
          blinkerItem.CurrentAlpha = 0;

          if (blinkerItem.ExitWithZeroAlpha) {
            blinkerItem.blinkCount -= 1;
          }
        }
      }

      blinkerItem.displayItem.setAlpha(
        blinkerItem.CurrentAlpha,
        blinkerItem.CurrentAlpha,
        blinkerItem.CurrentAlpha,
        blinkerItem.CurrentAlpha
      );

      if (blinkerItem.blinkCount <= 0 && !blinkerItem.isInfinite) {
        this._displayItems.splice(i, 1);
      }
    }
  }

  //#endregion

  //#region External Functions

  public addItemToFlash(
    displayItem: GameObjects.Components.Alpha,
    blinkRate: number,
    blinkCount: number,
    isInfinite: boolean = false,
    exitWithZeroAlpha: boolean = false
  ): number {
    const existingItemIndex = this.getBlinkerItemByType(displayItem);
    if (existingItemIndex !== -1) {
      console.log('Item Already Exists');
      return;
    }

    const blinkerItem = new BlinkerItem(displayItem, this._currentIndex, blinkRate, blinkCount, isInfinite, exitWithZeroAlpha);

    this._displayItems.push(blinkerItem);
    this._currentIndex += 1;

    return blinkerItem.index;
  }

  public removeBlinker(index: number) {
    const blinkerItemIndex = this.getBlinkerItemByIndex(index);
    if (blinkerItemIndex === -1) {
      console.log('Invalid Item Requested');
    }

    this._displayItems.splice(blinkerItemIndex, 1);
  }

  public reset(): void {
    this._displayItems.length = 0;
    this._currentIndex = 0;
  }

  //#endregion

  //#region Utility Functions

  private getBlinkerItemByIndex(index: number): number {
    return this._displayItems.findIndex(_ => _.index === index);
  }

  private getBlinkerItemByType(displayItem: GameObjects.Components.Alpha): number {
    return this._displayItems.findIndex(_ => _.displayItem === displayItem);
  }

  //#endregion
}
