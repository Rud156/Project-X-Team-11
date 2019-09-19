import { Input, Types, Scene } from 'phaser';

export class PlayerController {
  private _playerDirection: PlayerDirection;

  private _input: Input.InputPlugin;
  private _keyboardCursorKeys: Types.Input.Keyboard.CursorKeys;

  //#region Creation

  constructor(input: Input.InputPlugin) {
    this._playerDirection = PlayerDirection.None;
    this._input = input;

    this._keyboardCursorKeys = input.keyboard.createCursorKeys();
  }

  //#endregion

  //#region Update

  public update(): void {
    if (this._keyboardCursorKeys.left.isDown) {
      this._playerDirection = PlayerDirection.Left;
    } else if (this._keyboardCursorKeys.right.isDown) {
      this._playerDirection = PlayerDirection.Right;
    } else {
      this._playerDirection = PlayerDirection.None;
    }

    if (this._input.gamepad.total !== 0) {
      const gamepad = this._input.gamepad.getPad(0);
      if (gamepad.axes.length) {
        const horizontalAxis = gamepad.axes[0].getValue();

        if (horizontalAxis > 0) {
          this._playerDirection = PlayerDirection.Right;
        } else if (horizontalAxis < 0) {
          this._playerDirection = PlayerDirection.Left;
        } else {
          this._playerDirection = PlayerDirection.None;
        }
      }
    }
  }

  //#endregion

  //#region External Functions

  public resetController() {
    this._playerDirection = PlayerDirection.None;
  }

  public get PlayerDirection(): PlayerDirection {
    return this._playerDirection;
  }

  //#endregion
}

export enum PlayerDirection {
  None,
  Left,
  Right,
}
