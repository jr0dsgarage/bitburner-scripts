// created by j__r0d 10/16/23
import { colors } from "./colors";
// TODO: switch/case for elevating portLevel apps in a while loop, and build an enumerator for the Programs that can elevate
/** @param {NS} ns */
export async function main(ns: any) {
    let hostname = ns.args[0];
    let portsRequired = ns.args[1];
    openPorts(ns, hostname, portsRequired);
    /* try {
        if (portsRequired > 0) {

            ns.tprint(`WARN: not enough open ports...`)
            ns.tprint(`elevating...`);



            if (ns.fileExists("brutessh.exe")) ns.brutessh(hostname);
        }
        if (portsRequired > 1 && ns.fileExists("ftpcrack.exe")) {
            ns.ftpcrack(hostname);
        }
        if (portsRequired > 2 && ns.fileExists("relaysmtp.exe")) {
            ns.relaysmtp(hostname);
        }
    }
    catch {
        ns.tprint(`ERROR: cannot elevate ports on ${colors.Cyan}${hostname}${colors.Reset}! ...aborting`);
        return;
    }
 */
}

export async function openPorts(ns: any, hostname: string, portsRequired: number) {
    const programs = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe"];
    const maxPorts = 3; //will need increased if more port opening apps are added (find a way to get this from ns. ?)
    let i = 0;
    ns.tprint(`INFO: ... attempting to open ports on ${colors.Cyan}${hostname}${colors.Reset}...`);
    while (i < portsRequired) {
        ns.tprint(`INFO: ...opening port ${colors.Magenta}${i}${colors.Reset}`);
        switch (i) {
            case 0:
                try{
                    if (ns.fileExists(programs[i])) ns.brutessh(hostname);
                }
                catch {
                    ns.tprint(`ERROR: BruteSSH unavailable ...aborting`);
                    return;
                }
                break;
            case 1:
                try {
                    if (ns.fileExists(programs[i])) ns.ftpcrack(hostname);
                }
                catch {
                    ns.tprint(`ERROR: FTPCrack unavailable ...aborting`);
                    return;
                }
                break;
            case 2:
                try{
                    if (ns.fileExists(programs[i])) ns.relaysmtp(hostname);
                }
                catch {
                    ns.tprint(`ERROR: RelaySMTP unavailable ...aborting`);
                    return;
                }
                break;
        }
        i++;
    }
}