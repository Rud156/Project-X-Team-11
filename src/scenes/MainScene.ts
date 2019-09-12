import { Scene, Types, Input, GameObjects, Math as Maths, Geom } from 'phaser';
import AssetManager from '../utils/AssetManager';
import GameInfo from '../utils/GameInfo';
import { WorldObject3D } from '../gameObjects/WorldObject3D';
import { Player } from '../gameObjects/player/Player';
import ExtensionFunctions from '../utils/ExtensionFunctions';
import CollisionUtils from '../utils/CollisionUtils';
import { ObjectShaker } from '../common/ObjectShaker';
import { PlayerController, PlayerDirection } from '../gameObjects/player/PlayerController';
import { GameOverScene } from './GameOverScene';

export class MainScene extends Scene {
  private _testKey: Input.Keyboard.Key;
  private _keyboardCursorKeys: Types.Input.Keyboard.CursorKeys;

  private _sky: GameObjects.Image;

  private _car: GameObjects.Sprite;
  private _carRectangle: Geom.Rectangle;

  private _roadMarkers: Array<WorldObject3D>;
  private _currentGapMultiplier: number;
  private _roadObjectsRemoved: number;
  private _maxZPosition: number;

  private _mainCamera: any; // 3D Camera
  private cameras3d: any; // Placeholder 3D Cameras
  private _cameraShaker: ObjectShaker;
  private _lookAtLerp: number = 0;

  private _player: Player;
  private _playerController: PlayerController;

  private _isCurveSpawnActive: boolean;
  private _currentCurveMarkersCount: number;
  private _isLeftCurve: boolean;

  private _currentRoadXPosition: number;

  private _playerLives: number;
  private _playerLivesDisplay: GameObjects.Text;
  private _playerScore: number;
  private _playerScoreDisplay: GameObjects.Text;

  private _currentSpeed: number;

  //#region Creation

  constructor() {
    super({
      key: GameInfo.MainSceneName,
    });

    this._roadMarkers = [];
    this._roadObjectsRemoved = 0;

    this._isCurveSpawnActive = false;
    this._currentCurveMarkersCount = 0;
    this._isLeftCurve = false;

    this._currentRoadXPosition = 0;
  }

  preload(): void {
    this.load.scenePlugin('Camera3DPlugin', './lib/camera3d.js', 'Camera3DPlugin', 'cameras3d');

    this.load.image(AssetManager.LineMarkerString, AssetManager.LineMarker);
    this.load.image(AssetManager.WhitePixelString, AssetManager.WhitePixel);
    this.load.image(AssetManager.BackgroundString, AssetManager.Background);
    this.load.image(AssetManager.CarImageString, AssetManager.CarImage);
  }

