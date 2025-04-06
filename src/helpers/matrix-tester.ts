import { NS } from '@ns';
import { ServerMatrix } from '../lib/server-matrix';

export async function main(ns: NS) {
    const myServerMatrix = new ServerMatrix(ns);
    await myServerMatrix.initialize(ns, false);
    
    // print the names of all servers
    ns.tprintf(`INFO: ${myServerMatrix.fullScannedServerList.length} servers found...`);
    myServerMatrix.fullScannedServerList.forEach((server) => {
        ns.tprintf(`INFO: ${server.hostname}`);
    }
    )
}