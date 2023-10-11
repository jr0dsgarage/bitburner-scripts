// created by j__r0d 10/11/23
export async function main(ns: any) {
    ns.tprint("...hacking servers")
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
        
    };

    if (hackToApply) {
        ns.tprint(`INFO: loading hack ${hackToApply}`)
        
        for (const [server,level] of Object.entries(servers)) {            
            ns.tprint(`INFO: applying hack to server: ${server}; ports req'd: ${level}`)
            ns.scp(hackToApply, server)
            if (level > 0) {
                ns.tprint(`WARN: elevating...`)
                ns.brutessh(server);
            }
            if (level > 1) {
                ns.ftpcrack(server);
            }
            ns.nuke(server)
            let threadsToUse = ns.getServerMaxRam(server) / ns.getScriptRam(hackToApply);
            ns.exec(hackToApply, server, ~~threadsToUse)
            ns.tprint(`INFO: hack enabled!`)
        };

    }
    else {
        ns.tprint("ERROR: no hack to apply. include script name!");
    }
}