  create() {
    this.createCamera(); // This must be run first as everything depends on it
    this.createInitialRoadMarkers();
    this.createPlayer();
    this.createOtherSceneItem();

    this._currentSpeed = GameInfo.WorldMovementSpeed;
    this._testKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.X);
    this._keyboardCursorKeys = this.input.keyboard.createCursorKeys();
  }

  private createCamera(): void {
    this._mainCamera = this.cameras3d
      .add(80)
      .setPosition(this._currentRoadXPosition, GameInfo.CameraDefaultY, GameInfo.CameraDefaultZ)
      .setPixelScale(32);

    // @ts-ignore
    this.scene.sys = this.scene.systems;
    this._mainCamera.setScene(this.scene);

    this._cameraShaker = new ObjectShaker();
  }

  private createInitialRoadMarkers(): void {
    const initialRoadMarkerCount = 30;
    for (let i = 0; i < initialRoadMarkerCount; i++) {
      this.spawnRoadBoundaryPair(
        this._currentRoadXPosition,
        GameInfo.WorldDefaultY,
        this._mainCamera.z - 20 - i * GameInfo.GapBetweenRoadMarker
      );
    }

    this._maxZPosition = this._mainCamera.z - initialRoadMarkerCount * 10;
  }

  private createPlayer(): void {
    this._player = new Player(AssetManager.WhitePixelString, this._mainCamera);
    this._player.create(this._currentRoadXPosition, GameInfo.PlayerInitialYPosition, this._mainCamera.z + GameInfo.PlayerZCameraOffset);

    this._playerController = new PlayerController(this.input);

    this._car = this.add.sprite(GameInfo.HalfScreenWidth, GameInfo.ScreenHeight - 64, AssetManager.CarImageString);
    this._carRectangle = this._car.getBounds();
  }

  private createOtherSceneItem(): void {
    this._playerScore = 0;
    this._playerLives = GameInfo.PlayerMaxLives;

    this._playerScoreDisplay = this.add.text(10, 10, '', {
      font: '20px Courier',
      fill: '#ffffff',
    });
    this._playerLivesDisplay = this.add.text(GameInfo.ScreenWidth - 100, 10, `Lives: ${this._playerLives}`, {
      font: '20px Courier',
      fill: '#ffffff',
    });

    this._sky = this.add
      .image(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, AssetManager.BackgroundString)
      .setDepth(-5000)
      .setDisplaySize(GameInfo.ScreenWidth, GameInfo.ScreenHeight)
      .setSize(GameInfo.ScreenWidth, GameInfo.ScreenHeight);
  }

  //#endregion

  //#region Update

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    this._playerScore += deltaTime * GameInfo.ScoreIncrementRate;
    this._currentSpeed += GameInfo.ScoreIncrementRate * deltaTime;
    this._currentSpeed = Math.min(this._currentSpeed, GameInfo.WorldMovementMaxSpeed);

    this.updateRoadMarkers(deltaTime);
    this.checkCollisions();
    this.updateOtherGameObjects(deltaTime);

    this.updatePlayerMovement(deltaTime);
    this.updateCameras(deltaTime);
  }

  private updateRoadMarkers(deltaTime: number) {
    for (let i = this._roadMarkers.length - 1; i >= 0; i--) {
      this._roadMarkers[i].update(deltaTime, this._currentSpeed);

      if (this._roadMarkers[i].isObjectOutOfView()) {
        this._roadObjectsRemoved += 1;

        this._roadMarkers[i].destroy();
        this._roadMarkers.splice(i, 1);
      }

      if (this._roadObjectsRemoved >= 2) {
        this._roadObjectsRemoved = 0;

        if (!this._isCurveSpawnActive) {
          const randomValue = Math.random();

          if (randomValue <= GameInfo.CurvedRoadSpawnProbability) {
            this._isCurveSpawnActive = true;
            this._currentCurveMarkersCount = Math.floor(
              ExtensionFunctions.randomInRange(GameInfo.MinCurveMarkersCount, GameInfo.MaxCurveMarkersCount)
            );
            this._currentGapMultiplier = GameInfo.GapIncrementRate;

            if (Math.random() <= 0.5) {
              this._isLeftCurve = true;
            } else {
              this._isLeftCurve = false;
            }
          }
        }

        this.checkAndCreateCurvedRoads();
        this.spawnRoadBoundaryPair(this._currentRoadXPosition, GameInfo.WorldDefaultY, this._maxZPosition);
      }
    }
  }

  private updatePlayerMovement(deltaTime: number): void {
    this._playerController.update();
    this._player.update(deltaTime, this._currentSpeed, this._playerController.PlayerDirection);

    const centerRoadPosition = (this._roadMarkers[2].getObjectPosition().x + this._roadMarkers[3].getObjectPosition().x) / 2.0;
    this._mainCamera.x = Maths.Linear(this._mainCamera.x, centerRoadPosition, GameInfo.CameraMovementLerpAmount * deltaTime);

    this._mainCamera.y = GameInfo.CameraDefaultY;
    this._mainCamera.z = GameInfo.CameraDefaultZ;
  }

  private checkCollisions(): void {
    for (let i = 0; i < this._roadMarkers.length; i++) {
      const worldObject = this._roadMarkers[i];

      const position = worldObject.getObjectPosition();
      const screenPosition = worldObject.getUnProjectedVector();
      this._mainCamera.project(position, screenPosition);
      worldObject.setUnProjectedVector(screenPosition);

      if (this._carRectangle.contains(screenPosition.x, screenPosition.y)) {
        this._playerLives -= 1;

        if (this._playerLives <= 0) {
          this.scene.switch(GameInfo.GameOverSceneName);
          (this.scene.get(GameInfo.GameOverSceneName) as GameOverScene).setGameOverScore(this._playerScore);
        } else {
          this._playerLivesDisplay.setText(`Lives: ${this._playerLives}`);

          this._cameraShaker.startShaking(0.5, 1, 0.3, 0);
          this.resetScreen();
        }
      }
    }
  }

  private updateCameras(deltaTime: number): void {
    const shakePosition = this._cameraShaker.update(deltaTime, this._mainCamera.x, this._mainCamera.y, this._mainCamera.z);

    if (this._playerController.PlayerDirection == PlayerDirection.Left) {
      this._lookAtLerp -= (this._currentSpeed + GameInfo.CameraRotationLerpAmount) * deltaTime;
    } else if (this._playerController.PlayerDirection == PlayerDirection.Right) {
      this._lookAtLerp += (this._currentSpeed + GameInfo.CameraRotationLerpAmount) * deltaTime;
    }

    this._mainCamera.setPosition(shakePosition.x, shakePosition.y, shakePosition.z);
    this._mainCamera.lookAt(this._mainCamera.x + this._lookAtLerp, 0, -GameInfo.CameraDefaultZ);
    this._mainCamera.update();
  }

  private updateOtherGameObjects(deltaTime: number): void {
    this._playerScoreDisplay.setText(`Score: ${Math.floor(this._playerScore)}`);
  }

  //#endregion

  //#region External Functions

  public resetScreen(resetLives: boolean = false) {
    this._currentRoadXPosition = 0;

    for (let i = 0; i < this._roadMarkers.length; i++) {
      this._roadMarkers[i].destroy();
    }
    this._roadMarkers.length = 0;

    this._player.setPlayerPosition(
      this._currentRoadXPosition,
      GameInfo.PlayerInitialYPosition,
      this._mainCamera.z + GameInfo.PlayerZCameraOffset
    );
    this._mainCamera.x = this._player.getPlayerPosition().x;
    this.createInitialRoadMarkers();

    if (resetLives) {
      this._playerLives = GameInfo.PlayerMaxLives;
      this._playerLivesDisplay.setText(`Lives: ${this._playerLives}`);
    }

    this._playerController.resetController();
  }

  //#endregion

  //#region Utility Functions

  private checkAndCreateCurvedRoads() {
    if (this._isCurveSpawnActive) {
      if (this._isLeftCurve) {
        this._currentRoadXPosition -= GameInfo.GapBetweenRoadMarker * this._currentGapMultiplier;
      } else {
        this._currentRoadXPosition += GameInfo.GapBetweenRoadMarker * this._currentGapMultiplier;
      }

      this._currentCurveMarkersCount -= 1;
      this._currentGapMultiplier += GameInfo.GapIncrementRate;
      this._currentGapMultiplier = Math.min(this._currentGapMultiplier, 1);

      if (this._currentCurveMarkersCount <= 0) {
        this._isCurveSpawnActive = false;
      }
    }
  }

  private spawnRoadBoundaryPair(x: number, y: number, z: number) {
    const leftMarker = new WorldObject3D(AssetManager.LineMarkerString, this._mainCamera);
    const rightMarker = new WorldObject3D(AssetManager.LineMarkerString, this._mainCamera);

    leftMarker.create(x - GameInfo.WorldRoadWidth / 2.0, y, z);
    rightMarker.create(x + GameInfo.WorldRoadWidth / 2.0, y, z);

    this._roadMarkers.push(leftMarker);
    this._roadMarkers.push(rightMarker);
  }

  //#endregion
}
