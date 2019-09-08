import { GameObjects, Scene, Types } from 'phaser';
import AssetManager from '../utils/AssetManager';
import GameInfo from '../utils/GameInfo';
import { WorldObject3D } from '../gameObjects/WorldObject3D';
import { Player } from '../gameObjects/Player';

export class MainScene extends Scene {
  private _roadMarkers: Array<WorldObject3D>;
  private _roadObjectsRemoved: number;
  private _maxZPosition: number;

  private _mainCamera: any; // 3D Camera
  private cameras3d: any; // Placeholder 3D Cameras

  private _player: Player;
  private _keyboardControls: Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({
      key: 'MainScene',
    });

    this._roadMarkers = [];
    this._roadObjectsRemoved = 0;
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

    this._keyboardControls = this.input.keyboard.createCursorKeys();
  }

  private createCamera(): void {
    this._mainCamera = this.cameras3d
      .add(80)
      .setPosition(0, 0, 300)
      .setPixelScale(32);
    // @ts-ignore
    this.scene.sys = this.scene.systems;
    this._mainCamera.setScene(this.scene);
  }

  private createInitialRoadMarkers(): void {
    const initialRoadMarkerCount = 30;
    for (let i = 0; i < initialRoadMarkerCount; i++) {
      this.spawnRoadBoundaryPair(0, GameInfo.WorldDefaultY, this._mainCamera.z - 20 - i * 10);
    }

    this._maxZPosition = this._mainCamera.z - initialRoadMarkerCount * 10;
  }

  private createPlayer(): void {
    this._player = new Player(AssetManager.WhitePixelString, this._mainCamera);
    this._player.create(0, 8, this._mainCamera.z - 10);
  }

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    this.updateRoadMarkers(deltaTime);
    this.updatePlayerMovement(deltaTime);

    this._mainCamera.update();
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

        this.spawnRoadBoundaryPair(0, GameInfo.WorldDefaultY, this._maxZPosition);
      }
    }
  }

  private updatePlayerMovement(deltaTime: number): void {
    this._player.update(deltaTime, this._keyboardControls);
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
