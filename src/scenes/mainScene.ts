import { GameObjects, Scene } from 'phaser';

export class MainScene extends Scene {
  private phaserSprite: GameObjects.Sprite;

  constructor() {
    super({
      key: 'MainScene',
    });
  }

  preload(): void {
    this.load.image('logo', './src/assets/phaser.png');
  }

  create(): void {
    this.phaserSprite = this.add.sprite(400, 300, 'logo');
  }
}
