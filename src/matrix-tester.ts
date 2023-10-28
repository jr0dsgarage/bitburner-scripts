import { NS } from '@ns';
import  {ServerMatrix} from './server-matrix';

export async function main(ns: NS) {
    const myserverMatrix = new ServerMatrix(ns, 10);
    ns.tprint(`Scanned Server List: ` + myserverMatrix.serverList.map(server => server.hostname).join(`, `));
    
    const hackableServerList = myserverMatrix.getHackableServers();
    ns.tprint(`Hackable Server List: ` + hackableServerList.map(server => server.hostname).join(`, `));
}