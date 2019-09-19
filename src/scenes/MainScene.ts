import { Scene, Types, Input, GameObjects, Math as Maths, Geom, Sound, Animations, Time } from 'phaser';
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

enum MainSceneStatus {
  Running,
  Crashed,
}

export class MainScene extends Scene {
  private _testKey: Input.Keyboard.Key;
  private _keyboardCursorKeys: Types.Input.Keyboard.CursorKeys;

  private _scrollingBackground: ScrollingBackgroundManager;
  private _objectBlinkerManager: ObjectBlinkerManager;

  private _explosionAnimation: GameObjects.Sprite;
  private _screenFlasher: GameObjects.Sprite;

  private _explosionSound: Sound.BaseSound;
  private _backgroundMusic: Sound.BaseSound;
  private _skidSound: Sound.BaseSound;

  private _car: GameObjects.Sprite;
  private _carRectangle: Geom.Rectangle;
  private _prevControlDirection: PlayerDirection;
  private _carShaker: ObjectShaker;

  private _roadMarkers: Array<WorldObject3D>;
  private _roads: Array<WorldObject3D>;
  private _currentGapMultiplier: number;
  private _roadObjectsRemoved: number;
  private _maxZPosition: number;

  private _isWetRoadActive: boolean;
  private _currentWetRoadCount: number;
  private _wetRoadMarkers: Array<WorldObject3D>;
  private _playerTouchedWetRoad: boolean;

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

  private _curveGradient: number;
  private _maxCurveGradient: number;
  private _sharpCurveIndex: number;

  private _crashWaitDelay: number;
  private _mainSceneStatus: MainSceneStatus;
  private _lastWetRoadSpawnTime: number;

  //#region Creation

  constructor() {
    super({
      key: GameInfo.MainSceneName,
    });

    this._roadMarkers = [];
    this._roads = [];
    this._wetRoadMarkers = [];
    this._roadObjectsRemoved = 0;

    this._isCurveSpawnActive = false;
    this._currentCurveMarkersCount = 0;
    this._isLeftCurve = false;

    this._currentRoadXPosition = 0;
    this._lastWetRoadSpawnTime = 0;
    this._curveGradient = 1;
    this._maxCurveGradient = 0;
    this._sharpCurveIndex = 0;
  }

  preload(): void {
    this.load.scenePlugin('Camera3DPlugin', './lib/camera3d.js', 'Camera3DPlugin', 'cameras3d');

    this.load.image(AssetManager.LineMarkerString, AssetManager.LineMarker);
    this.load.image(AssetManager.WhitePixelString, AssetManager.WhitePixel);
    this.load.image(AssetManager.BackgroundString, AssetManager.Background);
    this.load.image(AssetManager.CarImageString, AssetManager.CarImage);
    this.load.image(AssetManager.CarTurnRightImageString, AssetManager.CarTurnRightImage);
    this.load.image(AssetManager.CarTurnLeftImageString, AssetManager.CarTurnLeftImage);
    this.load.image(AssetManager.RoadMarkerString, AssetManager.RoadMarker);
    this.load.image(AssetManager.BaseRoadString, AssetManager.BaseRoad);
    this.load.image(AssetManager.WetRoadMarkerString, AssetManager.WetRoadMarker);
    this.load.image(AssetManager.WetRoadString, AssetManager.WetRoad);
    this.load.spritesheet(AssetManager.ExplosionSpriteSheetString, AssetManager.ExplosionSpriteSheet, {
      frameWidth: 256,
    });

    this.load.audio(AssetManager.ExplosionAudioString, [AssetManager.ExplosionAudio]);
    this.load.audio(AssetManager.BackgroundMusicString, [AssetManager.BackgroundMusic]);
    this.load.audio(AssetManager.CarSkidAudioString, [AssetManager.CarSkidAudio]);

    this.load.script(AssetManager.WebFontString, AssetManager.WebFont);
  }

