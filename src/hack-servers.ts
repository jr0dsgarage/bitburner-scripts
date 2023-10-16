// created by j__r0d 10/11/23
import { colors } from "./colors";
import { buildScannedServerList } from "./scan-servers";
/** @param {NS} ns */

/** 
 * TODO: firm up the code that checks for open ports so that it will bail if it can't open enough ports to run NUKE.exe
 * TODO: add a check to find existing purchased servers, and then purchase them if they don't exist
 * TODO: check for require hacking skill before attempting hack, also
 * TODO: write a logger script that will log all the things
 * TODO: abstract this mess of a script so that each snippet is its own, call-able script that can be used in other scripts
 * TODO: error message for when the script is called without a hack to deploy
 * TODO: check for different deepscan apps to probe to the appropriate depth
 */

export async function main(ns: any) {
    const hackToDeploy: string = ns.args[0];
    const scanDepth = 5; // can we get this from ns. ?? scan-analyze depth
    ns.tprint("INFO: attempting to hack all servers...");
    
    
    if (hackToDeploy) {
        ns.tprint(`INFO: ...deploying hack ${colors.Yellow}${hackToDeploy}${colors.Reset}`);
        let serverList = await buildScannedServerList(ns, scanDepth);
        ns.tprintf(`INFO: found ${colors.Cyan}${serverList.length}${colors.Reset} servers during scan of depth ${colors.Magenta}${scanDepth}${colors.Reset}...`)
        serverList.forEach(hostname => {
            let portLevel = ns.getServerNumPortsRequired(hostname);
            if (!ns.hasRootAccess(hostname)) {
                ns.tprint(`INFO: ${colors.Cyan}${hostname}${colors.Reset} does not have root access. attempting root...`)
                ns.scp(hackToDeploy, hostname);
                if (portLevel > 0) {
                    ns.tprint(`WARN: not enough open ports...`)
                    ns.tprint(`elevating...`);
                    if (ns.fileExists("brutessh.exe")) ns.brutessh(hostname);
                }
            }
            try {
                if (portLevel > 1 && ns.fileExists("ftpcrack.exe")) {
                    ns.ftpcrack(hostname);
                }
                if (portLevel > 2 && ns.fileExists("relaysmtp.exe")) {
                    ns.relaysmtp(hostname);
                }
            }
            catch {
                ns.tprint(`ERROR: cannot elevate ports on ${colors.Cyan}${hostname}${colors.Reset}! ...aborting`);
            }
            if (!ns.hasRootAccess(hostname)) {
                try {
                    ns.nuke(hostname);
                    ns.tprint(`INFO: ...root access granted!`);
                }
                catch {
                    ns.tprint(`ERROR: ...root access denied! cannot hack ${colors.Cyan}${hostname}${colors.Reset}!`);
                }
            }

            // install backdoor via script here?

            // at this point the server _should_ have root access,
            // but still could have failed to deploy NUKE.exe
            // so check for root access again before deploying hack
            // and make sure hacking skill is high enough, no sense in hacking without the skill required!
            if (ns.hasRootAccess(hostname) && ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(hostname)) {
                ns.tprint(`INFO: deploying hack to server: ${colors.Cyan}${hostname}${colors.Reset}...`);
                let threadsToUse = ns.getServerMaxRam(hostname) / ns.getScriptRam(hackToDeploy);
                ns.exec(hackToDeploy, hostname, ~~threadsToUse);
                ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads`);
            }
        });

        // TODO: add a check to find existing purchased servers and then purchase them if they don't exist

        if (serverList.includes("pserv-")) await ns.run("start-purchased-servers.js", 1, hackToDeploy);

        if (ns.args[1] == "-h") await ns.run("start-home-server.js", 1, hackToDeploy, "-k");
        else ns.tprint("INFO: skipping home server. use 2nd arg '-h' to include home server in hacktivities.");
        
        ns.toast("hacks deployed!");
    }
    else {
        ns.tprint("ERROR: no hack to deploy. include script name! use 2nd arg '-h' to include home server in hacktivities.");
    };
}