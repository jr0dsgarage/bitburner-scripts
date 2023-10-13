// created by j__r0d 10/11/23
import { colors } from "./colors";
import { buildList } from "./scan-servers";
/** @param {NS} ns */

/** 
 * TODO: firm up the code that checks for open ports so that it will bail if it can't open enough ports to run NUKE.exe
 * TODO: add a check to find existing purchased servers, and then purchase them if they don't exist
 * TODO: check for require hacking skill before attempting hack, also
 */

export async function main(ns: any) {
    const hackToApply = ns.args[0];
    ns.tprint("INFO: attempting to hack all servers...");
    if (hackToApply) {
        ns.tprint(`INFO: ...using hack ${colors.Yellow}${hackToApply}${colors.Reset}`);
        let serverList = await buildList(ns);
        serverList.forEach(hostname => {
            if (!ns.hasRootAccess(hostname)) {
                ns.tprint(`INFO: ${colors.Cyan}${hostname}${colors.Reset} does not have root access. attempting root...`)
                ns.scp(hackToApply, hostname);
                let portLevel = ns.getServerNumPortsRequired(hostname);
                if (portLevel > 0) {
                    ns.tprint(`WARN: not enough open ports. elevating...`);
                    ns.brutessh(hostname);
                }
                if (portLevel > 1) {
                    ns.ftpcrack(hostname);
                }
                if (portLevel > 2) {
                    ns.relaysmtp(hostname);
                }
                try {
                    ns.nuke(hostname);
                    ns.tprint(`INFO: ...root access granted!`);
                }
                catch (e) {
                    ns.tprint(`ERROR: ...root access denied! cannot hack ${colors.Cyan}${hostname}${colors.Reset}!`);

                }
            }
            // at this point the server _should_ have root access,
            // but still could have failed to deploy NUKE.exe
            // so check for root access again before deploying hack
            // and make sure hacking skill is high enough, no sense in hacking without the skill required!
            if (ns.hasRootAccess(hostname) && ns.getServerRequiredHackingLevel(hostname)) {
                ns.tprint(`INFO: deploying hack to server: ${colors.Cyan}${hostname}${colors.Reset}...`);
                let threadsToUse = ns.getServerMaxRam(hostname) / ns.getScriptRam(hackToApply);
                ns.exec(hackToApply, hostname, ~~threadsToUse);
                ns.tprint(`INFO: ...hack deployed using ${colors.Magenta}${~~threadsToUse}${colors.Reset} threads`);
            }
        });

        // TODO: add a check to find existing purchased servers

        await ns.run("start-purchased-servers.js", 1, hackToApply)

        if (ns.args[1] == "-h") {
            await ns.run("start-home-server.js", 1, hackToApply, "-k");
        }
        else {
            ns.tprint("INFO: skipping home server. use 2nd arg '-h' to include home server in hacktivities.");
        }
        ns.toast("hacks deployed!");
    }
    else { 
        ns.tprint("ERROR: no hack to deploy. include script name! use 2nd arg '-h' to include home server in hacktivities.");
    };
}