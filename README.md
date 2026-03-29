# Humanoid Code Lab

A browser-based 3D humanoid robot programming lab. Write Python-like scripts to control an animated 3D humanoid model in real-time, create custom keyframe animations, and generate scripts with AI.

## Features

- **Real-time 3D humanoid** — Fully articulated robot with 18 controllable joints, built with Three.js
- **Custom scripting DSL** — Python-like syntax to control the robot (`robot.walk.forward(steps=3)`)
- **Visual animation editor** — Create keyframe-based animations with per-joint rotation control and timeline
- **AI script generation** — Describe what you want in natural language, Gemini generates the code
- **Persistent state** — Scripts and animations saved to localStorage across sessions
- **Orbit camera** — Drag to rotate, scroll to zoom around the humanoid

## Tech Stack

- **React 19** + **TypeScript 5.8**
- **Three.js** — 3D rendering and animation
- **Zustand** — State management with persistence
- **Tailwind CSS 4** — Styling
- **Vite 6** — Build tooling
- **Google Gemini API** — AI script generation

## Setup

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run preview
```

### Type Check

```bash
npm run lint
```

## Scripting DSL

The robot is controlled via a Python-like scripting language in the code editor.

### Syntax

```python
robot.command(param=value)
robot.subsystem.command(param=value)
```

- Comments start with `#`
- Supports `for x in range(N):` loops (including `range(start, stop)` and `range(start, stop, step)`)
- Run with the **Run** button or `Ctrl+Enter`

### Example Scripts

```python
# Walk and wave
robot.walk.forward(steps=3)
robot.right_hand.wave(times=3)
robot.turn.left(angle=90)
robot.jump(height=1.5)

# Pose sequence
robot.crouch()
robot.wait(seconds=1)
robot.stand_up()
robot.stand_on_one_leg(leg='left')
robot.wait(seconds=1)
robot.stand_up()

# Loop example
for i in range(3):
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

### Movement

| Command | Parameters | Description |
|---------|-----------|-------------|
| `robot.walk.forward()` | `steps` (int, default: 3) | Walk forward N steps |
| `robot.walk.backward()` | `steps` (int, default: 2) | Walk backward N steps |
| `robot.jump()` | `height` (number, default: 1.0) | Jump vertically |
| `robot.turn.left()` | `angle` (number, default: 90) | Turn left (degrees) |
| `robot.turn.right()` | `angle` (number, default: 90) | Turn right (degrees) |

### Body

| Command | Parameters | Description |
|---------|-----------|-------------|
| `robot.crouch()` | — | Crouch down |
| `robot.lay_down()` | — | Lay down on the ground |
| `robot.stand_on_one_leg()` | `leg` ('left'/'right', default: 'left') | Stand on one leg |
| `robot.stand_up()` | — | Stand up from any pose |
| `robot.reset()` | — | Reset to default pose |
| `robot.idle()` | — | Return to idle pose |
| `robot.wait()` | `seconds` (number, default: 1) | Wait N seconds |
| `robot.play()` | `animation` (string) | Play a custom animation by name |

## Custom Animations

Switch to the **Animator** view to create and edit keyframe-based animations.

- **Keyframes** define joint rotations at specific time points (0% to 100% of duration)
- Each keyframe stores rotation values (X, Y, Z) per body part and a root Y offset
- Animations are interpolated linearly between keyframes
- Preview animations directly on the 3D model
- Two built-in animations: `Custom Crouch` and `Custom Lay Down`

## Project Structure

```
HumanoidCodeLab/
├── index.html                  # Entry HTML
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # Root component (editor/animator views)
    ├── store.ts                # Zustand state with persistence
    ├── index.css               # Tailwind import
    ├── engine/
    │   ├── Humanoid.ts         # 3D humanoid model and all animations
    │   ├── Scene.ts            # Three.js scene, camera, lighting, render loop
    │   ├── CommandRegistry.ts  # All 25 command definitions
    │   ├── Interpreter.ts      # DSL parser, compiler, loop expansion
    │   └── Queue.ts            # Sequential command execution engine
    └── components/
        ├── Viewport.tsx                # Three.js canvas
        ├── LeftPanel.tsx               # Body part hierarchy tree
        ├── RightPanel.tsx              # Code editor with syntax highlighting
        ├── OutputPanel.tsx             # Execution log panel
        ├── TopBar.tsx                  # Navigation bar
        ├── ErrorBoundary.tsx           # React error boundary
        ├── AIGenerateModal.tsx         # Gemini AI script generation
        ├── AnimatorLeftPanel.tsx       # Animation list manager
        ├── AnimatorRightPanel.tsx      # Keyframe editor with rotation sliders
        └── AnimatorTimelinePanel.tsx   # Timeline with keyframe markers
```

## License

Apache-2.0
