// Window Size
const ScreenWidth = 800;
const ScreenHeight = 800;
const HalfScreenWidth = ScreenWidth / 2.0;
const HalfScreenHeight = ScreenHeight / 2.0;

// World Info
const WorldMovementSpeed = 100;
const WorldMovementMaxSpeed = 150;
const WorldRoadWidth = 70;
const WorldDefaultY = 20;
const DistanceRemoveBehindCamera = 5;
const SpeedIncrementRate = 1;
const CrashWaitDelay = 3;

// Player
const PlayerMaxLives = 3;
const PlayerInitialYPosition = 20;
const PlayerZCameraOffset = -10;
const PlayerBlinkRate = 14;
const PlayerBlinkCount = 7;

// Animations
const ScreenFlashCount = 3;
const ScreenFlashRate = 7;
const ExplosionAnimationSize = 500;

// Collision
const CheckCollisionZLimit = 3;

// Road
const CurvedRoadSpawnProbability = 0.05;
const MinCurveMarkersCount = 20;
const MaxCurveMarkersCount = 30;
const GapBetweenRoadMarker = 10;
const GapIncrementRate = 0.1;
const RoadYDistance = 50;
const GapBetweenRoads = 5;
const WetRoadCount = 40;
const WetRoadSpawnProbability = 0.05;
const WetRoadMarkerDistanceFromRoad = 30;

// Scoring
const ScoreIncrementRate = 10;

// Camera
const CameraDefaultY = 0;
const CameraDefaultZ = 300;
const CameraRotationLerpAmount = 750;
const CameraSkidLerpAmount = 2500;
const CameraMovementLerpAmount = 7;

// Scrolling Background
const ScrollingBackgroundSpeed = 50;
const ScrollingBackgroundCount = 3;

// Scenes
const HomeSceneName = 'HomeScene';
const MainSceneName = 'MainScene';
const GameOverSceneName = 'GameOverScene';

export default {
  ScreenWidth,
  ScreenHeight,
  HalfScreenWidth,
  HalfScreenHeight,

  WorldMovementSpeed,
  WorldMovementMaxSpeed,
  WorldRoadWidth,
  WorldDefaultY,
  DistanceRemoveBehindCamera,
  SpeedIncrementRate,
  CrashWaitDelay,

  PlayerMaxLives,
  PlayerInitialYPosition,
  PlayerZCameraOffset,
  PlayerBlinkRate,
  PlayerBlinkCount,

  ScreenFlashCount,
  ScreenFlashRate,
  ExplosionAnimationSize,

  CheckCollisionZLimit,

  CurvedRoadSpawnProbability,
  MinCurveMarkersCount,
  MaxCurveMarkersCount,
  GapBetweenRoadMarker,
  GapIncrementRate,
  RoadYDistance,
  GapBetweenRoads,
  WetRoadCount,
  WetRoadSpawnProbability,
  WetRoadMarkerDistanceFromRoad,

  ScoreIncrementRate,

  CameraDefaultY,
  CameraDefaultZ,
  CameraRotationLerpAmount,
  CameraMovementLerpAmount,
  CameraSkidLerpAmount,

  ScrollingBackgroundSpeed,
  ScrollingBackgroundCount,

  HomeSceneName,
  MainSceneName,
  GameOverSceneName,
};
