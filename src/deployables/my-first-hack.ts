// created by j__r0d
// modified 'early-hack-template' from beginner's guide

import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  // reporting is set to true if the debug flag is passed to the hack script
  const reporting = ns.args[1] === true;

  // Defines the 'target server', which is the server
  // that we're going to hack. 
  const target = ns.args[0].toString();
  // Defines how much money a server should have before we hack it
  // In this case, it is set to the maximum amount of money.
  const moneyThresh = ns.getServerMaxMoney(target);

  // Defines the maximum security level the target server can
  // have. If the target's security level is higher than this,
  // we'll weaken it before doing anything else
  const securityThresh = ns.getServerMinSecurityLevel(target);
  
  // Infinite loop that continously hacks/grows/weakens the target server
  for (; ;) {
    // Infinite loop that continously hacks/grows/weakens the target server
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      // If the server's security level is above our threshold, weaken it
      await ns.weaken(target);
      if (reporting) ns.tprint(`${ns.getHostname().padStart(15)} 👇 ${target}: current Server Security Level: ${ns.getServerSecurityLevel(target).toFixed(2)}`);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      // If the server's money is less than our threshold, grow it
      await ns.grow(target);
      if (reporting) ns.tprint(`${ns.getHostname().padStart(15)} 👆 ${target}: current Server Money Available: $${ns.formatNumber(ns.getServerMoneyAvailable(target), 2)} `);
      
    } else {
      // Otherwise, hack it
      await ns.hack(target);
      if (reporting) ns.tprint(`${ns.getHostname().padStart(15)} 👉 ${target} current Server Money Available: ${ns.getServerMoneyAvailable(target).toFixed(2)}`);
    }
  }
}