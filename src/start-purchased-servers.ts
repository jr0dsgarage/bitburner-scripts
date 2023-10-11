/** @param {NS} ns */
export async function main(ns: any, hackToApply: string) {
    let i = 0;
    while (i < ns.getPurchasedServerLimit()) {
        let hostname = "pserv-".concat(i.toString());
        let threadsToUse = ns.getServerMaxRam(hostname) / ns.getScriptRam(hackToApply);
        ns.exec("early-hack-template.js", hostname, threadsToUse);
    }
}