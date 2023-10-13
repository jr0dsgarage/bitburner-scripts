// created by j__r0d 10/12/23
// tests to work out scanning servers via script
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: any) {
    let serverList: Array<string> = [];
    ns.tprintf(`${colors.Cyan}${serverList}${colors.Reset}`);
    ns.scan().forEach((server: string) => {
        if (canAddServer(server, serverList)) {
            ns.tprintf(`found new server: ${colors.Cyan}${server}${colors.Reset}`)
            serverList.push(server);           
        }
        ns.scan(server).forEach((neighborServer: string) => {
            if (canAddServer(neighborServer, serverList)) {
                serverList.push(neighborServer)
            };
        })
    });
}

/**
 * 
 * @param serverName Name of server to check against forbidden servers and prefixes
 * @param serverListName List of servers to check against for duplicates
 * @returns 
 */
export function canAddServer(serverName: string, serverListName: string[]) {
    const forbiddenServers = ['home', 'darkweb'];
    const forbiddenServerPrefixes = ['pserv-'];

    const isForbiddenServer = forbiddenServers.some(forbiddenServer => forbiddenServer === serverName);
    const isForbiddenServerPrefix = forbiddenServerPrefixes.some(prefix => serverName.startsWith(prefix));
    const isDuplicateServer = serverListName.includes(serverName);

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
