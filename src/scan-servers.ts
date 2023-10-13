// created by j__r0d 10/12/23
// tests to work out scanning servers via script
import { colors } from "./colors";

/** @param {NS} ns */
export async function main(ns: any) {
    let serverList = ns.scan() as string[];
    serverList.forEach((server) => {
        ns.scan(server).forEach((neighborServer: string) => {
            if (!(serverList.includes(neighborServer) || neighborServer=="home")) serverList.push(neighborServer);
        })
    });
    ns.tprintf(`${colors.Cyan}${serverList}${colors.Reset}`);
}