import { NS } from '@ns';
import { ServerMatrix } from './lib/server-matrix';

// const loopDelay = 60000; // milliseconds; default: 1 minute

export async function main(ns: NS) {
    const myServerMatrix = new ServerMatrix(ns);
    await myServerMatrix.initialize();
    
}