export const FEATURES = [
  {
    id: 'ai',
    title: 'AI Generation',
    description: 'Describe complex robot motions in plain English. Powered by Gemini, OpenAI, and Anthropic.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M12 20v2"/><path d="m17.66 17.66 1.41 1.41"/><path d="M20 12h2"/><path d="m17.66 6.34 1.41-1.41"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M8 12h.01"/><path d="M12 16h.01"/><path d="M12 8h.01"/></svg>
  },
  {
    id: 'ide',
    title: 'Monaco IDE',
    description: 'Pro-grade editor with syntax highlighting and auto-complete for robot.* commands.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  },
  {
    id: 'simulation',
    title: '3D Simulation',
    description: 'Real-time 3D physics engine to test your code before deploying to physical hardware.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  },
  {
    id: 'debug',
    title: 'Visual Debugger',
    description: 'Step through your DSL code line by line with live state visualization and breakpoints.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1"/><path d="M15 7.13v-1"/><path d="M12 20c-3.31 0-6-2.69-6-6v-1h12v1c0 3.31-2.69 6-6 6Z"/><path d="M12 20v-5"/><path d="M19 12h-1.5"/><path d="M6.5 12H5"/><path d="m21 19-2-2"/><path d="m5 17-2 2"/><path d="m7 10-1-1"/><path d="m22 13-1-1"/><path d="m18 10 1-1"/></svg>
  },
  {
    id: 'hardware',
    title: 'Hardware Bridge',
    description: 'Direct serial communication with humanoid hardware. Zero-latency control stream.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m4.93 4.93 5.66 5.66"/><path d="M2 12h8"/><path d="m4.93 19.07 5.66-5.66"/><path d="M12 22v-8"/><path d="m17.66 17.66-5.66-5.66"/><path d="M22 12h-8"/><path d="m17.66 6.34-5.66 5.66"/></svg>
  },
  {
    id: 'curriculum',
    title: 'Robot Curriculum',
    description: 'Interactive learning modules from basic limb movement to advanced dance routines.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  }
];

export const FAQ = [
  {
    q: "Is Humanoid Code Lab free to use?",
    a: "The core platform and 3D simulation IDE are completely free for personal and educational use. Advanced AI generation requires your own API keys (Gemini, Claude, or OpenAI)."
  },
  {
    q: "Which robot hardware is supported?",
    a: "We currently support standard serial-controlled humanoid boards via our Hardware Bridge. Custom driver mapping for specific robotic kits is coming in Q3 2026."
  },
  {
    q: "Can I use it on Windows?",
    a: "Yes! We provide official installers for Windows (.exe), Linux (.AppImage), and macOS (.dmg). All platforms share 100% feature parity."
  },
  {
    q: "What programming language is used?",
    a: "We use a custom, human-readable DSL (Domain Specific Language) designed for robotics. It uses commands like `robot.right_arm(90)` and supports loops, variables, and logic."
  },
  {
    q: "How does the AI generation work?",
    a: "You type a natural language command like 'make the robot dance to a slow beat'. Our backend translates this request into precise DSL movements using the model of your choice."
  }
];

export const RELEASES = [
  { version: '1.0.0', date: 'March 2026', notes: 'Official Production Release with Monaco Editor, 3D Viewport, and Hardware Bridge.' },
  { version: '0.9.5-beta', date: 'Feb 2026', notes: 'Public beta launch with improved DSL interpreter and performance fixes.' }
];

export const COMMANDS = [
  { category: 'Head', command: 'robot.head(angle)', desc: 'Set head rotation (0-180)' },
  { category: 'Arms', command: 'robot.right_arm(angle)', desc: 'Set right arm angle' },
  { category: 'Arms', command: 'robot.left_arm(angle)', desc: 'Set left arm angle' },
  { category: 'Body', command: 'robot.body(angle)', desc: 'Set torso rotation' },
  { category: 'Logic', command: 'wait(ms)', desc: 'Pause execution for duration' },
  { category: 'Logic', command: 'loop(n) { ... }', desc: 'Repeat block N times' }
];
