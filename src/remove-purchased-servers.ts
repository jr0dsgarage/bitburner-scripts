import { NS } from '@ns';
import { Logger } from './lib/logger';

/** @param {NS} ns Netscript namespace */

export async function main(ns: NS) {
    if (ns.args.includes(`-a`)) {
        deleteAllServers(ns)
    }
    else if (ns.args[0]) {
        const purchasedServer = ns.args[0].toString()
        deleteServer(ns, purchasedServer);
    }
    else {
        Logger.error(ns,`no server specified for deletion! (use -a to delete all purchased servers)`);
    }
    
}

export async function deleteServer(ns: NS, server: string) {
    try {
        ns.killall(server);
        ns.deleteServer(server);
        Logger.info(ns, `deleted server {0}`, server);
    } catch {
        Logger.error(ns, `ERROR: failed to delete server {0}`, server);
    }
}

export async function deleteAllServers(ns: NS) {
    ns.getPurchasedServers().forEach((server: string) => {
        deleteServer(ns, server);
    });
}