// the contents of this script came from the Beginner's Guide in the game's documentation...
import { NS } from '@ns';
import { deployHack } from './deploy-hack';
/** @param {NS} ns */

/**
 * TODO: fix the purchase server script to properly deploy the hack instead of a hardcoded script name
 * TODO: allow for the passing of the RAM value
 * @param {NS} ns 
 */

export async function main(ns: NS, hackToDeploy: string, hackTarget: string) {
    // How much RAM each purchased server will have. In this case, it'll
    // be 8GB.
    const ram = 16;

    // Iterator we'll use for our loop
    let i = 1; // changed to 1 by j__r0d because 1 is a better place to start than 0 for this counter

    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers, + 1 to account for 1-based indexing
    while (i < ns.getPurchasedServerLimit()  + 1) {
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable(`home`) > ns.getPurchasedServerCost(ram)) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with 3 threads
            //  4. Increment our iterator to indicate that we've bought a new server
            let hostname = ns.purchaseServer(`pserv-` + i, ram);
            deployHack(ns, hostname, hackToDeploy, hackTarget);
            ++i;
        }
        //Make the script wait for a second before looping again.
        //Removing this line will cause an infinite loop and crash the game.
        await ns.sleep(1000);
    }
}