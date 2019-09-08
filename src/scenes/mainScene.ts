import { GameObjects, Scene, Input } from 'phaser';
import AssetManager from '../utils/AssetManager';
import GameInfo from '../utils/GameInfo';
import { WorldObject3D } from '../gameObjects/WorldObject3D';

export class MainScene extends Scene {
  private _roadMarkers: Array<WorldObject3D>;
  private _roadObjectsRemoved: number;

  private _mainCamera: any; // 3D Camera
  private cameras3d: any; // Placeholder 3D Cameras

  private _playerCar: GameObjects.Sprite;

  constructor() {
    super({
      key: 'MainScene',
    });

    this._roadMarkers = [];
    this._roadObjectsRemoved = 0;
  }

  preload(): void {
    this.load.scenePlugin('Camera3DPlugin', './lib/camera3d.min.js', 'Camera3DPlugin', 'cameras3d');
    this.load.image(AssetManager.LineMarkerString, AssetManager.LineMarker);
  }

  create() {
    this._mainCamera = this.cameras3d
      .add(80)
      .setPosition(0, 0, 300)
      .setPixelScale(200);

    const initialRoadMarkerCount = Math.floor(GameInfo.HalfScreenWidth / 10.0);
    for (let i = 0; i < initialRoadMarkerCount; i++) {
      this.spawnRoadBoundaryPair(0, GameInfo.WorldDefaultY, this._mainCamera.z - 20 - i * 10);
    }
  }

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    for (let i = this._roadMarkers.length - 1; i >= 0; i--) {
      this._roadMarkers[i].update(deltaTime);

      if (this._roadMarkers[i].isObjectOutOfView()) {
        this._roadObjectsRemoved += 1;

        this._roadMarkers[i].destroy();
        this._roadMarkers.splice(i, 1);
      }

      if (this._roadObjectsRemoved >= 2) {
        this._roadObjectsRemoved += 0;

        this.spawnRoadBoundaryPair(0, GameInfo.WorldDefaultY, GameInfo.ScreenWidth);
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
}
