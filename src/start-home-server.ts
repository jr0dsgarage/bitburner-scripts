/** @param {NS} ns */
export async function main(ns: any) {
    ns.tprint("INFO: deploying hack on home server...");
    const hackToApply = ns.args[0];
    let hostname = "home";
    let availableRAM = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
    if (ns.args[1] == "-k") {
        ns.killall();
    }
    let threadsToUse = availableRAM / ns.getScriptRam(hackToApply);
    ns.run(hackToApply, ~~threadsToUse);
    ns.tprint(`INFO: ...hack deployed using ${~~threadsToUse} threads on ${hostname}`);
}