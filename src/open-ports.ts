// created by j__r0d 10/16/23
import { NS } from "@ns";
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: NS) {
    let hostname = ns.args[0]?.toString();
    let portsRequired = ns.args[1];
    openPorts(ns, hostname, ~~portsRequired);
}

/**
 * @remarks This function opens a specified number of ports on a server. 
 * @param ns 
 * @param hostname server's hostname
 * @param portsRequired number of ports to open
 * @returns 
 */
export async function openPorts(ns: NS, hostname: string, portsRequired: number) {
    const programs = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe","httpworm.exe","sqlinject.exe"];
    const maxPorts = programs.length;
    for (let i = 0; i < portsRequired && i < maxPorts; i++) {
        ns.tprint(`INFO: ...opening port ${colors.Magenta}${i+1}${colors.Reset}`); // i+1 because ports are 1-indexed
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
                ns.tprint(`ERROR: ${programs[i]} unavailable ...aborting`);
                return;
            }
        } catch {
            ns.tprint(`ERROR: Failed to open port ${i+1} ...aborting`);
            return;
        }
    }
}