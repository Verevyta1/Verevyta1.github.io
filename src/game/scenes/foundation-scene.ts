import Phaser from 'phaser';

export const FOUNDATION_VIEW_WIDTH = 960;
export const FOUNDATION_VIEW_HEIGHT = 540;

class FoundationScene extends Phaser.Scene {
  constructor() {
    super('foundation');
  }

  create(): void {
    const core = this.add
      .circle(FOUNDATION_VIEW_WIDTH / 2, FOUNDATION_VIEW_HEIGHT / 2, 38, 0x526779)
      .setStrokeStyle(3, 0x263d50, 0.75);

    this.tweens.add({
      targets: core,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 1200,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });
  }
}

export function createFoundationGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: FOUNDATION_VIEW_WIDTH,
    height: FOUNDATION_VIEW_HEIGHT,
    backgroundColor: '#f4f6f8',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [FoundationScene],
  });
}
