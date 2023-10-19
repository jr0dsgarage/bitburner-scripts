// created by j__r0d 10/11/23
import { colors } from "./colors";
import { buildScannedServerList } from "./scan-servers";
import { openPorts } from "./open-ports";
import { NS } from "@ns";
/** 
 * @param {NS} ns Netscript namespace
 */

/** 
 * TODO: write a logger script that will log all the things - might be unnecessary?  i'm only after a better way to format the terminal output
 * TODO: add a check to find existing purchased servers, and then purchase them if they don't exist
 * TODO: abstract this mess of a script so that each snippet is its own, call-able script that can be used in other scripts
 * TODO: check for different deepscan exe's to probe to the appropriate depth
 * TODO: hack target??  from Documentation/beginner's guide: 
 *      "your hacking target should be the  with highest max money that's required hacking level is under 1/2 of your hacking level."
 * 
 */

export async function main(ns: NS) {
    const hackToDeploy: string = ns.args[0]?.toString();
    const includeHome = (ns.args[1]?.toString() === "-h");
    let scanDepth = 3; 
    if (ns.fileExists("DeepscanV1.exe")) scanDepth = 5;
    if (ns.fileExists("DeepscanV2.exe")) scanDepth = 10;
    
    ns.tprint("INFO: hack initiated...");
    if (hackToDeploy) {
        let serverList = await buildScannedServerList(ns, scanDepth);
        ns.tprint(`INFO: found ${colors.Cyan}${serverList.length}${colors.Reset} servers during scan of depth ${colors.Magenta}${scanDepth}${colors.Reset}...`);

        const hackTarget = `joesguns`; //serverWithMostMoney(ns, serverList);
        ns.tprint(`INFO: 🎯${colors.Green}${hackTarget}${colors.Reset} `);

        ns.tprint(`INFO: ...attempting to hack servers...`);
        serverList.forEach((hostname: string) => {
            ns.scp(hackToDeploy, hostname);
            if (!ns.hasRootAccess(hostname)) {
                ns.tprint(`WARN: ${colors.Cyan}${hostname}${colors.Reset} does not have root access. attempting root...`);
                openPorts(ns, hostname);
                try {
                    ns.nuke(hostname);
                    ns.tprint(`INFO: ...root access granted!`);
                }
                catch {
                    ns.tprint(`ERROR: ...root access denied! cannot hack ${colors.Cyan}${hostname}${colors.Reset}!`);
                }
            }

            // at this point the server _should_ have root access,
            // but still could have failed to deploy NUKE.exe
            // so check for root access again before deploying hack
            // and make sure hacking skill is high enough, no sense in hacking without the skill required!
            if (ns.hasRootAccess(hostname)) { //&& ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(hostname)) {
                ns.killall(hostname);
                let threadsToUse = Math.max(1, (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(hackToDeploy));
                ns.tprint(`INFO: deploying hack to server: ${colors.Cyan}${hostname}${colors.Reset}`);
                
                ns.exec(hackToDeploy, hostname, ~~threadsToUse, hackTarget);
                if (ns.scriptRunning(hackToDeploy, hostname)) ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads!`);
            }
        });

        // TODO: add a check to find existing purchased servers and then purchase them if they don't exist
        if (ns.scan().includes(`pserv-1`)) ns.run("start-purchased-servers.js", 1, hackToDeploy, hackTarget);
        else ns.tprint("INFO: no purchased servers, skipping...");

        if (includeHome) ns.run("start-home-server.js", 1, hackToDeploy, hackTarget, "-k");
        else ns.tprint("INFO: skipping home server. use 2nd arg '-h' to include home server in hacktivities.");

        ns.toast("hacks deployed!");
    }
    else {
        ns.tprint("ERROR: no hack to deploy. include script name! use 2nd arg '-h' to include home server in hacktivities.");
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
    const servers = serverList.filter((server: string) => server !== "home" && !/pserv-\d/.test(server));
    return servers.reduce((accumulator: string, currentValue: string) => {
      return ns.getServerMoneyAvailable(currentValue) > ns.getServerMoneyAvailable(accumulator)
        ? currentValue
        : accumulator;
    });
  };