import { Math as Maths } from 'phaser';
import GameInfo from './GameInfo';

const checkOverlappingCollision = (
  object1Position: Maths.Vector4,
  object2Position: Maths.Vector4,
  object1Size: Maths.Vector2,
  object2Size: Maths.Vector2,
  checkCollisionDirection: number = 0
): boolean => {
  if (checkCollisionDirection === 0 && Math.abs(object1Position.z - object2Position.z) > GameInfo.CheckCollisionZLimit) {
    return false;
  } else if (checkCollisionDirection === -1) {
    const diff = object2Position.z - object1Position.z;
    if (diff > GameInfo.CheckCollisionZLimit || diff < 0) {
      return false;
    }
  } else if (checkCollisionDirection === 1) {
    const diff = object1Position.z - object2Position.z;
    if (diff > GameInfo.CheckCollisionZLimit || diff < 0) {
      return false;
    }
  }

  const object1TopLeftCorner = new Maths.Vector2(object1Position.x - object1Size.x / 2.0, object1Position.y - object1Size.y / 2.0);
  const object1BottomRightCorner = new Maths.Vector2(object1Position.x + object1Size.x / 2.0, object1Position.y + object1Size.x / 2.0);

  const object2TopLeftCorner = new Maths.Vector2(object2Position.x - object2Size.x / 2.0, object2Position.y - object2Size.y / 2.0);
  const object2BottomRightCorner = new Maths.Vector2(object2Position.x + object2Size.x / 2.0, object2Position.y + object2Size.x / 2.0);

  let xCollided = false;
  let yCollided = false;

  // console.log(`1 Size: ${object1Size.x} ${object1Size.y}`);
  // console.log(`2 Size: ${object2Size.x} ${object2Size.y}`);
  // console.log(`1 Position: ${object1Position.x}, ${object1Position.y}, ${object1Position.z}`);
  // console.log(`2 Position: ${object2Position.x}, ${object2Position.y}, ${object2Position.z}`);

  if (object1TopLeftCorner.x >= object2TopLeftCorner.x && object1TopLeftCorner.x <= object2BottomRightCorner.x) {
    xCollided = true;
  } else if (object1BottomRightCorner.x >= object2TopLeftCorner.x && object1BottomRightCorner.x <= object2BottomRightCorner.x) {
    xCollided = true;
  }

  if (object1TopLeftCorner.y >= object2TopLeftCorner.y && object1TopLeftCorner.y <= object2BottomRightCorner.y) {
    yCollided = true;
  } else if (object1BottomRightCorner.y >= object2TopLeftCorner.y && object1BottomRightCorner.y <= object2BottomRightCorner.y) {
    yCollided = true;
  }

  if (xCollided && yCollided) {
    console.log(`1 Position: ${object1Position.x}, ${object1Position.y}, ${object1Position.z}`);
    console.log(`2 Position: ${object2Position.x}, ${object2Position.y}, ${object2Position.z}`);
  }

  return xCollided && yCollided;
};

export default {
  checkOverlappingCollision,
};
