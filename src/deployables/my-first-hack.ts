// created by j__r0d
// modified 'early-hack-template' from beginner's guide

import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  // reporting is set to true if the debug flag is passed to the hack script
  const reporting = ns.args[2] === true;

  // Defines the 'target server', which is the server
  // that we're going to hack. 
  const target = ns.args[0].toString();

  let threads = ns.args[1] as number;
  if (threads === undefined) threads = 1;

  // Defines the maximum security level the target server can
  // have. If the target's security level is higher than this,
  // we'll weaken it before doing anything else
  const weakenOffset = Math.max(ns.weakenAnalyze(threads), Math.min(100, ns.getServerMinSecurityLevel(target) * 3));
  const securityThresh = ns.getServerMinSecurityLevel(target) + weakenOffset;

  // Defines how much money a server should have before we hack it
  // In this case, it is set to the maximum amount of money minus 10m to avoid over-growing as much as possible
  const moneyOffset = ns.getServerMaxMoney(target) * 0.25;
  const moneyThresh = ns.getServerMaxMoney(target) - moneyOffset;
  
  if (reporting) ns.tprint(`${ns.getHostname().padStart(20)}: weakenOffset: ${weakenOffset.toFixed(2)}, securityThresh: ${securityThresh.toFixed(2)}, moneyOffset: ${ns.formatNumber(moneyOffset,2)}, moneyThresh: ${ns.formatNumber(moneyThresh,2)}`);
  
  // Infinite loop that continously hacks/grows/weakens the target server
  for (; ;) {
    const startingSecurityLevel = ns.getServerSecurityLevel(target).toFixed(2);
    const startingMoneyAvailable = ns.formatNumber(ns.getServerMoneyAvailable(target),2);


    if (ns.getServerSecurityLevel(target) > securityThresh) {
      // If the server's security level is above our threshold, weaken it
      if (reporting) ns.tprint(`${ns.getHostname().padStart(20)} 👇 weakening ${target}... Starting Security Level: ${startingSecurityLevel}`);
      const start = performance.now();
      await ns.weaken(target);
      const end = performance.now();
      if (reporting) ns.tprint(`${ns.getHostname().padStart(20)} 👇 weakened ${target} from ${startingSecurityLevel} to ${ns.getServerSecurityLevel(target).toFixed(2)} (ElapsedTime: ${(end - start).toFixed(2)}ms)`);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh ) {
      // If the server's money is less than our threshold, grow it
      if (reporting) ns.tprint(`${ns.getHostname().padStart(20)} 👆 growing ${target}... Starting Server Money Available: $${startingMoneyAvailable}`);
      const start = performance.now();
      await ns.grow(target);
      const end = performance.now();
      if (reporting) ns.tprint(`${ns.getHostname().padStart(20)} 👆 grew ${target} from ${startingMoneyAvailable} to $${ns.formatNumber(ns.getServerMoneyAvailable(target), 2)} (Elapsed Time: ${(end - start).toFixed(2)}ms)`);
      
    } else {
      // Otherwise, hack it
      if (reporting) ns.tprint(`${ns.getHostname().padStart(20)} 👉 hacking ${target}... Starting Server Money Available: $${startingMoneyAvailable}`);
      const start = performance.now();
      await ns.hack(target);
      const end = performance.now();
      if (reporting) ns.tprint(`${ns.getHostname().padStart(20)} 👉 hacked ${target} from $${startingMoneyAvailable} to $${ns.formatNumber(ns.getServerMoneyAvailable(target), 2)} (Elapsed Time: ${(end - start).toFixed(2)}ms)`);
    }
  }
}