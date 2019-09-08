import { GameObjects, Scene, Input } from 'phaser';
import { WorldObject } from '../gameObjects/WorldObject';
import AssetManager from '../utils/AssetManager';
import GameInfo from '../utils/GameInfo';

export class MainScene extends Scene {
  private _roadMarkers: Array<WorldObject>;
  private _roadObjectsRemoved: number;

  private _playerCar: GameObjects.Sprite;

  constructor() {
    super({
      key: 'MainScene',
    });

    this._roadMarkers = [];
    this._roadObjectsRemoved = 0;
  }

  preload(): void {
    this.load.image(AssetManager.LineMarkerString, AssetManager.LineMarker);
  }

  create() {
    const initialRoadMarkerCount = Math.floor(GameInfo.HalfScreenWidth / 10.0);
    for (let i = 0; i < initialRoadMarkerCount; i++) {
      this.spawnRoadBoundaryPair(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, GameInfo.HalfScreenWidth - i * 10);
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
        this._roadObjectsRemoved = 0;
        this.spawnRoadBoundaryPair(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, GameInfo.HalfScreenWidth);
      }
    }
  }

  private spawnRoadBoundaryPair(x: number, y: number, z: number) {
    const roadBoundaryLeft = new WorldObject(AssetManager.LineMarkerString, this);
    const roadBoundaryRight = new WorldObject(AssetManager.LineMarkerString, this);

    roadBoundaryLeft.setup(x - GameInfo.WorldRoadWidth / 2.0, y, z);
    roadBoundaryRight.setup(x + GameInfo.WorldRoadWidth / 2.0, y, z);

    this._roadMarkers.push(roadBoundaryLeft);
    this._roadMarkers.push(roadBoundaryRight);
  }
}
