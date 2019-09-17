import { Scene, Types, Input, GameObjects, Math as Maths, Geom, Sound } from 'phaser';
import AssetManager from '../utils/AssetManager';
import GameInfo from '../utils/GameInfo';
import { WorldObject3D } from '../gameObjects/WorldObject3D';
import { Player } from '../gameObjects/player/Player';
import ExtensionFunctions from '../utils/ExtensionFunctions';
import { ObjectShaker } from '../common/ObjectShaker';
import { PlayerController, PlayerDirection } from '../gameObjects/player/PlayerController';
import { GameOverScene } from './GameOverScene';
import { ObjectBlinkerManager } from '../managers/ObjectBlinkerManager';
import { ScrollingBackgroundManager } from '../managers/ScrollingBackgroundManager';

export class MainScene extends Scene {
  private _testKey: Input.Keyboard.Key;
  private _keyboardCursorKeys: Types.Input.Keyboard.CursorKeys;

  private _scrollingBackground: ScrollingBackgroundManager;
  private _objectBlinkerManager: ObjectBlinkerManager;

  private _explosionSound: Sound.BaseSound;
  private _backgroundMusic: Sound.BaseSound;

  private _car: GameObjects.Sprite;
  private _carRectangle: Geom.Rectangle;
  private _prevControlDirection: PlayerDirection;

  private _roadMarkers: Array<WorldObject3D>;
  private _roads: Array<WorldObject3D>;
  private _currentGapMultiplier: number;
  private _roadObjectsRemoved: number;
  private _maxZPosition: number;

  private _isWetRoadActive: boolean;
  private _currentWetRoadCount;

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
    this._roads = [];
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
    this.load.image(AssetManager.CarTurnImageString, AssetManager.CarTurnImage);
    this.load.image(AssetManager.BaseRoadString, AssetManager.BaseRoad);

    this.load.audio(AssetManager.ExplosionAudioString, [AssetManager.ExplosionAudio]);
    this.load.audio(AssetManager.BackgroundMusicString, [AssetManager.BackgroundMusic]);

