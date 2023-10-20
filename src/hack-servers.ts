// created by j__r0d 10/11/23
import { colors } from "./colors";
import { buildScannedServerList } from "./scan-servers";
import { openPorts } from "./open-ports";
import { deployHack } from "./deploy-hack";
import { NS } from "@ns";
/** 
 * @param {NS} ns Netscript namespace
 */

/** 
 * TODO: write a logger script that will log all the things - might be unnecessary?  i'm only after a better way to format the terminal output
 * TODO: abstract this mess of a script so that each snippet is its own, call-able script that can be used in other scripts
 *          - this is in progress. at the end of the day, the script will be a long 'to-do' list and may never not be a bit messy
 * TODO: hack target??  from Documentation/beginner's guide: 
 *      `your hacking target should be the  with highest max money that's required hacking level is under 1/2 of your hacking level.`
 *      `Keep security level low. Security level affects everything when hacking. Two important Netscript functions for this are getServerSecurityLevel() and getServerMinSecurityLevel()`
 * TODO: instead of a bunch of helper scripts, make a Library of helper functions (ie: hackLib.openPorts(ns, hostname))
 */

export async function main(ns: NS) {
    const hackToDeploy: string = ns.args[0]?.toString();
    const includeHome = (ns.args[1]?.toString() === `-h`);
    let scanDepth = 3;
    if (ns.fileExists(`DeepscanV1.exe`)) scanDepth = 5;
    if (ns.fileExists(`DeepscanV2.exe`)) scanDepth = 10;

    ns.tprint(`INFO: hack initiated...`);
    if (hackToDeploy) {
        let serverList = await buildScannedServerList(ns, scanDepth);
        ns.tprint(`INFO: found ${colors.Cyan}${serverList.length}${colors.Reset} servers during scan of depth ${colors.Magenta}${scanDepth}${colors.Reset}...`);

        ns.tprint(`INFO: selecting best 🎯 server...`)
        const hackTarget = `joesguns`; //serverWithMostMoney(ns, serverList); --need to account for hacking level, and choose the best server that has high money but low hacking level
        ns.tprint(`INFO: ...${colors.Green}${hackTarget}${colors.Reset} selected!`);

        ns.tprint(`INFO: attempting to hack servers...`);
        serverList.forEach((hostname: string) => {
            if (!ns.hasRootAccess(hostname)) {
                ns.tprint(`WARN: ${colors.Cyan}${hostname}${colors.Reset} does not have root access. attempting root...`);
                openPorts(ns, hostname);
                try {
                    ns.nuke(hostname);
                    ns.tprint(`INFO: ...💣 successful. root access granted!`);
                }
                catch {
                    ns.tprint(`ERROR: ...root access denied! ❌ cannot hack ${colors.Cyan}${hostname}${colors.Reset}!`);
                }
            }
            else {
                deployHack(ns, hostname, hackToDeploy, hackTarget);
            }
        });

        // check for existing purchased servers and start them, or purchase them if they don't exist and there's enough money
        ns.tprint(`INFO: checking for purchased servers...`)
        if (ns.getPurchasedServers().length > 0) {
            ns.tprint(`INFO: ...found purchased servers; deploying hack...`);
            ns.run(`start-purchased-servers.js`, 1, hackToDeploy, hackTarget);
        }
        else if (ns.getServerMoneyAvailable(`home`) > (ns.getPurchasedServerCost(16) * ns.getPurchasedServerLimit())) {
            // TODO: fix the purchase server script to properly deploy the hack instead of a hardcoded script name
            ns.tprint(`INFO: enough monies secured; purchasing servers...`)
            ns.run(`purchase-server-16gb.js`, 1, hackToDeploy, hackTarget);
        }
        else ns.tprint(`INFO: ...no purchased servers; ...skipping`);

        if (includeHome) ns.run(`start-home-server.js`, 1, hackToDeploy, hackTarget, `-k`);
        else ns.tprint(`INFO: skipping home server. use 2nd arg '-h' to include home server in hacktivities.`);

        ns.toast(`hacks deployed!`);
    }
    else {
        ns.tprint(`ERROR: no hack to deploy. include script name! use 2nd arg '-h' to include home server in hacktivities.`);
    };
}

/**
 * @remarks If the money available on the current server is greater than the money available on the accumulator server, 
 * @remarks the callback function returns the name of the current server (b), otherwise it returns the name of the accumulator server (a). 
 * @remarks This process continues until all servers in the array have been compared, at which point the name of the server with the highest amount of money available is returned.
 * @param ns Netscript namespace
 * @param serverList List of scanned servers
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