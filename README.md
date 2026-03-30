# Humanoid Code Lab

A professional, cross-platform Electron application for 3D humanoid robot programming. Write Python-like scripts to control an animated 3D humanoid model in real-time, create custom keyframe animations, learn through an interactive curriculum, and generate complex routines using multi-provider AI backend (Google Gemini, OpenAI, Anthropic Claude).

> [!NOTE]
> This repository represents the **V1.0 Production Release**, featuring secure keychain storage, automated unit testing, embedded Monaco IDE, and a fully draggable workspace.

## Features

- **Real-time 3D Humanoid** — Fully articulated robot with 18 controllable joints, built with Three.js.
- **Custom Scripting DSL** — Python-like syntax to control the robot (e.g., `robot.walk.forward(steps=3)`). Features multi-level `if/elif/else` branching, `#` comments, inline variables, and scoped loops.
- **Monaco Editor Integration** — World-class IDE experience with live Auto-Complete (`robot.*` IntelliSense syntax highlighting).
- **Visual Stepping Debugger** — Execute lines step-by-step. The live debugger highlights the exact executing line synced with the robot's physical sequence logic.
- **Interactive Training Curriculum** — Gamified UI puzzles evaluating user scripts against target logic AST conditions.
- **Multi-Provider AI** — Generate scripts with natural language using OpenAI GPT-4o, Anthropic Claude 3.7, and Google Gemini 2.0 Flash.
- **Secure Keychains (`safeStorage`)** — AI provider keys are encrypted natively via the OS keychain in the Electron Main Process. No plain text `localStorage` leaks.
- **Visual Animation Editor** — Create keyframe-based animations with per-joint rotation control and timeline.
- **Dynamic Layout** — Fully draggable, resizable split-panes managing the Viewport, Code Editor, and the Animation Sequencer interfaces.

## Tech Stack

- **Frontend:** React 19 + TypeScript 5.8
- **Platform:** Electron (Node backend, Chromium frontend)
- **Editor:** `@monaco-editor/react`
- **3D Engine:** Three.js
- **State:** Zustand with Zod schema validation
- **Styling:** Tailwind CSS v4, Lucide React
- **Layout:** `react-resizable-panels`
- **Testing:** Vitest
- **AI SDKs:** `@google/genai`, `openai`, `@anthropic-ai/sdk`
- **Build:** Vite 6 + Electron Builder

## Setup

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Development

Run the Vite dev server and boot the application inside Electron:

```bash
npm run dev
```

### Production Build

Package the application as a standalone desktop executable for your OS:

```bash
npm run build
```

This compiles the Vite web payload (`dist/`) and the Node.js backend (`dist-electron/`).

### Verification & Testing

Verify DSL compilation and script variables logic via Vitest:

```bash
npm test
```

Perform static analysis and code linters:

```bash
npm run lint
```

## Scripting DSL

The robot is controlled via a Python-like scripting language.

### Syntax

```python
# Movement commands pass kwargs
robot.command(param=value)
robot.subsystem.command(param=value)

# Complex Logic and Variables
steps = 3
if steps > 2:
    robot.walk.forward(steps=steps)
elif steps == 2:
    robot.crouch()
else:
    robot.stand_up()

# Iteration
for x in range(3):
    robot.head.nod(times=1)
    robot.wait(seconds=0.5)
```

## Available Commands

### Head
| Command | Parameters | Description |
|---------|-----------|-------------|
| `robot.head.look_left()` | — | Turn head left |
| `robot.head.look_right()` | — | Turn head right |
| `robot.head.center()` | — | Center head position |
| `robot.head.nod()` | `times` (int, default: 2) | Nod head |
| `robot.head.tilt()` | `angle` (number, default: 15) | Tilt head sideways (degrees) |

### Arms & Hands
| Command | Parameters | Description |
|---------|-----------|-------------|
| `robot.left_hand.raise()` | — | Raise left hand |
| `robot.left_hand.lower()` | — | Lower left hand |
| `robot.left_hand.wave()` | `times` (int, default: 3) | Wave left hand |
| `robot.right_hand.raise()` | — | Raise right hand |
| `robot.right_hand.lower()` | — | Lower right hand |
| `robot.right_hand.wave()` | `times` (int, default: 3) | Wave right hand |
| `robot.left_arm.elbow.bend()` | `angle` (number, default: 45) | Bend left elbow (degrees) |
| `robot.right_arm.elbow.bend()` | `angle` (number, default: 45) | Bend right elbow (degrees) |
| `robot.left_arm.shoulder.raise()` | `angle` (number, default: 90) | Raise left shoulder (degrees) |
| `robot.right_arm.shoulder.raise()` | `angle` (number, default: 90) | Raise right shoulder (degrees) |

### Body & Movement
| Command | Parameters | Description |
|---------|-----------|-------------|
| `robot.walk.forward()` | `steps` (int, default: 3) | Walk forward N steps |
| `robot.walk.backward()` | `steps` (int, default: 2) | Walk backward N steps |
| `robot.jump()` | `height` (number, default: 1.0) | Jump vertically |
| `robot.turn.left()` | `angle` (number, default: 90) | Turn left (degrees) |
| `robot.turn.right()` | `angle` (number, default: 90) | Turn right (degrees) |
| `robot.crouch()` | — | Crouch down |
| `robot.lay_down()` | — | Lay down on the ground |
| `robot.stand_on_one_leg()` | `leg` ('left'/'right', default: 'left') | Stand on one leg |
| `robot.stand_up()` | — | Stand up from any pose |
| `robot.reset()` | — | Reset to default pose |
| `robot.idle()` | — | Return to idle pose |
| `robot.wait()` | `seconds` (number, default: 1) | Wait N seconds |

## Architecture

```
HumanoidCodeLab/
├── package.json                # Dependencies and scripts (vitest, react, electron)
├── electron/
│   ├── main.ts                 # Electron backend: safeStorage keyring, AI processing, Hardware Serial
│   └── preload.ts              # IPC Bridge
├── tests/
│   └── Interpreter.test.ts     # Core vitest logic validations (AST grammar checks)
└── src/
    ├── App.tsx                 # Root component with react-resizable-panels layout
    ├── store.ts                # Zustand state (debug execution contexts, Zod hydration)
    ├── engine/
    │   ├── Humanoid.ts         # 3D humanoid model and animation IK logic
    │   ├── Scene.ts            # Three.js scene, camera, lighting, render loop
    │   ├── CommandRegistry.ts  # Hardcoded command schemas
    │   ├── Interpreter.ts      # Python-to-AST logic parser
    │   └── Queue.ts            # Action orchestrator with live debug stepping
    └── components/
        ├── Viewport.tsx        # Three.js canvas
        ├── RightPanel.tsx      # Monaco Text Editor integration
        ├── TopBar.tsx          # Nav with AI, Hardware reset, Curriculum triggers
        ├── ErrorBoundary.tsx   # React error boundary
        └── CurriculumModal.tsx # Gamified training module
```


## Website & SEO Status

The official landing page for **Humanoid Code Lab** is fully optimized for production:
- **SEO Ready**: Comprehensive meta tags, OpenGraph, and Twitter Cards are implemented in the `website/index.html`.
- **Direct Downloads**: The [Download Page](file:///home/kenz/Desktop/HumanoidCodeLab/website/src/pages/Download.tsx) is configured with direct links to **v1.0.0** release assets (.AppImage, .exe, .dmg).
- **3D Visualization**: The landing page features a real-time `Three.js` scene with the [robot.glb](file:///home/kenz/Desktop/HumanoidCodeLab/website/public/models/robot.glb) model.

## License

Apache-2.0
