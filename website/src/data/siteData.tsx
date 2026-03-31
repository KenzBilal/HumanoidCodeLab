export const FEATURES = [
  {
    id: 'ai',
    title: 'Built-in AI',
    description: 'Free Grok AI powered code generation. Describe what you want in plain English - no API key needed.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M12 20v2"/><path d="m17.66 17.66 1.41 1.41"/><path d="M20 12h2"/><path d="m17.66 6.34 1.41-1.41"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M8 12h.01"/><path d="M12 16h.01"/></svg>
  },
  {
    id: 'ide',
    title: 'Monaco IDE',
    description: 'Pro-grade code editor with syntax highlighting and intelligent auto-complete for all robot commands.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  },
  {
    id: 'simulation',
    title: '3D Simulation',
    description: 'Real-time 3D physics engine to test your code instantly. Watch your robot respond to every command.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  },
  {
    id: 'debug',
    title: 'Visual Debugger',
    description: 'Step through your code line by line with live state visualization. Perfect for learning.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1"/><path d="M15 7.13v-1"/><path d="M12 20c-3.31 0-6-2.69-6-6v-1h12v1c0 3.31-2.69 6-6 6Z"/><path d="M12 20v-5"/><path d="M19 12h-1.5"/><path d="M6.5 12H5"/><path d="m21 19-2-2"/><path d="m5 17-2 2"/><path d="m7 10-1-1"/><path d="m22 13-1-1"/><path d="m18 10 1-1"/></svg>
  },
  {
    id: 'project',
    title: 'Project Explorer',
    description: 'Organize multiple scripts and animations in one project. Save, load, and manage your work easily.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  },
  {
    id: 'animator',
    title: 'Pro Animator',
    description: 'Create stunning keyframe animations with bezier curves, easing controls, and export to JSON.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
  },
  {
    id: 'palette',
    title: 'Command Palette',
    description: 'Access all features instantly with Ctrl+Shift+P. Quick actions at your fingertips.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
  },
  {
    id: 'templates',
    title: 'Ready Templates',
    description: 'Start instantly with pre-built templates. Basic Movement, Dance, Exercise, Greeting & more.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
  },
  {
    id: 'offline',
    title: 'Works Offline',
    description: 'Full functionality without internet. Code editor, animator, and all features work completely offline.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m2 12 5-5 3 3 5-5"/><path d="m22 12-5 5-3-3-5 5"/></svg>
  },
  {
    id: 'curriculum',
    title: 'Learning Curriculum',
    description: 'Interactive tutorials from basic movements to advanced routines. Perfect for beginners.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  }
];

export const FAQ = [
  {
    q: "Is Humanoid Code Lab free to use?",
    a: "Yes! The core platform is completely free. It includes built-in Grok AI for code generation at no cost. No API key needed - works right out of the box."
  },
  {
    q: "Does it work offline?",
    a: "Absolutely! The entire application works offline. Code editor, animator, debugger - everything functions without internet. AI features require internet, but the rest works perfectly offline."
  },
  {
    q: "Can I use it on Windows, Mac, and Linux?",
    a: "Yes! Humanoid Code Lab is available for all major desktop platforms. Download from the app page for your preferred OS."
  },
  {
    q: "What programming language does it use?",
    a: "We use a simple, human-readable DSL designed for robotics. It looks like Python with commands like robot.walk.forward(steps=3), robot.right_hand.wave(times=2), and more."
  },
  {
    q: "How does the AI code generation work?",
    a: "Simply describe what you want in plain English - like 'make the robot dance' or 'walk forward and wave'. The built-in AI generates the complete code instantly. No API key needed."
  },
  {
    q: "Can I create custom animations?",
    a: "Yes! The Pro Animator lets you create keyframe animations with full control over easing curves, timing, and joint rotations. Export animations as JSON for later use."
  },
  {
    q: "Is there a learning curriculum?",
    a: "Yes! The app includes interactive tutorials that guide you from basic movements to advanced routines. Perfect for beginners learning robotics programming."
  }
];

export const RELEASES = [
  { version: 'v1.2.1', date: 'Mar 2026', notes: 'Stabilization: Fixed AI modal auto-pop-up Bug, Added AI timeouts, improved session persistence, and refined UI and state management.' },
  { version: 'v1.2.0', date: 'Mar 2026', notes: 'Major Update: Built-in AI, Project Explorer, Command Palette, Templates, Pro Animator, Offline Mode, and more.' },
  { version: 'v1.1.0', date: 'Jan 2026', notes: 'Initial release with Monaco IDE, 3D simulation, and basic AI integration.' }
];

export const COMMANDS = [
  // Movement
  { category: 'Movement', command: 'robot.walk.forward(steps=N)', desc: 'Walk forward N steps' },
  { category: 'Movement', command: 'robot.walk.backward(steps=N)', desc: 'Walk backward N steps' },
  { category: 'Movement', command: 'robot.turn.left(angle=N)', desc: 'Turn left N degrees' },
  { category: 'Movement', command: 'robot.turn.right(angle=N)', desc: 'Turn right N degrees' },
  { category: 'Movement', command: 'robot.jump(height=N)', desc: 'Jump with specified height' },
  { category: 'Movement', command: 'robot.crouch()', desc: 'Crouch down to ground' },
  { category: 'Movement', command: 'robot.lay_down()', desc: 'Lay down on ground' },
  { category: 'Movement', command: 'robot.stand_up()', desc: 'Stand up from any pose' },
  { category: 'Movement', command: 'robot.stand_on_one_leg(leg="left")', desc: 'Balance on one leg' },
  
  // Head
  { category: 'Head', command: 'robot.head.look_left()', desc: 'Turn head left' },
  { category: 'Head', command: 'robot.head.look_right()', desc: 'Turn head right' },
  { category: 'Head', command: 'robot.head.center()', desc: 'Center head position' },
  { category: 'Head', command: 'robot.head.nod(times=N)', desc: 'Nod head N times' },
  { category: 'Head', command: 'robot.head.tilt(angle=N)', desc: 'Tilt head sideways' },
  
  // Arms
  { category: 'Arms', command: 'robot.left_hand.raise()', desc: 'Raise left hand' },
  { category: 'Arms', command: 'robot.left_hand.wave(times=N)', desc: 'Wave left hand' },
  { category: 'Arms', command: 'robot.right_hand.raise()', desc: 'Raise right hand' },
  { category: 'Arms', command: 'robot.right_hand.wave(times=N)', desc: 'Wave right hand' },
  { category: 'Arms', command: 'robot.left_arm.elbow.bend(angle=N)', desc: 'Bend left elbow' },
  { category: 'Arms', command: 'robot.right_arm.elbow.bend(angle=N)', desc: 'Bend right elbow' },
  { category: 'Arms', command: 'robot.left_arm.shoulder.raise(angle=N)', desc: 'Raise left shoulder' },
  { category: 'Arms', command: 'robot.right_arm.shoulder.raise(angle=N)', desc: 'Raise right shoulder' },
  
  // Body
  { category: 'Body', command: 'robot.wait(seconds=N)', desc: 'Wait N seconds' },
  { category: 'Body', command: 'robot.reset()', desc: 'Reset to default pose' },
  { category: 'Body', command: 'robot.idle()', desc: 'Return to idle animation' },
  { category: 'Body', command: 'robot.play(animation="name")', desc: 'Play saved animation' },
  { category: 'Body', command: 'robot.torso.chest.rotate(angle=N)', desc: 'Rotate torso' },
];

export const KEYBOARD_SHORTCUTS = [
  { shortcut: 'Ctrl + Enter', action: 'Run code' },
  { shortcut: 'Ctrl + S', action: 'Save file' },
  { shortcut: 'Ctrl + Z', action: 'Undo' },
  { shortcut: 'Ctrl + Shift + Z', action: 'Redo' },
  { shortcut: 'Ctrl + Shift + P', action: 'Command Palette' },
  { shortcut: 'Ctrl + T', action: 'Open Templates' },
  { shortcut: 'F1', action: 'Open Help' },
  { shortcut: 'Space', action: 'Play/Pause animation' },
  { shortcut: 'Home / End', action: 'Jump to start/end' },
  { shortcut: 'Ctrl + D', action: 'Duplicate keyframe' },
  { shortcut: 'Delete', action: 'Delete keyframe' },
];