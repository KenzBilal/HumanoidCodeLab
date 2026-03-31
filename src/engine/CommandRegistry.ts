import { Humanoid } from './Humanoid';

export interface CommandParam {
  name: string;
  type: 'int' | 'number' | 'string';
  default?: any;
}

export interface ExecutionContext {
  customAnimations: any[]; // using any[] to avoid circular dependency or import if CustomAnimation isn't exported here initially
}

export interface CommandDef {
  path: string;
  params: CommandParam[];
  execute: (bot: Humanoid, params: any, context?: ExecutionContext) => Promise<void>;
  description: string;
  category: string;
  phase: number;
}

class Registry {
  private _map = new Map<string, CommandDef>();

  register(path: string, cfg: Omit<CommandDef, 'path'>) {
    this._map.set(path, { path, ...cfg });
  }

  get(path: string) {
    return this._map.get(path) || null;
  }

  all() {
    return Array.from(this._map.values());
  }

  byCategory(cat: string) {
    return Array.from(this._map.values()).filter(c => c.path.startsWith(cat));
  }
}

export const CommandRegistry = new Registry();

// HEAD
CommandRegistry.register('head.look_left', { params: [], execute: async b => b.animateJoint('head', { y: -0.55 }), description: 'Turn head left', category: 'head', phase: 1 });
CommandRegistry.register('head.look_right', { params: [], execute: async b => b.animateJoint('head', { y: 0.55 }), description: 'Turn head right', category: 'head', phase: 1 });
CommandRegistry.register('head.center', { params: [], execute: async b => b.animateJoint('head', { x: 0, y: 0, z: 0 }), description: 'Center head', category: 'head', phase: 1 });
CommandRegistry.register('head.nod', {
  params: [{ name: 'times', type: 'int', default: 2 }],
  execute: async (b, p) => { for (let i = 0; i < (p.times ?? 2); i++) { await b.animateJoint('head', { x: 0.3 }, 300); await b.animateJoint('head', { x: 0 }, 300); } },
  description: 'Nod head', category: 'head', phase: 1
});
CommandRegistry.register('head.tilt', {
  params: [{ name: 'angle', type: 'number', default: 15 }],
  execute: async (b, p) => b.animateJoint('head', { z: (p.angle ?? 15) * Math.PI / 180 }),
  description: 'Tilt head sideways', category: 'head', phase: 2
});

// HANDS / ARMS
CommandRegistry.register('left_hand.raise', { params: [], execute: async b => b.animateJoint('left_upper_arm', { x: -Math.PI / 2, z: 0.1 }), description: 'Raise left hand', category: 'left_arm', phase: 1 });
CommandRegistry.register('left_hand.lower', { params: [], execute: async b => b.animateJoint('left_upper_arm', { x: 0, z: 0.1 }), description: 'Lower left hand', category: 'left_arm', phase: 1 });
CommandRegistry.register('right_hand.raise', { params: [], execute: async b => b.animateJoint('right_upper_arm', { x: -Math.PI / 2, z: -0.1 }), description: 'Raise right hand', category: 'right_arm', phase: 1 });
CommandRegistry.register('right_hand.lower', { params: [], execute: async b => b.animateJoint('right_upper_arm', { x: 0, z: -0.1 }), description: 'Lower right hand', category: 'right_arm', phase: 1 });
CommandRegistry.register('right_hand.wave', {
  params: [{ name: 'times', type: 'int', default: 3 }],
  execute: async (b, p) => {
    await b.animateJoint('right_upper_arm', { x: -Math.PI / 2, z: -0.1 }, 400);
    for (let i = 0; i < (p.times ?? 3); i++) { await b.animateJoint('right_forearm', { z: -0.5 }, 200); await b.animateJoint('right_forearm', { z: 0.5 }, 200); }
    await b.animateJoint('right_forearm', { z: 0 }, 200);
  },
  description: 'Wave right hand', category: 'right_arm', phase: 1
});
CommandRegistry.register('left_hand.wave', {
  params: [{ name: 'times', type: 'int', default: 3 }],
  execute: async (b, p) => {
    await b.animateJoint('left_upper_arm', { x: -Math.PI / 2, z: 0.1 }, 400);
    for (let i = 0; i < (p.times ?? 3); i++) { await b.animateJoint('left_forearm', { z: 0.5 }, 200); await b.animateJoint('left_forearm', { z: -0.5 }, 200); }
    await b.animateJoint('left_forearm', { z: 0 }, 200);
  },
  description: 'Wave left hand', category: 'left_arm', phase: 1
});

