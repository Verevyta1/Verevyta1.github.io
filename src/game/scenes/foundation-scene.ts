import Phaser from 'phaser';

import type { MatterObjectDefinition } from '../../core/content/content-definitions';
import {
  ATTRACTION_DURATION_MS,
  type GreyboxSimulationFrame,
} from '../../core/simulation/greybox-loop';

export const FOUNDATION_VIEW_WIDTH = 960;
export const FOUNDATION_VIEW_HEIGHT = 540;
const CENTER_X = FOUNDATION_VIEW_WIDTH / 2;
const CENTER_Y = FOUNDATION_VIEW_HEIGHT / 2;
const OBJECT_POOL_SIZE = 24;
const OBJECT_COLORS = [0x79a9d8, 0x8cb9d0, 0xb0a0d0, 0x88b79a, 0xd0b382];

export interface MatterCoreSceneCallbacks {
  readonly advance: (deltaMs: number) => GreyboxSimulationFrame;
}

class MatterCoreScene extends Phaser.Scene {
  private readonly objectPool: Phaser.GameObjects.Arc[] = [];
  private readonly definitionsById: ReadonlyMap<string, MatterObjectDefinition>;
  private readonly colorsByDefinition: ReadonlyMap<string, number>;
  private reducedMotion = false;
  private coreAura?: Phaser.GameObjects.Arc;
  private coreShell?: Phaser.GameObjects.Arc;
  private coreSurface?: Phaser.GameObjects.Arc;

  constructor(
    private readonly callbacks: MatterCoreSceneCallbacks,
    definitions: readonly MatterObjectDefinition[],
  ) {
    super('matter-core');
    this.definitionsById = new Map(definitions.map((definition) => [definition.id, definition] as const));
    this.colorsByDefinition = new Map(
      definitions.map(
        (definition, index) =>
          [
            definition.id,
            OBJECT_COLORS[index % OBJECT_COLORS.length] ?? OBJECT_COLORS[0] ?? 0x8cb9d0,
          ] as const,
      ),
    );
  }

  create(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    for (let index = 0; index < OBJECT_POOL_SIZE; index += 1) {
      this.objectPool.push(this.add.circle(0, 0, 8, 0x8cb9d0).setVisible(false));
    }

    this.coreAura = this.add.circle(CENTER_X, CENTER_Y, 54, 0x4397d0, 0.14);
    this.coreShell = this.add
      .circle(CENTER_X, CENTER_Y, 34, 0x14283a)
      .setStrokeStyle(2, 0x8fc2e5, 0.8);
    this.coreSurface = this.add
      .circle(CENTER_X, CENTER_Y, 24, 0x78b7e1)
      .setStrokeStyle(3, 0xe2f5ff, 0.95);
    this.add.circle(CENTER_X, CENTER_Y, 8, 0xf4fbff);
  }

  update(time: number, deltaMs: number): void {
    const frame = this.callbacks.advance(deltaMs);
    this.renderObjects(frame);

    if (!this.coreAura || !this.coreShell || !this.coreSurface) {
      return;
    }

    const pulseActive = frame.state.gravityPulseRemainingMs > 0;
    const idleWave = this.reducedMotion ? 0 : Math.sin(time / 920) * 0.035;
    this.coreAura.setScale(1 + idleWave + (pulseActive ? 0.12 : 0));
    this.coreAura.setAlpha(pulseActive ? 0.28 : 0.14);
    this.coreShell.setScale(1 + idleWave * 0.5);
    this.coreSurface.setScale(1 + idleWave * 0.7);
  }

  private renderObjects(frame: GreyboxSimulationFrame): void {
    this.objectPool.forEach((object) => object.setVisible(false));

    frame.state.objects.slice(0, OBJECT_POOL_SIZE).forEach((instance, index) => {
      const definition = this.definitionsById.get(instance.definitionId);
      const object = this.objectPool[index];

      if (!definition || !object) {
        return;
      }

      const color = this.colorsByDefinition.get(instance.definitionId) ?? OBJECT_COLORS[0];
      const attracting = instance.phase === 'attracting';
      const attraction = Math.min(1, instance.attractionProgressMs / ATTRACTION_DURATION_MS);
      const drift = Math.min(0.09, instance.ageMs / 250_000);
      const radius = instance.orbitRadius * (1 - (attracting ? attraction : drift));
      const angle = instance.angleRadians + instance.ageMs * 0.00011;
      const x = CENTER_X + Math.cos(angle) * radius;
      const y = CENTER_Y + Math.sin(angle) * radius;
      const size = 4.5 * definition.visualScale * (attracting ? 1 + attraction * 0.25 : 1);

      object
        .setPosition(x, y)
        .setScale(size / 8)
        .setFillStyle(color, attracting ? 1 : 0.84)
        .setStrokeStyle(1.5, 0xe6f4ff, attracting ? 0.85 : 0.48)
        .setAlpha(1)
        .setVisible(true);
    });
  }
}

export function createMatterCoreGame(
  parent: HTMLElement,
  callbacks: MatterCoreSceneCallbacks,
  definitions: readonly MatterObjectDefinition[],
): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: FOUNDATION_VIEW_WIDTH,
    height: FOUNDATION_VIEW_HEIGHT,
    backgroundColor: '#07101c',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [new MatterCoreScene(callbacks, definitions)],
  });
}
