# Humanoid Code Lab

A desktop application for programming and animating 3D humanoid robots. Write code to control the robot, create custom animations, and generate routines using AI.

## What Is This?

Humanoid Code Lab is a desktop IDE that lets you:
- **Program a 3D Robot** - Write scripts to make the robot walk, jump, turn, wave, and more
- **Create Animations** - Use the visual keyframe animator to create custom animations
- **Generate Code with AI** - Describe what you want in plain English, and AI generates the code
- **Learn Robotics** - Follow the built-in training curriculum to learn robot programming

## Installation

```bash
npm install
npm run dev        # Run in development mode
npm run build      # Build for production
```

## Getting Started

### First Launch
1. Open the app
2. Connect an AI provider (optional - app works fully offline without AI)
3. Start writing code in the editor or create animations in Animator mode

### Interface Overview

The app has two main modes:

**Editor Mode** - Write and run robot code
- Left Panel: Body parts tree
- Center: 3D Viewport + Output console  
- Right Panel: Code editor

**Animator Mode** - Create keyframe animations
- Left Panel: Animation list
- Center: 3D Viewport + Timeline
- Right Panel: Keyframe editor

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Run code |
| `Ctrl + S` | Save file |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Ctrl + Shift + P` | Command Palette |
| `Ctrl + D` | Duplicate keyframe (Animator) |
| `Delete` | Delete keyframe (Animator) |
| `Space` | Play/Pause animation |
| `Home` | Jump to start |
| `End` | Jump to end |

## Writing Code

The robot is controlled using simple Python-like commands:

```python
# Make the robot walk forward
robot.walk.forward(steps=3)

# Turn left
robot.turn.left(angle=90)

# Wave hello
robot.right_hand.wave(times=3)

# Use variables
steps = 5
for i in range(steps):
    robot.walk.forward(steps=1)
    robot.wait(seconds=0.5)

# Conditional logic
if steps > 3:
    robot.jump(height=1.0)
else:
    robot.crouch()
```

### Available Commands

#### Movement
| Command | Description |
|---------|-------------|
| `robot.walk.forward(steps=N)` | Walk forward N steps |
| `robot.walk.backward(steps=N)` | Walk backward N steps |
| `robot.turn.left(angle=N)` | Turn left N degrees |
| `robot.turn.right(angle=N)` | Turn right N degrees |
| `robot.jump(height=N)` | Jump N units high |
| `robot.crouch()` | Crouch down |
| `robot.lay_down()` | Lay down |
| `robot.stand_up()` | Stand up |
| `robot.stand_on_one_leg(leg='left')` | Stand on one leg |

#### Head
| Command | Description |
|---------|-------------|
| `robot.head.look_left()` | Look left |
| `robot.head.look_right()` | Look right |
| `robot.head.center()` | Center head |
| `robot.head.nod(times=N)` | Nod N times |
| `robot.head.tilt(angle=N)` | Tilt head N degrees |

#### Arms & Hands
| Command | Description |
|---------|-------------|
| `robot.left_hand.raise()` | Raise left hand |
| `robot.left_hand.lower()` | Lower left hand |
| `robot.left_hand.wave(times=N)` | Wave left hand N times |
| `robot.right_hand.raise()` | Raise right hand |
| `robot.right_hand.lower()` | Lower right hand |
| `robot.right_hand.wave(times=N)` | Wave right hand N times |
| `robot.right_arm.elbow.bend(angle=N)` | Bend right elbow N degrees |
| `robot.left_arm.elbow.bend(angle=N)` | Bend left elbow N degrees |
| `robot.right_arm.shoulder.raise(angle=N)` | Raise right shoulder |
| `robot.left_arm.shoulder.raise(angle=N)` | Raise left shoulder |
| `robot.torso.chest.rotate(angle=N)` | Rotate torso |

#### Other
| Command | Description |
|---------|-------------|
| `robot.wait(seconds=N)` | Wait N seconds |
| `robot.reset()` | Reset to default pose |
| `robot.idle()` | Go to idle pose |
| `robot.play(animation='name')` | Play a saved animation |

## Using AI

### Supported AI Providers
- **Google Gemini** - Default, free tier available
- **OpenAI GPT-4o** - Requires API key
- **Anthropic Claude** - Requires API key  
- **xAI Grok** - Requires API key

### Connecting AI
1. Click the 🔒 icon in the top bar
2. Select your provider
3. Enter your API key
4. Click Connect

The app works fully offline - AI is optional.

### Generating Code
1. Click the ✨ button or press Ctrl+Enter after connecting AI
2. Describe what you want in plain English
3. Generated code appears in the editor

## Creating Animations

### Using the Animator
1. Switch to "Animator" mode via the top tabs
2. Click "+ NEW" to create an animation
3. Add keyframes and adjust poses
4. Use the timeline to set timing
5. Click Preview to test

### Controls
- **Add Keyframe** - Click when robot is at desired pose
- **Drag Keyframes** - Move along timeline
- **Easing** - Choose from linear, ease-in, ease-out, bounce
- **Copy/Paste Poses** - Copy pose from one keyframe to another

### Exporting Animations
Click Export to save as JSON file.

## Templates

Start quickly with pre-made templates:
- Basic Movement
- Dance Routine
- Exercise Session
- Custom Routine

## Help & Support

- **Tutorial**: Click the graduation cap icon for training exercises
- **Command Palette**: Press Ctrl+Shift+P for quick actions
- **Settings**: Click gear icon for AI settings and preferences

---

## System Requirements
- Windows 10+ / macOS / Linux
- 4GB RAM minimum
- WebGL-capable graphics

## License

Proprietary - All rights reserved.