CommandRegistry.register('right_arm.elbow.bend', { params: [{ name: 'angle', type: 'number', default: 45 }], execute: async (b, p) => b.animateJoint('right_forearm', { x: (p.angle ?? 45) * Math.PI / 180 }), description: 'Bend right elbow', category: 'right_arm', phase: 2 });
CommandRegistry.register('left_arm.elbow.bend', { params: [{ name: 'angle', type: 'number', default: 45 }], execute: async (b, p) => b.animateJoint('left_forearm', { x: (p.angle ?? 45) * Math.PI / 180 }), description: 'Bend left elbow', category: 'left_arm', phase: 2 });
CommandRegistry.register('torso.chest.rotate', { params: [{ name: 'angle', type: 'number', default: 15 }], execute: async (b, p) => b.animateJoint('torso', { y: (p.angle ?? 15) * Math.PI / 180 }), description: 'Rotate torso', category: 'torso', phase: 2 });
CommandRegistry.register('right_arm.shoulder.raise', { params: [{ name: 'angle', type: 'number', default: 90 }], execute: async (b, p) => b.animateJoint('right_upper_arm', { x: -(p.angle ?? 90) * Math.PI / 180, z: -0.1 }), description: 'Raise right shoulder', category: 'right_arm', phase: 2 });
CommandRegistry.register('left_arm.shoulder.raise', { params: [{ name: 'angle', type: 'number', default: 90 }], execute: async (b, p) => b.animateJoint('left_upper_arm', { x: -(p.angle ?? 90) * Math.PI / 180, z: 0.1 }), description: 'Raise left shoulder', category: 'left_arm', phase: 2 });

// MOVEMENT
CommandRegistry.register('walk.forward', { params: [{ name: 'steps', type: 'int', default: 3 }], execute: async (b, p) => b.walkForward(p.steps ?? 3, 1), description: 'Walk forward N steps', category: 'movement', phase: 1 });
CommandRegistry.register('walk.backward', { params: [{ name: 'steps', type: 'int', default: 2 }], execute: async (b, p) => b.walkForward(p.steps ?? 2, -1), description: 'Walk backward N steps', category: 'movement', phase: 1 });
CommandRegistry.register('jump', { params: [{ name: 'height', type: 'number', default: 1.0 }], execute: async (b, p) => b.jump(p.height ?? 1.0), description: 'Jump vertically', category: 'movement', phase: 2 });
CommandRegistry.register('turn.left', { params: [{ name: 'angle', type: 'number', default: 90 }], execute: async (b, p) => b.turn((p.angle ?? 90)), description: 'Turn left', category: 'movement', phase: 1 });
CommandRegistry.register('turn.right', { params: [{ name: 'angle', type: 'number', default: 90 }], execute: async (b, p) => b.turn(-(p.angle ?? 90)), description: 'Turn right', category: 'movement', phase: 1 });

// BODY
CommandRegistry.register('play', { 
  params: [{ name: 'animation', type: 'string' }], 
  execute: async (b, p, context) => {
    const anims = context?.customAnimations || [];
    const anim = anims.find(a => a.name === p.animation);
    if (!anim) {
       const available = anims.map(a => a.name).join(', ') || 'none';
       throw new Error(`Animation not found: '${p.animation}'. Available: ${available}`);
    }
    await b.playCustom(anim);
  }, 
  description: 'Play a custom animation', 
  category: 'body', 
  phase: 2 
});
CommandRegistry.register('crouch', { params: [], execute: async b => b.crouch(), description: 'Crouch down', category: 'body', phase: 2 });
CommandRegistry.register('lay_down', { params: [], execute: async b => b.layDown(), description: 'Lay down', category: 'body', phase: 2 });
CommandRegistry.register('stand_on_one_leg', { params: [{ name: 'leg', type: 'string', default: 'left' }], execute: async (b, p) => b.standOnOneLeg(p.leg as 'left' | 'right'), description: 'Stand on one leg', category: 'body', phase: 2 });
CommandRegistry.register('stand_up', { params: [], execute: async b => b.standUp(), description: 'Stand up', category: 'body', phase: 2 });
CommandRegistry.register('reset', { params: [], execute: async b => b.resetPose(true), description: 'Reset pose', category: 'body', phase: 1 });
CommandRegistry.register('idle', { params: [], execute: async b => b.resetPose(true), description: 'Go idle', category: 'body', phase: 1 });
CommandRegistry.register('wait', { params: [{ name: 'seconds', type: 'number', default: 1 }], execute: async (_, p) => new Promise(r => setTimeout(r, (p.seconds ?? 1) * 1000)), description: 'Wait N seconds', category: 'body', phase: 1 });
