// created by j__r0d 10/12/23
// scans all servers and builds a list of servers to hack
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: any) {
    let serverList = await buildList(ns);
    ns.tprintf(`found ${colors.Cyan}${serverList.length}${colors.Reset} servers`)
    // ns.tprintf(`${colors.Cyan}${serverList}${colors.Reset}`);
}
/** @param {NS} ns */
export async function buildList(ns: any) {
    const serverList: Array<string> = [];
    for (const hostname of await ns.scan()) {
        if (canAddServer(hostname, serverList)) {
            ns.tprintf(`server found: ${colors.Cyan}${hostname}${colors.Reset}`);
            serverList.push(hostname);
        }

        for (const neighborServer of await ns.scan(hostname)) {
            if (canAddServer(neighborServer, serverList)) {
                ns.tprintf(`server found: ${colors.Cyan}${neighborServer}${colors.Reset}`);
                serverList.push(neighborServer);
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
 * the above function was created by Copilot after I asked a few questions about a better way to do this.
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
