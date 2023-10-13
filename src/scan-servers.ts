// created by j__r0d 10/12/23
// scans all servers and builds a list of servers to hack
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: any, depth: number) {
    let serverList = await buildScannedServerList(ns, depth);
    ns.tprintf(`found ${colors.Cyan}${serverList.length}${colors.Reset} servers`)
    ns.tprintf(`${colors.Cyan}${serverList}${colors.Reset}`);
}
/**
 * 
 * @param ns 
 * @param depth scan depth; defaults to 1
 * @param serverList [Optional] running list of servers (is returned at end of recursion)
 * @param scannedServers [Optional] list of servers already scanned
 * @returns 
 */
export async function buildScannedServerList(ns: any, depth: number = 1, serverList: string[] = [], scannedServers: string[] = []) {
    ns.tprintf(`scanning servers to depth ${colors.Magenta}${depth}${colors.Reset}`);
    if (depth <= 0) {
        return serverList;
    }

    const serversToScan = await ns.scan(...scannedServers);

    for (const server of serversToScan) {
        if (canAddServer(server, serverList)) {
            ns.tprintf(`server found: ${colors.Cyan}${server}${colors.Reset}`);
            serverList.push(server);
        }
    }

    if (depth > 1) {
        for (const server of serversToScan) {
            if (!scannedServers.includes(server)) {
                const neighborServers = await ns.scan(server);
                const newScannedServers = [...scannedServers, server];
                await buildScannedServerList(ns, depth - 1, serverList, newScannedServers.concat(neighborServers));
            }
        }
    }

    return serverList;
}

/**
 * 
 * @param serverHostname Name of server to check against forbidden servers and prefixes
 * @param serverListName List of servers to check against for duplicates
 * @returns 
 */
export function canAddServer(serverHostname: string, serverListName: string[]) {
    const forbiddenServers = ['home', 'darkweb'];
    const forbiddenServerPrefixes = ['pserv-'];

    const isForbiddenServer = forbiddenServers.some(forbiddenServer => forbiddenServer === serverHostname);
    const isForbiddenServerPrefix = forbiddenServerPrefixes.some(prefix => serverHostname.startsWith(prefix));
    const isDuplicateServer = serverListName.includes(serverHostname);

    return !isForbiddenServer && !isForbiddenServerPrefix && !isDuplicateServer;
};

/**
 * the above functions were created by Copilot after I asked a few questions about a better way to do this.
 * below was my attempt....clearly I wasn't thinking in the same direction at all,
 * however copilot did use this code to generate its own code.
export function canAddServer(serverName: string, serverListName: string[]) {
    if (!(serverListName.includes(serverName)) || !(serverName == "home" || "darkweb") || !serverName.includes("pserv")) {
        return true;
    }
    else {
        return false;
    }
}; 
*/
