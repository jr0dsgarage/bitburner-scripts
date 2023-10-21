// the contents of this script came from the Beginner's Guide in the game's documentation...
import { NS } from '@ns';
import { colors } from './colors';
import { deployHack } from './deploy-hack';
/** @param {NS} ns */

/**
 * TODO: fix the purchase server script to properly deploy the hack instead of a hardcoded script name
 * TODO: allow for the passing of the RAM value
 * @param {NS} ns 
 */

export async function main(ns: NS) {
    const hackToDeploy: string = ns.args[0].toString();
    const hackTarget: string = ns.args[1].toString();
    const ram: number = ns.args[2] ? parseInt(ns.args[2].toString()) : 16;

    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers, + 1 to account for 1-based indexing
    let i = 1;
    while (i < ns.getPurchasedServerLimit() + 1) {
        if (ns.getServerMoneyAvailable(`home`) > ns.getPurchasedServerCost(ram)) {
            let hostname = ns.purchaseServer(`pserv-` + i, ram);
            ns.tprint(`INFO: purchased server ${colors.Cyan}${hostname}${colors.Reset} with ${colors.Green}${ram}GB${colors.Reset} RAM`);
            await deployHack(ns, hostname, hackToDeploy, hackTarget);
            ++i;
        }
        //Make the script wait for 100 milli-seconds before looping again.
        //Removing this line will cause an infinite loop and crash the game.
        await ns.sleep(100);
    }
}

export async function purchaseServer(ns: NS, hostname: string, ram: number) {
    ns.purchaseServer(hostname, ram);
    
}