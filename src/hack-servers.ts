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
    } as { [hostname: string]: number}  //copilot suggestion

    if (hackToApply) {
        ns.tprint(`INFO: loading hack ${hackToApply}`)
        
        for (const [hostname, portLevel] of Object.entries(servers)) {      
            ns.tprint(`INFO: killing all scripts on server: ${hostname}`)
            ns.killall(hostname)
            ns.tprint(`INFO: applying hack to server: ${hostname}`)
            ns.scp(hackToApply, hostname)
            if (portLevel > 0) {
                ns.tprint(`WARN: elevating...`)
                ns.brutessh(hostname);
            }
            if (portLevel > 1) {
                ns.ftpcrack(hostname);
            }
            ns.nuke(hostname)
            let threadsToUse = ns.getServerMaxRam(hostname) / ns.getScriptRam(hackToApply);
            ns.exec(hackToApply, hostname, ~~threadsToUse)
            ns.tprint(`INFO: hack enabled!`)
        }

        ns.tprint("INFO: starting scripts on purchased servers")
        await ns.run("start-purchased-servers.js", 1, hackToApply)
        ns.tprint("INFO:...hacking complete")
    }
    else {
        ns.tprint("ERROR: no hack to apply. include script name!")
    }
}