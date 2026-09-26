import Phaser from 'phaser';

import {
  calculateLaunchVelocity,
  FIRST_MINION_DISTANCE,
  LAUNCH_GRAVITY,
  maximumSlingPull,
  MINION_WAVE_SPACING,
  NEXUS_DISTANCE,
  type LaunchFrame,
  type LaunchGameState,
} from '../../core/launch/launch-game';

export const LAUNCH_VIEW_WIDTH = 960;
export const LAUNCH_VIEW_HEIGHT = 540;
const GROUND_Y = 438;
const START_X = 220;
const START_Y = GROUND_Y - 28;
const WORLD_WIDTH = START_X + NEXUS_DISTANCE + 320;

export interface LaunchSceneCallbacks {
  readonly advance: (deltaMs: number) => LaunchFrame;
  readonly beginAim: () => boolean;
  readonly throw: (pullX: number, pullY: number) => void;
  readonly slam: () => void;
  readonly state: () => LaunchGameState;
}

class NexusLaunchScene extends Phaser.Scene {
  private teemo?: Phaser.GameObjects.Container;
  private aimGraphic?: Phaser.GameObjects.Graphics;
  private readonly minions = new Map<number, Phaser.GameObjects.Container>();
  private dragPointerId: number | null = null;
  private dragOrigin: { readonly x: number; readonly y: number } | null = null;
  private pull = { x: 0, y: 0 };
  private displayPull = { x: 0, y: 0 };
  private launchOffset = { x: 0, y: 0 };

