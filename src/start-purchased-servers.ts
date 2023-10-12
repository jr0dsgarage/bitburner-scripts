/** @param {NS} ns */
export async function main(ns: any) {
    const hackToApply = ns.args[0];
    let i = 0;
    while (i < ns.getPurchasedServerLimit()) {
        let hostname = "pserv-".concat(i.toString());
        ns.killall(hostname);
        let threadsToUse = ns.getServerMaxRam(hostname) / ns.getScriptRam(hackToApply);
        ns.exec(hackToApply, hostname, ~~threadsToUse);
        ns.tprint(`INFO: started ${hackToApply} on ${hostname} with ${~~threadsToUse} threads`);
        ++i;
    }
}