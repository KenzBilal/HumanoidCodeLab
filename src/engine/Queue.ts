import { Humanoid } from './Humanoid';
import { Action } from './Interpreter';
import { useStore } from '../store';

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
    async run(actions: Action[], bot: Humanoid) {
      if (_running) return;
      _running = true;
      _stop = false;
      
      const store = useStore.getState();
      store.setRunning(true);
      store.addLog('INFO', 'Running script...');
      
      for (const a of actions) {
        if (_stop) { 
          store.addLog('WARN', 'Execution stopped.'); 
          break; 
        }
        store.addLog('ACTION', fmtLog(a.path, a.params));
        
        const cat = a.path.split('.')[0];
        if (partMap[cat]) bot.highlight(partMap[cat]);
        
        try { 
          await a.cmd.execute(bot, a.params); 
        } catch(e: any) { 
          store.addLog('ERROR', e.message); 
          break; 
        }
      }
      
      if (!_stop) { 
        bot.highlight(null); 
        store.addLog('SUCCESS', 'Execution complete.'); 
      }
      
      _running = false; 
      useStore.getState().setRunning(false);
    }
  };
})();