  constructor(private readonly callbacks: LaunchSceneCallbacks) {
    super('nexus-launch');
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, LAUNCH_VIEW_HEIGHT);
    this.add.rectangle(WORLD_WIDTH / 2, 215, WORLD_WIDTH, 430, 0xaee8da);
    this.add.rectangle(WORLD_WIDTH / 2, 365, WORLD_WIDTH, 150, 0x80bd73);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 45, WORLD_WIDTH, 105, 0xb7a677);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y - 6, WORLD_WIDTH, 18, 0x78a94b);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 20, WORLD_WIDTH, 5, 0xe2d5aa);

    for (let x = 120; x < WORLD_WIDTH; x += 360) {
      this.add.ellipse(x, 342, 145, 44, x % 720 === 120 ? 0x6caa70 : 0x75b07a);
      this.add.circle(x + 95, 318, 17, 0x467e52);
      this.add.rectangle(x + 95, 353, 8, 43, 0x72543a);
      this.add.rectangle(x + 210, GROUND_Y - 15, 22, 16, 0xe9dcae);
      this.add.circle(x + 208, GROUND_Y - 25, 7, 0x75b8d9);
    }

    this.drawNexus();
    this.drawLauncher();
    this.teemo = this.drawTeemo();
    this.aimGraphic = this.add.graphics().setDepth(4.5);
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerup', this.handlePointerUp, this);
    this.input.on('pointerupoutside', this.handlePointerUp, this);
    this.input.keyboard?.on('keydown-SPACE', this.callbacks.slam, this);
  }

  update(_time: number, deltaMs: number): void {
    const frame = this.callbacks.advance(deltaMs);
    const state = frame.state;
    const run = state.run;
    const inFlight = run.phase === 'flying' || run.phase === 'won';
    const easing = 1 - Math.exp(-Math.min(deltaMs, 50) / 36);
    const targetPull = run.phase === 'aiming' ? this.pull : { x: 0, y: 0 };
    this.displayPull.x += (targetPull.x - this.displayPull.x) * easing;
    this.displayPull.y += (targetPull.y - this.displayPull.y) * easing;
    const recoil = Math.exp(-Math.min(deltaMs, 50) / 110);
    this.launchOffset.x *= recoil;
    this.launchOffset.y *= recoil;

    const worldX = inFlight
      ? START_X + run.distance + this.launchOffset.x
      : START_X - this.displayPull.x;
    const worldY = inFlight
      ? START_Y - run.height + this.launchOffset.y
      : START_Y + this.displayPull.y;
    const cameraTarget = inFlight ? Math.max(0, START_X + run.distance - 330) : 0;
    this.cameras.main.scrollX = inFlight
      ? this.cameras.main.scrollX + (cameraTarget - this.cameras.main.scrollX) * easing
      : 0;
    this.teemo?.setPosition(worldX, worldY);
    this.teemo?.setRotation(run.phase === 'flying' ? Math.sin(run.elapsedMs / 85) * 0.09 : 0);
    this.aimGraphic?.clear();
    this.drawElasticCords(START_X - this.displayPull.x, START_Y + this.displayPull.y);
    if (run.phase === 'aiming') this.drawAimGuide(state);

    this.renderMinions(state);
    frame.smashed.forEach((impact) =>
      this.showImpact(
        START_X + FIRST_MINION_DISTANCE + impact.index * MINION_WAVE_SPACING,
        impact.gold,
      ),
    );
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const phase = this.callbacks.state().run.phase;
    if (phase === 'flying') {
      this.callbacks.slam();
      return;
    }
    if (phase === 'aiming') {
      return;
    }
    if (Math.hypot(pointer.x - START_X, pointer.y - START_Y) > 94) {
      return;
    }
    if (!this.callbacks.beginAim()) {
      return;
    }

    this.dragPointerId = pointer.id;
    this.dragOrigin = { x: pointer.x, y: pointer.y };
    this.pull = { x: 0, y: 0 };
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.dragPointerId !== pointer.id || !this.dragOrigin || !pointer.isDown) {
      return;
    }
    this.updatePull(pointer.x, pointer.y);
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.dragPointerId !== pointer.id || !this.dragOrigin) {
      return;
    }

    this.updatePull(pointer.x, pointer.y);
    this.dragPointerId = null;
    this.dragOrigin = null;
    this.launchOffset = { x: -this.pull.x, y: this.pull.y };
    this.callbacks.throw(this.pull.x, this.pull.y);
    this.pull = { x: 0, y: 0 };
  }

  private updatePull(pointerX: number, pointerY: number): void {
    if (!this.dragOrigin) {
      return;
    }
    const x = Math.max(0, this.dragOrigin.x - pointerX);
    const y = pointerY - this.dragOrigin.y;
    const length = Math.hypot(x, y);
    const maximum = maximumSlingPull(this.callbacks.state().upgrades);
    const scale = length > maximum ? maximum / length : 1;
    this.pull = { x: x * scale, y: y * scale };
  }

  private renderMinions(state: LaunchGameState): void {
    const visible = new Set<number>();
    const firstIndex = state.run.phase === 'flying' ? state.run.nextMinionIndex : 0;

    for (let index = firstIndex; index < firstIndex + 8; index += 1) {
      const worldX = FIRST_MINION_DISTANCE + index * MINION_WAVE_SPACING;
      if (worldX > NEXUS_DISTANCE) {
        break;
      }

      visible.add(index);
      if (!this.minions.has(index)) {
        this.minions.set(index, this.drawMinion(index, START_X + worldX));
      }
    }

    for (const [index, minion] of this.minions) {
      if (!visible.has(index)) {
        minion.destroy(true);
        this.minions.delete(index);
      }
    }
  }

  private drawLauncher(): void {
    const sling = this.add.graphics().setDepth(4);
    sling.fillStyle(0x765236, 1);
    sling.fillRoundedRect(START_X - 20, GROUND_Y - 16, 9, 45, 4);
    sling.fillRoundedRect(START_X + 27, GROUND_Y - 16, 9, 45, 4);
    sling.fillStyle(0x9d7549, 1);
    sling.fillRoundedRect(START_X - 30, GROUND_Y + 19, 76, 12, 5);
  }

  private drawElasticCords(teemoX: number, teemoY: number): void {
    const graphics = this.aimGraphic;
    if (!graphics) {
      return;
    }

    const stretch = Math.hypot(this.displayPull.x, this.displayPull.y);
    const sag = Math.max(0, 14 - stretch * 0.1);
    graphics.lineStyle(5, stretch > 80 ? 0x74432b : 0x886447, 0.95);
    this.drawCable(graphics, START_X - 16, GROUND_Y - 12, teemoX - 8, teemoY, sag);
    this.drawCable(graphics, START_X + 28, GROUND_Y - 12, teemoX + 8, teemoY, sag);
    graphics.fillStyle(0x69422f, 1);
    graphics.fillCircle(teemoX, teemoY + 3, 8);
  }

  private drawCable(
    graphics: Phaser.GameObjects.Graphics,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sag: number,
  ): void {
    const controlX = (startX + endX) / 2;
    const controlY = (startY + endY) / 2 + sag;
    graphics.beginPath();
    graphics.moveTo(startX, startY);
    for (let segment = 1; segment <= 10; segment += 1) {
      const t = segment / 10;
      const inverse = 1 - t;
      graphics.lineTo(
        inverse * inverse * startX + 2 * inverse * t * controlX + t * t * endX,
        inverse * inverse * startY + 2 * inverse * t * controlY + t * t * endY,
      );
    }
    graphics.strokePath();
  }

  private drawAimGuide(state: LaunchGameState): void {
    const graphics = this.aimGraphic;
    if (!graphics) {
      return;
    }
    const velocity = calculateLaunchVelocity(state.upgrades, this.pull.x, this.pull.y);
    if (velocity.stretch < 8) {
      return;
    }

    graphics.fillStyle(0xffe2a0, 0.85);
    for (let frame = 6; frame <= 66; frame += 6) {
      const x = START_X + velocity.horizontalSpeed * frame * Math.pow(0.998, frame / 2);
      const y = START_Y - velocity.verticalSpeed * frame + 0.5 * LAUNCH_GRAVITY * frame * frame;
      if (y > GROUND_Y || x > START_X + NEXUS_DISTANCE) {
        break;
      }
      if (y >= 12) {
        graphics.fillCircle(x, y, Math.max(2, 4 - frame * 0.025));
      }
    }
  }

  private drawTeemo(): Phaser.GameObjects.Container {
    const parts: Phaser.GameObjects.GameObject[] = [
      this.add.ellipse(0, 13, 33, 40, 0x447f48),
      this.add.circle(-10, -16, 5, 0xe8c795),
      this.add.circle(10, -16, 5, 0xe8c795),
      this.add.circle(0, -10, 18, 0xf0c995),
      this.add.ellipse(0, -25, 48, 15, 0x33854f),
      this.add.triangle(0, -37, 40, 28, 0x398c4f),
      this.add.triangle(14, -49, 20, 27, 0xe45452),
      this.add.circle(-7, -12, 6, 0x382d2a),
      this.add.circle(7, -12, 6, 0x382d2a),
      this.add.circle(-7, -12, 2, 0xeff4d5),
      this.add.circle(7, -12, 2, 0xeff4d5),
      this.add.rectangle(0, -2, 9, 2, 0x805647),
      this.add.rectangle(18, 13, 27, 5, 0x80502c).setRotation(-0.5),
      this.add.circle(30, 6, 4, 0xb08b4d),
      this.add.ellipse(-7, 35, 14, 7, 0x613f38),
      this.add.ellipse(9, 35, 14, 7, 0x613f38),
    ];

    return this.add.container(START_X, START_Y, parts).setDepth(5);
  }

  private drawMinion(index: number, x: number): Phaser.GameObjects.Container {
    const team = index % 2 === 0 ? 0x3988cf : 0xd34653;
    const siege = index % 5 === 4;
    const bodyWidth = siege ? 46 : 35;
    const parts: Phaser.GameObjects.GameObject[] = [
      this.add.ellipse(0, 2, bodyWidth, 35, team),
      this.add.ellipse(0, -11, 27, 22, 0xf1d197),
      this.add.triangle(0, -25, 37, 22, team),
      this.add.circle(-6, -11, 3, 0x26323e),
      this.add.circle(6, -11, 3, 0x26323e),
      this.add.circle(-5, -12, 1, 0xf9f1d9),
      this.add.circle(7, -12, 1, 0xf9f1d9),
      this.add.rectangle(-8, 23, 5, 13, 0x5c4639),
      this.add.rectangle(8, 23, 5, 13, 0x5c4639),
    ];

    if (index % 3 === 1) {
      parts.push(this.add.rectangle(23, -5, 4, 31, 0x8f6e40));
      parts.push(this.add.triangle(23, -23, 10, 14, 0xffd773));
    }
    if (siege) {
      parts.push(this.add.rectangle(0, 24, 43, 5, 0x5f4a31));
      parts.push(this.add.circle(-15, 29, 6, 0x493c32));
      parts.push(this.add.circle(15, 29, 6, 0x493c32));
    }

    return this.add.container(x, GROUND_Y - 22, parts).setDepth(3);
  }

  private drawNexus(): void {
    const x = START_X + NEXUS_DISTANCE + 70;
    this.add.circle(x, GROUND_Y - 73, 78, 0xe3545a, 0.2);
    this.add.triangle(x, GROUND_Y - 98, 72, 122, 0xd73853).setStrokeStyle(3, 0xffd7bd);
    this.add.triangle(x, GROUND_Y - 100, 40, 72, 0xff7880);
    this.add.rectangle(x, GROUND_Y - 1, 116, 32, 0x8d4549);
    this.add
      .text(x, GROUND_Y + 19, 'NEXUS', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        color: '#fff0d3',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(6);
  }

  private showImpact(x: number, gold: number): void {
    const burst = this.add.circle(x, GROUND_Y - 30, 16, 0xffdf81, 0.85).setDepth(8);
    const label = this.add
      .text(x, GROUND_Y - 52, '+' + gold + ' gold', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#fff2bd',
        stroke: '#4c452f',
        strokeThickness: 3,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(9);

    this.tweens.add({
      targets: [burst, label],
      alpha: 0,
      y: '-=24',
      scale: 1.6,
      duration: 550,
      onComplete: () => {
        burst.destroy();
        label.destroy();
      },
    });
  }
}

export function createLaunchGame(
  parent: HTMLElement,
  callbacks: LaunchSceneCallbacks,
): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: LAUNCH_VIEW_WIDTH,
    height: LAUNCH_VIEW_HEIGHT,
    backgroundColor: '#aee8da',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [new NexusLaunchScene(callbacks)],
  });
}
