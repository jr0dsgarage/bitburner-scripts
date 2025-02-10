// created by j__r0d
// modified 'early-hack-template' from beginner's guide

import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const DEBUG = ns.args[1];
  function debugPrint(message: string) {
    if (DEBUG) {
      ns.tprint(`DEBUG: ${message}`);
    }
  }

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
  while (true) {
    // Infinite loop that continously hacks/grows/weakens the target server
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      // If the server's security level is above our threshold, weaken it
      debugPrint(`${ns.getHostname()} 👇 ${target}`);
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      // If the server's money is less than our threshold, grow it
      debugPrint(`${ns.getHostname()} 👆 ${target}`);
      await ns.grow(target);
    } else {
      // Otherwise, hack it
      await ns.hack(target);
      debugPrint(`${ns.getHostname()} 👉 ${target}`);
    }
  }
}