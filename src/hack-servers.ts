/** @param {NS} ns */
// created by j__r0d 10/11/23
export async function main(ns: any) {
    ns.tprint("INFO: ...attempting server hack");

    const hackToApply = ns.args[0];

    const servers = {
        "n00dles": 0,
        "sigma-cosmetics": 0,
        "joesguns": 0,
        "hong-fang-tea": 0,
        "harakiri-sushi": 0,
        "nectar-net": 0,
        "iron-gym": 1,
        "zer0": 1,
        "max-hardware": 1,
        "neo-net": 1,
        "silver-helix": 2,
        "phantasy": 2,
        "omega-net": 2,
    } as { [hostname: string]: number }; //copilot suggested this last line

    // ===== main logic =====
    if (hackToApply) {
        ns.tprint(`INFO: using hack ${hackToApply}`);

        for (const [hostname, portLevel] of Object.entries(servers)) {
            ns.killall(hostname);
             ns.tprint(`INFO: deploying hack to server: ${hostname}...`);
            ns.scp(hackToApply, hostname);
            if (portLevel > 0) {
                ns.tprint(`WARN: not enough open ports. elevating...`);
                ns.brutessh(hostname);
            }
            if (portLevel > 1) {
                ns.ftpcrack(hostname);
            }
            ns.nuke(hostname);
            let threadsToUse = ns.getServerMaxRam(hostname) / ns.getScriptRam(hackToApply);
            ns.exec(hackToApply, hostname, ~~threadsToUse);
            ns.tprint(`INFO: ...hack deployed using ${~~threadsToUse} threads on ${hostname}`);
        };

        // TODO: add a check to find existing purchased servers

        
        await ns.run("start-purchased-servers.js", 1, hackToApply)

        if (ns.args[1] == "-h") {
            await ns.run("start-home-server.js", 1, hackToApply, "-k");
        }
        else { 
            ns.tprint("INFO: skipping home server. use 2nd arg '-h' to include home server in hacktivities.");
        }
        // ns.tprint("INFO:...hacks deployed!");
    }
    else {
        ns.tprint("ERROR: no hack to deploy. include script name! use 2nd arg '-h' to include home server in hacktivities.");
    }
}