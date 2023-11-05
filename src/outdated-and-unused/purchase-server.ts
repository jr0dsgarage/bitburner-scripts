// the contents of this script came from the Beginner's Guide in the game's documentation...
import { NS } from '@ns';
import { deployHack, purchaseServer, upgradeServer, colors, defaultHackToDeploy, calculateMaxRAM} from '../hackLib';
/** @param {NS} ns */

/**
 * @param {NS} ns 
 */

export async function main(ns: NS) {
    const hackToDeploy: string = ns.args[0].toString() || defaultHackToDeploy;
    const hackTarget: string = ns.args[1].toString() || defaultHackToDeploy;
    const ram: number = ns.args[2] ? parseInt(ns.args[2].toString()) : calculateMaxRAM(ns);

    

    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers, + 1 to account for 1-based indexing
    let i = 1;
    while (i < ns.getPurchasedServerLimit() + 1) {
        
        // TODO: implement an upgrade feature that will upgrade existing servers 
        // if the purchased-server script is called with a higher RAM value than the existing RAM on the server

        if (ns.getServerMoneyAvailable(`home`) > ns.getPurchasedServerCost(ram)) {
            const hostname: string = await purchaseServer(ns,`pserv-` + i, ram);
            ns.tprint(`INFO: purchased server ${colors.Cyan}${hostname}${colors.Reset} with ${colors.Green}${ram}GB${colors.Reset} RAM`);
            await deployHack(ns, hostname, hackToDeploy, hackTarget);
            ++i;
        }
        else {
            ns.tprint(`not enough monies to purchase server. aborting...`)
        }
        //Make the script wait for 100 milli-seconds before looping again.
        //Removing this line will cause an infinite loop and crash the game.
        await ns.sleep(100);
    }
}