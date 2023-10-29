import { NS } from '@ns';
import  {ServerMatrix} from './server-matrix';

export async function main(ns: NS) {
    const myserverMatrix = new ServerMatrix(ns, 10);
    await myserverMatrix.initialize();
    while (true) {
        await ns.sleep(100000);
        ns.tprint(`checking for new hack target...`)
        if (myserverMatrix.hackTarget !== await myserverMatrix.findBestHackTarget()){
            ns.tprint(`WARN: hack target changed!!!`);
            ns.run(`hack-servers-2.ts`, 1, myserverMatrix.hackTarget.hostname);
        }
        
    }
}