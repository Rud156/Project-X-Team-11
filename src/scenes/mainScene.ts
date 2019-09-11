import { Scene, Types, Input } from 'phaser';
import AssetManager from '../utils/AssetManager';
import GameInfo from '../utils/GameInfo';
import { WorldObject3D } from '../gameObjects/WorldObject3D';
import { Player } from '../gameObjects/player/Player';
import ExtensionFunctions from '../utils/ExtensionFunctions';
import CollisionUtils from '../utils/CollisionUtils';
import { ObjectShaker } from '../camera/ObjectShaker';
import { PlayerController } from '../gameObjects/player/PlayerController';

export class MainScene extends Scene {
  private _testKey: Input.Keyboard.Key;

  private _roadMarkers: Array<WorldObject3D>;
  private _roadObjectsRemoved: number;
  private _maxZPosition: number;

  private _mainCamera: any; // 3D Camera
  private cameras3d: any; // Placeholder 3D Cameras
  private _cameraShaker: ObjectShaker;

  private _player: Player;
  private _playerController: PlayerController;

  private _isCurveSpawnActive: boolean;
  private _currentCurveMarkersCount: number;
  private _isLeftCurve: boolean;

  private _currentRoadXPosition: number;

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
  }

  create() {
    this.createCamera(); // This must be run first as everything depends on it
    this.createInitialRoadMarkers();
    this.createPlayer();

    this._testKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.X);
  }

  private createCamera(): void {
    this._mainCamera = this.cameras3d
      .add(80)
      .setPosition(this._currentRoadXPosition, 0, 300)
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
    this._player.create(this._currentRoadXPosition, 8, this._mainCamera.z - 10);

    this._playerController = new PlayerController(this.input);
  }

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    if (Input.Keyboard.JustDown(this._testKey)) {
      this._cameraShaker.startShaking(0.5, 3);
    }

    this.updateRoadMarkers(deltaTime);
    this.updatePlayerMovement(deltaTime);
    // this.checkCollisions(); // TODO: UnComment Later On...
    this.updateCameras(deltaTime);
  }

  private updateRoadMarkers(deltaTime: number) {
    for (let i = this._roadMarkers.length - 1; i >= 0; i--) {
      this._roadMarkers[i].update(deltaTime);

      if (this._roadMarkers[i].isObjectOutOfView()) {
        this._roadObjectsRemoved += 1;

        this._roadMarkers[i].destroy();
        this._roadMarkers.splice(i, 1);
      }

      if (this._roadObjectsRemoved >= 2) {
        this._roadObjectsRemoved = 0;

        // TODO: This is a very hacky method to spawn curved path
        // Need to change this later on...
        if (!this._isCurveSpawnActive) {
          const randomValue = Math.random();

          if (randomValue <= GameInfo.CurvedRoadSpawnProbability) {
            this._isCurveSpawnActive = true;
            this._currentCurveMarkersCount = Math.floor(
              ExtensionFunctions.randomInRange(GameInfo.MinCurveMarkersCount, GameInfo.MaxCurveMarkersCount)
            );

            if (Math.random() <= 0.5) {
              this._isLeftCurve = true;
            } else {
              this._isLeftCurve = false;
            }
          }
        }

        if (this._isCurveSpawnActive) {
          if (this._isLeftCurve) {
            this._currentRoadXPosition -= GameInfo.GapBetweenRoadMarker;
          } else {
            this._currentRoadXPosition += GameInfo.GapBetweenRoadMarker;
          }

          this._currentCurveMarkersCount -= 1;

          if (this._currentCurveMarkersCount <= 0) {
            this._isCurveSpawnActive = false;
          }
        }

        this.spawnRoadBoundaryPair(this._currentRoadXPosition, GameInfo.WorldDefaultY, this._maxZPosition);
      }
    }
  }

  private updatePlayerMovement(deltaTime: number): void {
    this._playerController.update();

    this._player.update(deltaTime, this._playerController.PlayerDirection);
    this._mainCamera.x = this._player.getPlayerPosition().x;
  }

  private checkCollisions(): void {
    for (let i = 0; i < this._roadMarkers.length; i++) {
      const worldObject = this._roadMarkers[i];

      if (
        CollisionUtils.checkOverlappingCollision(
          this._player.getPlayerPosition(),
          worldObject.getObjectPosition(),
          this._player.getPlayerSize(),
          worldObject.getObjectSize(),
          1
        )
      ) {
        this.scene.switch(GameInfo.GameOverSceneName);
      }
    }
  }

  private updateCameras(deltaTime: number): void {
    const shakePosition = this._cameraShaker.update(deltaTime, this._mainCamera.x, this._mainCamera.y, this._mainCamera.z);

    // TODO: Find a better way to do this...
    if (!this._cameraShaker.IsShakingActive()) {
      shakePosition.y = 0;
      shakePosition.z = 300;
    }

    this._mainCamera.setPosition(shakePosition.x, shakePosition.y, shakePosition.z);
    this._mainCamera.update();
  }

  private spawnRoadBoundaryPair(x: number, y: number, z: number) {
    const leftMarker = new WorldObject3D(AssetManager.LineMarkerString, this._mainCamera);
    const rightMarker = new WorldObject3D(AssetManager.LineMarkerString, this._mainCamera);

    leftMarker.create(x - GameInfo.WorldRoadWidth / 2.0, y, z);
    rightMarker.create(x + GameInfo.WorldRoadWidth / 2.0, y, z);

    this._roadMarkers.push(leftMarker);
    this._roadMarkers.push(rightMarker);
  }
}
