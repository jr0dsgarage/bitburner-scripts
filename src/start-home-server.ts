/** @param {NS} ns */
export async function main(ns: any) {
    const hackToApply = ns.args[0];
    let hostname = "home";
    let availableRAM = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
    if (ns.args[1] == "-k") {
        ns.killall();
    }
    let threadsToUse = availableRAM / ns.getScriptRam(hackToApply);
    
    ns.run(hackToApply, ~~threadsToUse);
    ns.tprint(`INFO: started ${hackToApply} on ${hostname} with ${~~threadsToUse} threads`);
}