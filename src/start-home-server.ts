/** @param {NS} ns */
export async function main(ns: any) {
    const hackToApply = ns.args[0];
    let hostname = "home";
    let threadsToUse = ns.getServerMaxRam(hostname) / ns.getScriptRam(hackToApply);
    ns.run(hackToApply, { threads: ~~threadsToUse });
    ns.tprint(`INFO: started hack on ${hostname} with ${~~threadsToUse} threads`);
}