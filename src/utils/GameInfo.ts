// Window Size
const ScreenWidth = 800;
const ScreenHeight = 800;
const HalfScreenWidth = ScreenWidth / 2.0;
const HalfScreenHeight = ScreenHeight / 2.0;

// World Info
const WorldMovementSpeed = 100;
const WorldRoadWidth = 80;
const WorldDefaultY = 20;

// Player Movement
const PlayerHorizontalSpeed = 100;

// Collision
const CheckCollisionLimit = 10;

// Road
const CurvedRoadSpawnProbability = 0.05;
const MinCurveMarkersCount = 10;
const MaxCurveMarkersCount = 20;
const GapBetweenRoadMarker = 10;

export default {
  ScreenWidth,
  ScreenHeight,
  HalfScreenWidth,
  HalfScreenHeight,

  WorldMovementSpeed,
  WorldRoadWidth,
  WorldDefaultY,

  PlayerHorizontalSpeed,

  CheckCollisionLimit,

  CurvedRoadSpawnProbability,
  MinCurveMarkersCount,
  MaxCurveMarkersCount,
  GapBetweenRoadMarker,
};
