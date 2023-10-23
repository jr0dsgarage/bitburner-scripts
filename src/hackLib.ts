// a library of functions used to hack servers and other fun things
// created by j__r0d 2023-10-22

import { NS } from '@ns';
import { colors } from './colors';

/**
 * @remarks This function is a recursive function that scans servers to a given tree depth and returns a list of all servers to hack.
 * @param {NS} ns 
 * @param depth scan depth; defaults to 1
 * @param serverList [Optional] running list of servers (is returned at end of recursion)
 * @param scannedServers [Optional] list of servers already scanned
 * @returns Array of all servers found up to specified depth.  The server hostnames in the returned array are string values. 
 * @remarks I gave Copilot this comment block and asked it to write the function for me, using what existing code I had as a base, so it would use the canAddServer function.
 * 
 * if list is empty, do a scan(), which runs scan on home server and make a list of all scannedServers
 * add scannedServers to serverList if they can be added (not forbidden, not a duplicate, not a prefix)
 * decrease depth because we've done one scan and serverAdd
 * check that depth > 0
 * scan each of the serverList servers to get neighborsList and add neighborsList to scannedServers
 * add neighborsList to serverList if they can be added (not forbidden, not a duplicate, not a prefix)
 * decrease depth because we've done another scan
 * scan each of the neighborsList servers to get secondNeighborsList and add secondNeighborsList to scannedServers
 * add secondNeighborsList to serverList if they can be added (not forbidden, not a duplicate, not a prefix)
 * decrease depth because we've done another scan
 * if depth is ever 0, return serverList
 */
export async function buildScannedServerList(ns: NS, depth: number, serverList: string[] = [], scannedServers: string[] = []) {
    if (serverList.length === 0) {
        scannedServers = ns.scan();
        serverList = scannedServers.filter(server => canAddServer(server, serverList));
        --depth;
    }

    while (depth > 0) {
        const newServers: string[] = [];

        for (const server of serverList) {
            const neighbors = await (async () => ns.scan(server))();
            const newNeighbors = neighbors.filter(server => canAddServer(server, serverList.concat(newServers)));
            newServers.push(...newNeighbors);
            scannedServers.push(...newNeighbors);
        }

        serverList.push(...newServers);
        --depth;
    }

    return serverList;
}

/**
 * @remarks checks a server hostname against a list of forbidden servers and prefixes, and a list of servers already in the server list.
 * @param serverHostname hostname of server to check against forbidden servers and prefixes
 * @param serverListName list of servers to check against for duplicates
 * @returns boolean value indicating whether the server can be added to the server list
 * @remarks the code in this function was created by Copilot after I asked a few questions about a better way to do this.
 * below was my attempt....clearly I wasn't thinking in the same direction at all, however copilot _did_ use this code to generate its own code.
 * ```js
 *     export function canAddServer(serverName: string, serverListName: string[]) {
 *         if (!(serverListName.includes(serverName)) || !(serverName == 'home' || 'darkweb') || !serverName.includes('pserv')) {
 *             return true;
 *         }
 *         else {
 *             return false;
 *         }
 *     }; 
 * ```
 */
export function canAddServer(serverHostname: string, serverListName: string[]) {
    const forbiddenServers = ['home', 'darkweb'];
    const forbiddenServerPrefixes = ['pserv-'];

    const isForbiddenServer = forbiddenServers.some(forbiddenServer => forbiddenServer === serverHostname);
    const isForbiddenServerPrefix = forbiddenServerPrefixes.some(prefix => serverHostname.startsWith(prefix));
    const isDuplicateServer = serverListName.includes(serverHostname);

    return !isForbiddenServer && !isDuplicateServer && !isForbiddenServerPrefix;
};

/**
 * @remarks deploys a hack script to a server and starts it running, using the maximum number of threads available.
 * @param ns Netscript namespace
 * @param hostname server's hostname
 * @param hackToDeploy hack script to deploy
 * @param hackTarget target server for the deployed hack
 */
export async function deployHack(ns: NS, hostname: string, hackToDeploy: string = "my-first-hack.js", hackTarget: string = `joesguns`) {
    ns.tprint(`INFO: deploying hack to server: ${colors.Cyan}${hostname}${colors.Reset}`);

    ns.killall(hostname); // free up RAM
    ns.scp(hackToDeploy, hostname); // always over-write the existing script with the latest version
    let threadsToUse = Math.max(1, (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(hackToDeploy));
    ns.exec(hackToDeploy, hostname, ~~threadsToUse, hackTarget);
    
    if (ns.scriptRunning(hackToDeploy, hostname)) ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads!`);
}

/**
 * @remarks fetches all fetch-able files from a server that are not already in the home directory.
 * @param ns Netscript namespace
 * @param hostname hostname of server from which to fetch files
 * @param homefilelist the list of files in the home directory
 */
export async function fileFetch(ns: NS, hostname: string, homefilelist: string[] = []) {   
    ns.ls(hostname).forEach((file: string) => {
        if (!homefilelist.includes(file))
            try {
                ns.scp(file, `home`, hostname);
                ns.tprint(`INFO: ...${file} fetched from ${hostname}`);
            }
            catch { ns.tprint(`ERROR: ...can't fetch ${file} from ${hostname}!`); }
    });
}

