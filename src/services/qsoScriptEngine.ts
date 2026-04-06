import type { Station } from '@/types/station';
import type { QsoSteps } from '@/constants/qsoStates';

export interface QsoScriptContext {
  activatorCallsign: string;
  hunterCallsign: string;
  activatorState: string;
  hunterState: string;
  rst: string;
  timeOfDay: 'GM' | 'GA' | 'GE';
}

export class QsoScriptEngine {
  private readonly stepTemplates: Record<string, (ctx: QsoScriptContext) => string> = {
    'INITIATE': (ctx) => `CQ CQ POTA DE ${ctx.activatorCallsign} K`,
    
    'HUNTER_RESPONSE': (ctx) => `${ctx.hunterCallsign}`,
    
    'EXCHANGE_ACTIVATOR': (ctx) => 
      `BK TU ${ctx.timeOfDay} UR ${ctx.rst} ${ctx.hunterState} ${ctx.hunterState} BK`,
    
    'EXCHANGE_HUNTER': (ctx) => 
      `BK TU UR ${ctx.rst} ${ctx.hunterState} ${ctx.hunterState} BK`,
    
    'CONFIRM': (ctx) => 
      `BK TU ${ctx.hunterState} ${ctx.hunterState} 73 e e`,
    
    'HUNTER_CLOSING': (ctx) => 
      `e e`,
  };

  generateMessage(step: QsoSteps, context: QsoScriptContext): string {
    const templateMap: Record<QsoSteps, keyof typeof this.stepTemplates> = {
      'CQ': 'INITIATE',
      'EXCHANGE': 'EXCHANGE_ACTIVATOR',
      'CONFIRM': 'CONFIRM',
      'LOGGING': 'EXCHANGE_HUNTER',
      'COMPLETED': 'HUNTER_CLOSING',
    };

    const templateKey = templateMap[step];
    const template = this.stepTemplates[templateKey];
    
    if (!template) {
      console.warn(`No template found for step: ${step}`);
      return '';
    }

    return template(context);
  }

  // Helper to determine time of day
  getTimeOfDay(): 'GM' | 'GA' | 'GE' {
    const hour = new Date().getHours();
    if (hour < 12) return 'GM';
    if (hour >= 12 && hour < 18) return 'GA';
    return 'GE';
  }

  // Generate random RST values
  generateRst(): string {
    const r = String(Math.floor(Math.random() * 5) + 1);
    const s = String(Math.floor(Math.random() * 9) + 1);
    const t = String(Math.floor(Math.random() * 9) + 1);
    return `${r+s+t}`;
  }

  // Get appropriate response based on received message
  getNextStep(currentStep: QsoSteps, receivedMessage: string): QsoSteps {
    switch (currentStep) {
      case 'CQ':
        // Hunter called us
        return 'EXCHANGE';
      
      case 'EXCHANGE':
        // We sent our exchange, now waiting for hunter's response
        if (receivedMessage.includes('TU') && receivedMessage.includes('UR')) {
          return 'CONFIRM';
        }
        return 'EXCHANGE';
      
      case 'CONFIRM':
        // We sent confirmation, now waiting for hunter's closing
        if (receivedMessage.includes('73') || receivedMessage.includes('e e')) {
          return 'COMPLETED';
        }
        return 'CONFIRM';
      
      case 'LOGGING':
        // This is handled through the exchange flow
        return 'CONFIRM';
      
      case 'COMPLETED':
        return 'COMPLETED';
      
      default:
        return 'CQ';
    }
  }
}