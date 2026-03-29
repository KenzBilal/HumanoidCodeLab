import { describe, it, expect } from 'vitest';
import { Interpreter } from './Interpreter';

describe('Interpreter', () => {
  it('should compile simple commands', () => {
    const code = `
      robot.walk.forward(steps=3)
      robot.turn.left(angle=90)
    `;
    const { actions, errors } = Interpreter.compile(code);
    expect(errors).toHaveLength(0);
    expect(actions).toHaveLength(2);
    expect(actions[0].path).toBe('walk.forward');
    expect(actions[0].params).toEqual({ steps: 3 });
    expect(actions[1].path).toBe('turn.left');
    expect(actions[1].params).toEqual({ angle: 90 });
  });

  it('should handle variables', () => {
    const code = `
      steps = 5
      robot.walk.forward(steps=steps)
    `;
    const { actions, errors } = Interpreter.compile(code);
    expect(errors).toHaveLength(0);
    expect(actions).toHaveLength(1);
    expect(actions[0].params).toEqual({ steps: 5 });
  });

  it('should handle for loops properly', () => {
    const code = `
      for i in range(3):
          robot.walk.forward(steps=i)
    `;
    const { actions, errors } = Interpreter.compile(code);
    expect(errors).toHaveLength(0);
    expect(actions).toHaveLength(3);
    expect(actions[0].params).toEqual({ steps: 0 });
    expect(actions[1].params).toEqual({ steps: 1 });
    expect(actions[2].params).toEqual({ steps: 2 });
  });

  it('should compile if/else correctly', () => {
    const code = `
      x = 10
      if x > 5:
          robot.right_hand.raise()
      else:
          robot.walk.forward(steps=1)
    `;
    const { actions, errors } = Interpreter.compile(code);
    expect(errors).toHaveLength(0);
    expect(actions).toHaveLength(1);
    expect(actions[0].path).toBe('right_hand.raise');
  });

  it('should handle if/elif/else correctly', () => {
    const code = `
      x = 5
      if x > 10:
          robot.right_hand.raise()
      elif x == 5:
          robot.turn.left(angle=90)
      else:
          robot.walk.forward(steps=1)
    `;
    const { actions, errors } = Interpreter.compile(code);
    expect(errors).toHaveLength(0);
    expect(actions).toHaveLength(1);
    expect(actions[0].path).toBe('turn.left');
  });

  it('should track srcLine correctly', () => {
    const code = `
      x = 1

      robot.walk.forward(steps=1)
    `;
    const { actions, errors } = Interpreter.compile(code);
    expect(errors).toHaveLength(0);
    expect(actions).toHaveLength(1);
    expect(actions[0].srcLine).toBe(4);
  });
});