/**
 * @remarks determines whether DeepscanV1.exe and/or DeepscanV2.exe are available, and provides the maximum scan depth possible depending on the outcome.
 * @param ns Netscript namespace
 * @returns maximum scan depth based on the executables available, returns a number
 */
export async function getScanDepth(ns: NS) {
    let scanDepth: number = 3;
    if (ns.fileExists(`DeepscanV1.exe`)) scanDepth = 5;
    if (ns.fileExists(`DeepscanV2.exe`)) scanDepth = 10;
    return scanDepth;
}

/**
 * @remarks attempts to nuke a server, and outputs results to the terminal.
 * @param ns Netscript namespace
 * @param hostname hostname of server to nuke
 */
export async function nukeServer(ns: NS, hostname: string) {
        try {
            ns.nuke(hostname);
            ns.tprint(`INFO: ...💣 successful. root access granted!`);
        }
        catch {
            ns.tprint(`ERROR: ...root access denied! ❌ cannot hack ${colors.Cyan}${hostname}${colors.Reset}!`);
        }
}

/**
 * @remarks This function opens a specified number of ports on a server. 
 * @param ns Netscript namespace
 * @param hostname hostname of server on which to open ports
 */
export async function openPorts(ns: NS, hostname: string) {
    const programs = [
        `brutessh.exe`,
        `ftpcrack.exe`,
        `relaysmtp.exe`,
        `httpworm.exe`,
        `sqlinject.exe`
    ];
    const maxPorts = programs.length;
    const portsRequired = ns.getServerNumPortsRequired(hostname);
    for (let i = 0; i < portsRequired && i < maxPorts; i++) {
        //ns.tprint(`INFO: ...opening port ${colors.Magenta}${i+1}${colors.Reset}...`); // i+1 because ports are 1-indexed
        try {
            if (ns.fileExists(programs[i])) {
                switch (i) {
                    case 0:
                        ns.brutessh(hostname);
                        break;
                    case 1:
                        ns.ftpcrack(hostname);
                        break;
                    case 2:
                        ns.relaysmtp(hostname);
                        break;
                    case 3:
                        ns.httpworm(hostname);
                        break;
                    case 4:
                        ns.sqlinject(hostname);
                        break;
                }
            } else {
                throw (`${colors.Yellow}${programs[i]}${colors.Reset} unavailable, cannot open port ${colors.Magenta}${i+1}${colors.Reset}`);
            }
        } catch(err) {
            ns.tprint(`ERROR: ${err} ...aborting`);
            break;
        }
    }
}

/**
 * @remarks purchases a server with the specified hostname and RAM, and returns the hostname of the purchased server.
 * @param ns Netscript namespace
 * @param hostname name of the server to purchase
 * @param ram amount of RAM to purchase
 * @returns the hostname of the purchased server, as a string
 */
export async function purchaseServer(ns: NS, hostname: string, ram: number) {
    ns.purchaseServer(hostname, ram);
    return hostname;
}

export async function startPurchasedServers(ns: NS, hackToDeploy: string, hackTarget: string, ramToPurchase: number) {

}

// this doesn't do anything yet, but needs to be implemented
export async function upgradeServer(ns: NS, hostname: string, ram: number) {
    ns.upgradePurchasedServer(hostname, ram);
}

/**
 * @remarks If the money available on the current server is greater than the money available on the accumulator server, 
 * @remarks the callback function returns the name of the current server (b), otherwise it returns the name of the accumulator server (a). 
 * @remarks This process continues until all servers in the array have been compared, at which point the name of the server with the highest amount of money available is returned.
 * @param ns Netscript namespace
 * @param serverList list of servers to compare
 * @returns The server hostname that has the most money available, the server hostname will be a string.
 */
const serverWithMostMoney = (ns: NS, serverList: any) => {
    const servers = serverList.filter((server: string) => server !== `home` && !/pserv-\d/.test(server));
    return servers.reduce((accumulator: string, currentValue: string) => {
        return ns.getServerMoneyAvailable(currentValue) > ns.getServerMoneyAvailable(accumulator)
            ? currentValue
            : accumulator;
    });
};