    this.load.script(AssetManager.WebFontString, AssetManager.WebFont);
  }

  create() {
    this.createCamera(); // This must be run first as everything depends on it
    this.createInitialRoadMarkers();
    this.createPlayer();
    this.createOtherSceneItem();
    this.createSounds();

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

    const totalRoads = initialRoadMarkerCount + 30;
    for (let i = 0; i < totalRoads; i++) {
      this.createAndAddRoad(this._currentRoadXPosition, GameInfo.RoadYDistance, this._mainCamera.z - 20 - i * GameInfo.GapBetweenRoads);
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

    //@ts-ignore
    window.WebFont.load({
      google: {
        families: [AssetManager.DefaultFontName],
      },
      active: () => {
        console.log('WebFont Loaded. MainScreen');

        this._playerScoreDisplay = this.add.text(10, 10, '', {
          fontFamily: AssetManager.DefaultFontName,
          fill: '#ffffff',
          fontSize: 40,
        });
        this._playerLivesDisplay = this.add.text(GameInfo.ScreenWidth - 110, 10, `Lives: ${this._playerLives}`, {
          fontFamily: AssetManager.DefaultFontName,
          fill: '#ffffff',
          fontSize: 40,
        });
      },
    });

    this._scrollingBackground = new ScrollingBackgroundManager(this);
    this._scrollingBackground.create(AssetManager.BackgroundString);

    this._objectBlinkerManager = new ObjectBlinkerManager();
    this._objectBlinkerManager.create();
  }

  private createSounds(): void {
    this._explosionSound = this.sound.add(AssetManager.ExplosionAudioString, {
      volume: 0.5,
    });

    this._backgroundMusic = this.sound.add(AssetManager.BackgroundMusicString, {
      loop: true,
      volume: 0.7,
    });
    this._backgroundMusic.play();
  }

  //#endregion

  //#region Update

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    if (this._keyboardCursorKeys.space.isDown) {
      this._playerScore += deltaTime * GameInfo.ScoreIncrementRate;
      this._currentSpeed += GameInfo.ScoreIncrementRate * deltaTime;
      this._currentSpeed = Math.min(this._currentSpeed, GameInfo.WorldMovementMaxSpeed);

      this.updateRoadMarkers(deltaTime);
      this.updateRoads(deltaTime);
      this.updatePlayerMovement(deltaTime);
      // this.checkCollisions();
      this.updateCameras(deltaTime);
      this.updateOtherGameObjects(deltaTime);

      this._objectBlinkerManager.update(deltaTime);
      this._scrollingBackground.update(deltaTime, this._mainCamera.x);
    }
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

  private updateRoads(deltaTime: number): void {
    let playerTouchedWetRoad = false;

    for (let i = this._roads.length - 1; i >= 0; i--) {
      const road = this._roads[i];
      road.update(deltaTime, this._currentSpeed);

      const position = road.getObjectPosition();
      const screenPosition = road.getUnProjectedVector();
      this._mainCamera.project(position, screenPosition);
      road.setUnProjectedVector(screenPosition);

      if (this._carRectangle.contains(screenPosition.x, screenPosition.y)) {
        playerTouchedWetRoad = true;
      }

      if (road.isObjectOutOfView()) {
        this._roads[i].destroy();
        this._roads.splice(i, 1);

        // Randomly Spawn Wet Roads
        if (!this._isWetRoadActive) {
          const randomNumber = Math.random();
          if (randomNumber <= GameInfo.WetRoadSpawnProbability) {
            this._isWetRoadActive = true;
            this._currentWetRoadCount = GameInfo.WetRoadCount;
          }
        }

        if (this._isWetRoadActive) {
          this._currentWetRoadCount -= 1;

          if (this._currentWetRoadCount <= 0) {
            this._isWetRoadActive = false;
          }
        }

        this.createAndAddRoad(this._currentRoadXPosition, GameInfo.RoadYDistance, this._maxZPosition, this._isWetRoadActive);
      }
    }

    this._playerController.setControlFlippedState(playerTouchedWetRoad);
  }

  private updatePlayerMovement(deltaTime: number): void {
    this._playerController.update();
    this._player.update(deltaTime, this._currentSpeed, this._playerController.PlayerDirection);

    const centerRoadPosition = (this._roadMarkers[2].getObjectPosition().x + this._roadMarkers[3].getObjectPosition().x) / 2.0;
    this._mainCamera.x = Maths.Linear(this._mainCamera.x, centerRoadPosition, GameInfo.CameraMovementLerpAmount * deltaTime);

    this._mainCamera.y = GameInfo.CameraDefaultY;
    this._mainCamera.z = GameInfo.CameraDefaultZ;

    if (this._prevControlDirection !== this._playerController.PlayerDirection) {
      this._car.flipX = false;

      if (this._playerController.PlayerDirection === PlayerDirection.Left) {
        this._car.setTexture(AssetManager.CarTurnImageString);
        this._car.flipX = true;
      } else if (this._playerController.PlayerDirection === PlayerDirection.Right) {
        this._car.setTexture(AssetManager.CarTurnImageString);
      } else {
        this._car.setTexture(AssetManager.CarImageString);
      }
    }

    this._prevControlDirection = this._playerController.PlayerDirection;
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
          this.cleanUpAndSwitchScene();
        } else {
          this._playerLivesDisplay.setText(`Lives: ${this._playerLives}`);
          this._cameraShaker.startShaking(0.5, 1, 0.3, 0);
          this.resetScreen();
        }

        this._objectBlinkerManager.addItemToFlash(this._car, GameInfo.PlayerBlinkRate, GameInfo.PlayerBlinkCount, false);

        this._explosionSound.play();
      }
    }
  }

  private updateCameras(deltaTime: number): void {
    const shakePosition = this._cameraShaker.update(deltaTime, this._mainCamera.x, this._mainCamera.y, this._mainCamera.z);

    if (this._playerController.PlayerDirection === PlayerDirection.Left) {
      this._lookAtLerp -= (this._currentSpeed + GameInfo.CameraRotationLerpAmount) * deltaTime;
    } else if (this._playerController.PlayerDirection === PlayerDirection.Right) {
      this._lookAtLerp += (this._currentSpeed + GameInfo.CameraRotationLerpAmount) * deltaTime;
    }

    this._mainCamera.setPosition(shakePosition.x, shakePosition.y, shakePosition.z);
    this._mainCamera.lookAt(this._mainCamera.x + this._lookAtLerp, 0, -GameInfo.CameraDefaultZ);
    this._mainCamera.update();
  }

  private updateOtherGameObjects(deltaTime: number): void {
    this._playerScoreDisplay && this._playerScoreDisplay.setText(`Score: ${Math.floor(this._playerScore)}`);
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
    this._objectBlinkerManager.reset();
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

  private createAndAddRoad(x: number, y: number, z: number, isWetRoad: boolean = false) {
    const road = new WorldObject3D(AssetManager.BaseRoadString, this._mainCamera);
    road.create(x, y, z);
    road.setSize(30, 10);
    road.setData({ isWetRoad });

    if (isWetRoad) {
      road.setTint(0xff0000);
    }

    this._roads.push(road);
  }

  private cleanUpAndSwitchScene() {
    this.scene.switch(GameInfo.GameOverSceneName);
    (this.scene.get(GameInfo.GameOverSceneName) as GameOverScene).setGameOverScore(this._playerScore);
  }

  //#endregion
}
