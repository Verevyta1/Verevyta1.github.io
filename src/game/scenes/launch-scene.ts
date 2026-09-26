import Phaser from 'phaser';

import {
  FIRST_MINION_DISTANCE,
  isNexusUnlocked,
  MINION_WAVE_SPACING,
  NEXUS_DISTANCE,
  NEXUS_GATE_DISTANCE,
  type LaunchFrame,
  type LaunchGameState,
} from '../../core/launch/launch-game';

export const LAUNCH_VIEW_WIDTH = 960;
export const LAUNCH_VIEW_HEIGHT = 540;
const GROUND_Y = 438;
const START_X = 95;
const START_Y = GROUND_Y - 28;
const MAX_DRAG_X = 140;
const MAX_DRAG_Y = 70;

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
  private nexusBarrier?: Phaser.GameObjects.Container;
  private readonly minions = new Map<number, Phaser.GameObjects.Container>();
  private dragPointerId: number | null = null;
  private dragOrigin: { readonly x: number; readonly y: number } | null = null;
  private pull = { x: 0, y: 0 };

  constructor(private readonly callbacks: LaunchSceneCallbacks) {
    super('nexus-launch');
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, NEXUS_DISTANCE + 320, LAUNCH_VIEW_HEIGHT);
    this.add.rectangle(NEXUS_DISTANCE / 2, 215, NEXUS_DISTANCE + 640, 430, 0xaee8da);
    this.add.rectangle(NEXUS_DISTANCE / 2, 365, NEXUS_DISTANCE + 640, 150, 0x80bd73);
    this.add.rectangle(NEXUS_DISTANCE / 2, GROUND_Y + 45, NEXUS_DISTANCE + 640, 105, 0xb7a677);
    this.add.rectangle(NEXUS_DISTANCE / 2, GROUND_Y - 6, NEXUS_DISTANCE + 640, 18, 0x78a94b);
    this.add.rectangle(NEXUS_DISTANCE / 2, GROUND_Y + 20, NEXUS_DISTANCE + 640, 5, 0xe2d5aa);

    for (let x = 120; x < NEXUS_DISTANCE; x += 360) {
      this.add.ellipse(x, 342, 145, 44, x % 720 === 120 ? 0x6caa70 : 0x75b07a);
      this.add.circle(x + 95, 318, 17, 0x467e52);
      this.add.rectangle(x + 95, 353, 8, 43, 0x72543a);
      this.add.rectangle(x + 210, GROUND_Y - 15, 22, 16, 0xe9dcae);
      this.add.circle(x + 208, GROUND_Y - 25, 7, 0x75b8d9);
    }

    this.drawNexus();
    this.drawBarrier();
    this.drawLauncher();
    this.teemo = this.drawTeemo();
    this.aimGraphic = this.add.graphics().setDepth(7);
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
    const worldX = inFlight ? START_X + run.distance : START_X - this.pull.x * 0.22;
    const height = inFlight ? run.height : run.phase === 'aiming' ? this.pull.y * 0.22 : 0;

    this.cameras.main.scrollX = inFlight ? Math.max(0, worldX - 330) : 0;
    this.teemo?.setPosition(worldX, START_Y - height);
    this.teemo?.setRotation(run.phase === 'flying' ? Math.sin(run.elapsedMs / 85) * 0.09 : 0);
    this.aimGraphic?.clear();
    if (run.phase === 'aiming') {
      this.drawAimTension(worldX, START_Y - height);
    }

    this.nexusBarrier?.setVisible(!isNexusUnlocked(state.upgrades));
    this.renderMinions(state);
    frame.smashed.forEach((impact) =>
      this.showImpact(START_X + FIRST_MINION_DISTANCE + impact.index * MINION_WAVE_SPACING, impact.gold),
    );
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const phase = this.callbacks.state().run.phase;
    if (phase === 'flying') {
      this.callbacks.slam();
      return;
    }
    if (phase === 'won' || phase === 'aiming') {
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
    this.callbacks.throw(this.pull.x, this.pull.y);
    this.pull = { x: 0, y: 0 };
  }

  private updatePull(pointerX: number, pointerY: number): void {
    if (!this.dragOrigin) {
      return;
    }
    this.pull = {
      x: Math.max(0, Math.min(MAX_DRAG_X, this.dragOrigin.x - pointerX)),
      y: Math.max(-MAX_DRAG_Y, Math.min(MAX_DRAG_Y, pointerY - this.dragOrigin.y)),
    };
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
    sling.lineStyle(5, 0xb88a52, 1);
    sling.beginPath();
    sling.moveTo(START_X - 16, GROUND_Y - 12);
    sling.lineTo(START_X, GROUND_Y - 31);
    sling.lineTo(START_X + 28, GROUND_Y - 12);
    sling.strokePath();
  }

  private drawAimTension(teemoX: number, teemoY: number): void {
    const graphics = this.aimGraphic;
    if (!graphics) {
      return;
    }

    graphics.lineStyle(5, 0x684b35, 0.9);
    graphics.beginPath();
    graphics.moveTo(START_X - 16, GROUND_Y - 12);
    graphics.lineTo(teemoX, teemoY - 5);
    graphics.lineTo(START_X + 28, GROUND_Y - 12);
    graphics.strokePath();
    graphics.lineStyle(2, 0xfff1be, 0.8);
    graphics.strokeCircle(START_X, START_Y - 8, 42 + this.pull.x * 0.08);
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
    const x = NEXUS_DISTANCE + 70;
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

  private drawBarrier(): void {
    const x = START_X + NEXUS_GATE_DISTANCE;
    const wall = this.add.container(x, 0).setDepth(6);
    wall.add(this.add.rectangle(0, 335, 22, 208, 0x514d9c, 0.8));
    wall.add(this.add.rectangle(0, 335, 7, 208, 0xb5d8ff, 0.9));
    wall.add(this.add.circle(0, 230, 22, 0x8079c6, 0.9));
    wall.add(
      this.add
        .text(0, 183, 'SCOUT UPGRADES\nREQUIRED', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '17px',
          color: '#fff6cf',
          align: 'center',
          stroke: '#3a3868',
          strokeThickness: 4,
          fontStyle: 'bold',
        })
        .setOrigin(0.5),
    );
    this.nexusBarrier = wall;
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
