// Window Size
const ScreenWidth = 800;
const ScreenHeight = 800;
const HalfScreenWidth = ScreenWidth / 2.0;
const HalfScreenHeight = ScreenHeight / 2.0;

// World Info
const WorldMovementSpeed = 100;
const WorldRoadWidth = 100;
const WorldDefaultY = 20;
const DistanceRemoveBehindCamera = 5;
const SpeedIncrementRate = 1;

// Player
const PlayerMaxLives = 3;
const PlayerInitialYPosition = 8;
const PlayerZCameraOffset = -10;

// Collision
const CheckCollisionZLimit = 3;

// Road
const CurvedRoadSpawnProbability = 0.05;
const MinCurveMarkersCount = 10;
const MaxCurveMarkersCount = 20;
const GapBetweenRoadMarker = 10;

// Scoring
const ScoreIncrementRate = 10;

// Camera
const CameraDefaultY = 0;
const CameraDefaultZ = 300;

// Scenes
const MainSceneName = 'MainScene';
const GameOverSceneName = 'GameOverScene';

export default {
  ScreenWidth,
  ScreenHeight,
  HalfScreenWidth,
  HalfScreenHeight,

  WorldMovementSpeed,
  WorldRoadWidth,
  WorldDefaultY,
  DistanceRemoveBehindCamera,
  SpeedIncrementRate,

  PlayerMaxLives,
  PlayerInitialYPosition,
  PlayerZCameraOffset,

  CheckCollisionZLimit,

  CurvedRoadSpawnProbability,
  MinCurveMarkersCount,
  MaxCurveMarkersCount,
  GapBetweenRoadMarker,

  ScoreIncrementRate,

  CameraDefaultY,
  CameraDefaultZ,

  MainSceneName,
  GameOverSceneName,
};
