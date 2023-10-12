/** @param {NS} ns */
export async function main(ns: any) {
    ns.tprint("INFO: deploying hack on purchased servers...");
    const hackToApply = ns.args[0];
    let i = 0;
    while (i < ns.getPurchasedServerLimit()) {
        let hostname = "pserv-".concat(i.toString());
        ns.killall(hostname);
        let threadsToUse = ns.getServerMaxRam(hostname) / ns.getScriptRam(hackToApply);
        ns.exec(hackToApply, hostname, ~~threadsToUse);
        ns.tprint(`INFO: ...hack deployed using ${~~threadsToUse} threads on ${hostname}`);
        ++i;
    }
    ns.tprint(`INFO:...hacks deployed on ${i} purchased servers`);
}