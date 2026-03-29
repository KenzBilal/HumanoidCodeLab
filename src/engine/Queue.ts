import { Humanoid } from './Humanoid';
import { Action } from './Interpreter';
import { ExecutionContext } from './CommandRegistry';
export const Queue = (() => {
  let _running = false;
  let _stop = false;

  const partMap: Record<string, string> = {
    'head': 'head', 'neck': 'neck',
    'left_hand': 'left_hand', 'right_hand': 'right_hand',
    'left_arm': 'left_upper_arm', 'right_arm': 'right_upper_arm',
    'torso': 'torso', 'hips': 'hips'
  };

  function fmtLog(path: string, params: any) {
    const ps = Object.entries(params).filter(([k]) => !k.startsWith('_p')).map(([k, v]) => `${k}=${v}`).join(', ');
    return `robot.${path}(${ps})`;
  }

  return {
    get running() { return _running; },
    stop() { _stop = true; },
    async run(
      actions: Action[], 
      bot: Humanoid,
      options: {
        onLog: (type: "INFO"|"ACTION"|"SUCCESS"|"ERROR"|"WARN", msg: string) => void,
        onRunning: (r: boolean) => void,
        onStop: () => boolean,
        context: ExecutionContext,
        isDebug?: boolean,
        onDebugLine?: (line?: number) => void,
        waitStep?: () => Promise<void>
      }
    ) {
      if (_running) return;
      _running = true;
      _stop = false;
      
      options.onRunning(true);
      options.onLog('INFO', options.isDebug ? 'Running script in DEBUG mode...' : 'Running script...');
      
      const startTime = performance.now();
      
      for (const a of actions) {
        if (_stop || options.onStop()) { 
          options.onLog('WARN', 'Execution stopped.'); 
          break; 
        }
        if (!options.isDebug && performance.now() - startTime > 30000) {
          options.onLog('ERROR', 'Execution timed out (30s limit). Possible infinite loop.');
          break;
        }

        if (options.isDebug && options.onDebugLine && options.waitStep) {
          options.onDebugLine(a.srcLine);
          await options.waitStep();
          // Check stop again after wait
          if (_stop || options.onStop()) { 
            options.onLog('WARN', 'Execution stopped.'); 
            break; 
          }
        }
        
        options.onLog('ACTION', fmtLog(a.path, a.params));
        
        const cat = a.path.split('.')[0];
        if (partMap[cat]) bot.highlight(partMap[cat]);
        
        try { 
          await a.cmd.execute(bot, a.params, options.context); 
        } catch(e: any) { 
          const lineRef = a.srcLine ? ` (line ${a.srcLine})` : '';
          options.onLog('ERROR', `${a.rawLine}${lineRef} → ${e.message}`); 
          break; 
        }
      }
      
      if (!_stop && !options.onStop()) { 
        bot.highlight(null); 
        options.onLog('SUCCESS', 'Execution complete.'); 
      }
      
      _running = false; 
      options.onRunning(false);
      if (options.onDebugLine) options.onDebugLine(undefined);
    }
  };
})();
