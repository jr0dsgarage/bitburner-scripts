import { NS } from '@ns';
import { colors } from './colors';
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
        ns.tprint(`ERROR: no server specified for deletion! ${colors.Red}(use -a to delete all purchased servers)${colors.Reset}`);
    }
    
}

export async function deleteServer(ns: NS, server: string) {
    try {
        ns.killall(server);
        ns.deleteServer(server);
        ns.tprint(`INFO: deleted server ${colors.Cyan}${server}${colors.Reset}`);
    } catch {
        ns.tprint(`ERROR: failed to delete server ${colors.Cyan}${server}${colors.Reset}`);
    }
}

export async function deleteAllServers(ns: NS) {
    ns.getPurchasedServers().forEach((server: string) => {
        deleteServer(ns, server);
    });
}