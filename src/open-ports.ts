// created by j__r0d 10/16/23
import { NS } from "@ns";
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: NS) {
    let hostname = ns.args[0]?.toString();
    let portsRequired = ns.args[1];
    openPorts(ns, hostname, ~~portsRequired);
}

export async function openPorts(ns: any, hostname: string, portsRequired: number) {
    const programs = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe"];
    const maxPorts = programs.length;
    ns.tprint(`INFO: ... attempting to open ports on ${colors.Cyan}${hostname}${colors.Reset}...`);
    for (let i = 0; i < portsRequired && i < maxPorts; i++) {
        ns.tprint(`INFO: ...opening port ${colors.Magenta}${i}${colors.Reset}`);
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
                }
            } else {
                ns.tprint(`ERROR: ${programs[i]} unavailable ...aborting`);
                return;
            }
        } catch {
            ns.tprint(`ERROR: Failed to open port ${i} ...aborting`);
            return;
        }
    }
}