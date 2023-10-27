import { NS } from "@ns";
import { calculateMaxRAM } from "./hackLib";

export async function main(ns: NS) {
    while(true){
        const ram = calculateMaxRAM(ns);
        ns.tprint(`INFO: each server would get ${ram}GB`);
        await ns.sleep(1000);
    }
}