  create() {
    this.createCamera(); // This must be run first as everything depends on it
    this.createInitialRoadMarkers();
    this.createPlayer();
    this.createOtherSceneItem();
    this.createSounds();
    this.createAnimations();

    this._currentSpeed = GameInfo.WorldMovementSpeed;
    this._testKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.X);
    this._keyboardCursorKeys = this.input.keyboard.createCursorKeys();

    this.setMainSceneState(MainSceneStatus.Running);
    this._crashWaitDelay = GameInfo.CrashWaitDelay;
    this._lastWetRoadSpawnTime = this.time.now;
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

    this._car = this.add.sprite(GameInfo.HalfScreenWidth, GameInfo.ScreenHeight - 74, AssetManager.CarImageString);
    this._carRectangle = this._car.getBounds();
    const carRectangle = new Geom.Rectangle();

    const rectangleExpansion = 50;
    carRectangle.width = this._carRectangle.width + rectangleExpansion;
    carRectangle.height = this._carRectangle.height + rectangleExpansion;
    carRectangle.x = this._carRectangle.x;
    carRectangle.y = this._carRectangle.y;
    carRectangle.centerX = this._carRectangle.centerX;
    carRectangle.centerY = this._carRectangle.centerY;

    this._carRectangle = carRectangle;
    this._carShaker = new ObjectShaker();
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
          fontSize: 30,
        });
        this._playerLivesDisplay = this.add.text(GameInfo.ScreenWidth - 110, 10, `Lives: ${this._playerLives}`, {
          fontFamily: AssetManager.DefaultFontName,
          fill: '#ffffff',
          fontSize: 30,
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
      volume: 1,
    });

    this._skidSound = this.sound.add(AssetManager.CarSkidAudioString, {
      volume: 1,
    });

    this._backgroundMusic = this.sound.add(AssetManager.BackgroundMusicString, {
      loop: true,
      volume: 0.3,
    });
    this._backgroundMusic.play();
  }

  private createAnimations(): void {
    const explosionAnimation = this.anims.create({
      frameRate: 16,
      repeat: 0,
      key: AssetManager.ExplodeAnimKey,
      skipMissedFrames: true,
      frames: this.anims.generateFrameNumbers(AssetManager.ExplosionSpriteSheetString, {}),
    });

    this._explosionAnimation = this.add.sprite(
      GameInfo.HalfScreenWidth,
      GameInfo.ScreenHeight - 74,
      AssetManager.ExplosionSpriteSheetString
    );
    this._explosionAnimation.on(`animationcomplete-${AssetManager.ExplodeAnimKey}`, () => {
      this._explosionAnimation.setVisible(false);
    });
    this._explosionAnimation.setDisplaySize(GameInfo.ExplosionAnimationSize, GameInfo.ExplosionAnimationSize);
    this._explosionAnimation.setSize(GameInfo.ExplosionAnimationSize, GameInfo.ExplosionAnimationSize);
    this._explosionAnimation.setVisible(false);

    this._screenFlasher = this.add.sprite(GameInfo.HalfScreenWidth, GameInfo.HalfScreenHeight, AssetManager.WhitePixelString);
    this._screenFlasher.setDisplaySize(GameInfo.ScreenWidth, GameInfo.ScreenHeight);
    this._screenFlasher.setSize(GameInfo.ScreenWidth, GameInfo.ScreenHeight);
    this._screenFlasher.setVisible(false);
  }

  //#endregion

  //#region Update

  update(time: number, delta: number) {
    const deltaTime = delta / 1000.0;

    if (Phaser.Input.Keyboard.JustDown(this._testKey)) {
      // Do Nothing. Or use only for testing...
    }

    if (this._mainSceneStatus === MainSceneStatus.Running) {
      this._playerScore += deltaTime * GameInfo.ScoreIncrementRate;
      this._currentSpeed += GameInfo.ScoreIncrementRate * deltaTime;
      this._currentSpeed = Math.min(this._currentSpeed, GameInfo.WorldMovementMaxSpeed);

      this.updateRoadMarkers(deltaTime);
      this.updateRoads(deltaTime);
      this.updateWetRoadMarkers(deltaTime);
      this.updatePlayerMovement(deltaTime);
      this.checkCollisions();
      this.updateOtherGameObjects(deltaTime);
    } else if (this._mainSceneStatus === MainSceneStatus.Crashed) {
      this._crashWaitDelay -= deltaTime;
      if (this._crashWaitDelay <= 0) {
        this.cleanUpAndSwitchScene();
      }
    }

    this.updateCameras(deltaTime);
    this.updateCarShake(deltaTime);

    this._objectBlinkerManager.update(deltaTime);
    this._scrollingBackground.update(deltaTime, this._mainCamera.x);
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

            this._sharpCurveIndex = 1;
            this._maxCurveGradient = this._currentCurveMarkersCount / 2;
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
    this._playerTouchedWetRoad = false;

    for (let i = this._roads.length - 1; i >= 0; i--) {
      const road = this._roads[i];
      road.update(deltaTime, this._currentSpeed);

      if (road.getData().isWetRoad) {
        const roadPosition = road.getObjectPosition();
        if (roadPosition.z >= this._mainCamera.z - GameInfo.DistanceRemoveBehindCamera) {
          this._playerTouchedWetRoad = true;
        }
      }

      if (road.isObjectOutOfView()) {
        this._roads[i].destroy();
        this._roads.splice(i, 1);

        // Randomly Spawn Wet Roads
        if (!this._isWetRoadActive) {
          if (this.time.now - this._lastWetRoadSpawnTime > 5000) {
            this._lastWetRoadSpawnTime = this.time.now;
            this._isWetRoadActive = true;
            this._currentWetRoadCount = GameInfo.WetRoadCount;

            this.addWetRoadMarker(this._currentRoadXPosition, GameInfo.WorldDefaultY, this._maxZPosition);
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
  }

  private updateWetRoadMarkers(deltaTime: number) {
    for (let i = this._wetRoadMarkers.length - 1; i >= 0; i--) {
      const marker = this._wetRoadMarkers[i];
      marker.update(deltaTime, this._currentSpeed);

      if (marker.isObjectOutOfView()) {
        this._wetRoadMarkers[i].destroy();
        this._wetRoadMarkers.splice(i, 1);
      }
    }
  }

  private updatePlayerMovement(deltaTime: number): void {
    this._playerController.update();
    const road = this._roads[0];
    if (road.getData().isWetRoad) {
      this._player.update(deltaTime, this._currentSpeed, this._playerController.PlayerDirection, true);
      if (this._playerController.PlayerDirection !== PlayerDirection.None) {
        this._skidSound.play();
      }
    } else {
      this._player.update(deltaTime, this._currentSpeed, this._playerController.PlayerDirection, false);
    }

    if (this._prevControlDirection !== this._playerController.PlayerDirection) {
      if (this._playerController.PlayerDirection === PlayerDirection.Left) {
        this._car.setTexture(AssetManager.CarTurnLeftImageString);
      } else if (this._playerController.PlayerDirection === PlayerDirection.Right) {
        this._car.setTexture(AssetManager.CarTurnRightImageString);
      } else {
        this._car.setTexture(AssetManager.CarImageString);
      }
    }

    this._prevControlDirection = this._playerController.PlayerDirection;
  }

  private updateCarShake(deltaTime: number) {
    this._car.setPosition(GameInfo.HalfScreenWidth, GameInfo.ScreenHeight - 74);

    const shakePosition = this._carShaker.update(deltaTime, this._car.x, this._car.y, 0);
    this._car.setPosition(shakePosition.x, shakePosition.y, shakePosition.z);
  }

  private checkCollisions(): void {
    for (let i = 0; i < this._roadMarkers.length; i++) {
      const roadMarker = this._roadMarkers[i];

      const position = roadMarker.getObjectPosition();
      const screenPosition = roadMarker.getUnProjectedVector();
      const diffPosition = new Maths.Vector4(position.x, position.y + 3, position.z, position.w);
      this._mainCamera.project(diffPosition, screenPosition);
      roadMarker.setUnProjectedVector(screenPosition);

      if (this._carRectangle.contains(screenPosition.x, screenPosition.y)) {
        this._playerLives -= 1;

        this._cameraShaker.startShaking(1, 1, 1, 1);
        this._carShaker.startShaking(1, 10, 10, 0);

        this._playerController.resetController();

        if (this._playerLives <= 0) {
          this.setMainSceneState(MainSceneStatus.Crashed);
        } else {
          this._playerLivesDisplay.setText(`Lives: ${this._playerLives}`);
          this.resetScreen();
        }

        this._explosionAnimation.setVisible(true);
        this._explosionAnimation.play(AssetManager.ExplodeAnimKey);

        this._screenFlasher.setVisible(true);
        this._objectBlinkerManager.addItemToFlash(this._screenFlasher, GameInfo.ScreenFlashRate, GameInfo.ScreenFlashCount, false, true);

        this._objectBlinkerManager.addItemToFlash(this._car, GameInfo.PlayerBlinkRate, GameInfo.PlayerBlinkCount);
        this._explosionSound.play();
      }
    }
  }

  private updateCameras(deltaTime: number): void {
    const centerRoadPosition = (this._roadMarkers[2].getObjectPosition().x + this._roadMarkers[3].getObjectPosition().x) / 2.0;
    this._mainCamera.x = Maths.Linear(this._mainCamera.x, centerRoadPosition, GameInfo.CameraMovementLerpAmount * deltaTime);
    this._mainCamera.y = GameInfo.CameraDefaultY;
    this._mainCamera.z = GameInfo.CameraDefaultZ;

    const shakePosition = this._cameraShaker.update(deltaTime, this._mainCamera.x, this._mainCamera.y, this._mainCamera.z);
    const lerpAmount = this._playerTouchedWetRoad ? GameInfo.CameraSkidLerpAmount : GameInfo.CameraRotationLerpAmount;

    if (this._playerController.PlayerDirection === PlayerDirection.Left) {
      this._lookAtLerp -= (this._currentSpeed + lerpAmount) * deltaTime;
    } else if (this._playerController.PlayerDirection === PlayerDirection.Right) {
      this._lookAtLerp += (this._currentSpeed + lerpAmount) * deltaTime;
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

  public resetScreen(completeSceneReset: boolean = false) {
    this._currentRoadXPosition = 0;

    for (let i = 0; i < this._roadMarkers.length; i++) {
      this._roadMarkers[i].destroy();
    }
    this._roadMarkers.length = 0;

    for (let i = 0; i < this._roads.length; i++) {
      this._roads[i].destroy();
    }
    this._roads.length = 0;

    for (let i = 0; i < this._wetRoadMarkers.length; i++) {
      this._wetRoadMarkers[i].destroy();
    }
    this._wetRoadMarkers.length = 0;

    this._isWetRoadActive = false;
    this._isCurveSpawnActive = false;

    this._player.setPlayerPosition(
      this._currentRoadXPosition,
      GameInfo.PlayerInitialYPosition,
      this._mainCamera.z + GameInfo.PlayerZCameraOffset
    );

    this._lookAtLerp = 0;
    this._mainCamera.x = this._player.getPlayerPosition().x;
    this._mainCamera.lookAt(this._mainCamera.x + this._lookAtLerp, 0, -GameInfo.CameraDefaultZ);
    this._mainCamera.update();

    this.createInitialRoadMarkers();

    this._playerController.resetController();

    this._curveGradient = 1;
    this._maxCurveGradient = 0;
    this._sharpCurveIndex = 1;
    this._lastWetRoadSpawnTime = 0;

    if (completeSceneReset) {
      this._playerLives = GameInfo.PlayerMaxLives;
      this._playerLivesDisplay.setText(`Lives: ${this._playerLives}`);

      this._currentSpeed = GameInfo.WorldMovementSpeed;
      this._mainSceneStatus = MainSceneStatus.Running;

      this._crashWaitDelay = GameInfo.CrashWaitDelay;
      this._objectBlinkerManager.reset();

      this._playerScore = 0;
    }
  }

  //#endregion

  //#region Utility Functions

  private checkAndCreateCurvedRoads() {
    if (this._isCurveSpawnActive) {
      if (this._isLeftCurve) {
        this._currentRoadXPosition -= this._curveGradient;
      } else {
        this._currentRoadXPosition += this._curveGradient;
      }

      this._currentCurveMarkersCount -= 1;

      if (this._maxCurveGradient < this._currentCurveMarkersCount) {
        this._curveGradient += this._sharpCurveIndex;
      } else {
        this._curveGradient -= this._sharpCurveIndex;
      }

      if (this._currentCurveMarkersCount <= 0) {
        this._isCurveSpawnActive = false;
        this._curveGradient = 1;
        this._maxCurveGradient = 0;
      }
    }
  }

  private spawnRoadBoundaryPair(x: number, y: number, z: number) {
    const leftMarker = new WorldObject3D(AssetManager.RoadMarkerString, this._mainCamera);
    const rightMarker = new WorldObject3D(AssetManager.RoadMarkerString, this._mainCamera);

    leftMarker.create(x - GameInfo.WorldRoadWidth / 2.0, y, z);
    rightMarker.create(x + GameInfo.WorldRoadWidth / 2.0, y, z);

    leftMarker.setSize(10, 15);
    rightMarker.setSize(10, 15);

    this._roadMarkers.push(leftMarker);
    this._roadMarkers.push(rightMarker);
  }

  private addWetRoadMarker(x: number, y: number, z: number) {
    const leftWetRoadMarker = new WorldObject3D(AssetManager.WetRoadMarkerString, this._mainCamera);
    const rightWetRoadMarker = new WorldObject3D(AssetManager.WetRoadMarkerString, this._mainCamera);

    leftWetRoadMarker.create(x - GameInfo.WetRoadMarkerDistanceFromRoad - GameInfo.WorldRoadWidth / 2.0, y, z);
    rightWetRoadMarker.create(x + GameInfo.WetRoadMarkerDistanceFromRoad + GameInfo.WorldRoadWidth / 2.0, y, z);

    leftWetRoadMarker.flipX = true;

    leftWetRoadMarker.setSize(20, 20);
    rightWetRoadMarker.setSize(20, 20);

    this._wetRoadMarkers.push(leftWetRoadMarker);
    this._wetRoadMarkers.push(rightWetRoadMarker);
  }

  private createAndAddRoad(x: number, y: number, z: number, isWetRoad: boolean = false) {
    const road = new WorldObject3D(AssetManager.BaseRoadString, this._mainCamera);
    const wetRoad = new WorldObject3D(AssetManager.WetRoadString, this._mainCamera);

    road.create(x, y, z);
    road.setSize(30, 10);
    road.setData({ isWetRoad });

    this._roads.push(road);

    if (isWetRoad) {
      wetRoad.create(x, y, z);
      wetRoad.setSize(30, 10);
      wetRoad.setData(true);
      this._roads.push(wetRoad);
    }
  }

  private setMainSceneState(mainSceneStatus: MainSceneStatus) {
    this._mainSceneStatus = mainSceneStatus;
  }

  private cleanUpAndSwitchScene() {
    this.scene.switch(GameInfo.GameOverSceneName);
    (this.scene.get(GameInfo.GameOverSceneName) as GameOverScene).setGameOverScore(this._playerScore);

    this.resetScreen(true);
  }

  //#endregion
}
