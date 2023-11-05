import { NS, Server } from '@ns';
import { ServerMatrix } from './server-matrix';
import * as hl from './hackLib';
import { colors } from './hackLib';

/**
 * investigates a server and prints it's stats and info on loop
 * @param ns Netscript Namespace
*/

//const TEST_THREADS = 2;


export async function main(ns: NS) {
    const targetHostname: string = ns.getServer(ns.args[0].toString()).hostname;
    const target: Server = ns.getServer(targetHostname);
    const maxRam: number = ns.getServerMaxRam(targetHostname);
    const minSecurityLevel: number = ns.getServerMinSecurityLevel(targetHostname); 
    const maxMoney: number = ns.getServerMaxMoney(targetHostname)
    const requiredHackingLevel: number = ns.getServerRequiredHackingLevel(targetHostname);
    

    while (true) {
        ns.ui.clearTerminal();
        const usedRam: number = ns.getServerUsedRam(targetHostname);
        const availableRam: number = maxRam - usedRam;  
        const numPortsRequired: number = ns.getServerNumPortsRequired(targetHostname);
        const securityLevel: number = ns.getServerSecurityLevel(targetHostname);
        const moneyAvailable: number = ns.getServerMoneyAvailable(targetHostname);
        const hackChance = ns.hackAnalyzeChance(targetHostname) * 100;
        const statusColor = securityLevel > minSecurityLevel ? colors.Yellow : moneyAvailable < maxMoney ? colors.Magenta : colors.Green;
        ns.tprintf(`Investigating ${colors.Green}${targetHostname}${colors.Reset}: ${securityLevel > minSecurityLevel ? '👇' : moneyAvailable < maxMoney ? '👆' : '👉'}`);
        ns.tprintf(`RAM: ${statusColor}${ns.formatNumber(usedRam, 2)}GB${colors.Reset} / ${statusColor}${~~maxRam}GB${colors.Reset}`);
        ns.tprintf(`Available RAM: ${statusColor}${ns.formatNumber(availableRam, 2)}GB${colors.Reset}`)
        ns.tprintf(`Ports needing opening: ${statusColor}${numPortsRequired}${colors.Reset}`);
        ns.tprintf(`Minimum Security Level: ${statusColor}${minSecurityLevel}${colors.Reset}`);
        ns.tprintf(`Required Hacking Level: ${statusColor}${requiredHackingLevel}${colors.Reset}`);
        ns.tprintf(`Successful ${colors.White}hack()${colors.Reset} chance: ${statusColor}${ns.formatNumber(hackChance,0)}%%${colors.Reset}`);
                 
      
        ns.tprintf(`${colors.BrightWhite}________________________${colors.Reset}`)
        ns.tprintf(`Money Available: ${statusColor}$${ns.formatNumber(moneyAvailable)}${colors.Reset}`);
        ns.tprintf(`Maximum Money: ${statusColor}$${ns.formatNumber(maxMoney)}${colors.Reset}`);
        ns.tprintf(`${colors.BrightWhite}________________________${colors.Reset}`)

        const hackTime: number = ns.getHackTime(targetHostname);
        const growTime: number = ns.getGrowTime(targetHostname);
        const weakenTime: number = ns.getWeakenTime(targetHostname);  
        const percentofMoneyStolenPerThread = ns.hackAnalyze(targetHostname) * 100;
        
        
        
        
        
        ns.tprintf(`Current ${colors.White}hack()/grow()/weaken()${colors.Reset} Analysis Values:`);
        ns.tprintf(`Hack time: ${statusColor}${ns.tFormat(~~hackTime)}${colors.Reset}`);
        ns.tprintf(`Grow time: ${statusColor}${ns.tFormat(~~growTime)}${colors.Reset}`);
        ns.tprintf(`Weaken time: ${statusColor}${ns.tFormat(~~weakenTime)}${colors.Reset}`);
        ns.tprintf(`Percent of Money hacked per Thread: ${statusColor}${ns.formatNumber(percentofMoneyStolenPerThread)}%%${colors.Reset}`); 
        
        
        const desiredMoneyAmount = maxMoney;
        const threadsNeededforMoneyAmount = ns.hackAnalyzeThreads(targetHostname, desiredMoneyAmount);
        const securityIncrease = ns.hackAnalyzeSecurity(threadsNeededforMoneyAmount, targetHostname);
        const growThreadsNeeded = ns.growthAnalyze(targetHostname, 100);
        const securityIncreaseIfGrow = ns.growthAnalyzeSecurity(growThreadsNeeded, targetHostname);
        ns.tprintf(`Threads needed for $${colors.Green}${ns.formatNumber(desiredMoneyAmount)}${colors.Reset}: ${statusColor}${ns.formatNumber(threadsNeededforMoneyAmount)}${colors.Reset}`);
        ns.tprintf(`Security increase for hack(): ${statusColor}${ns.formatNumber(securityIncrease)}${colors.Reset}`);
        ns.tprintf(`Threads needed for 100%% growth: ${statusColor}${ns.formatNumber(growThreadsNeeded)}${colors.Reset}`);
        ns.tprintf(`Security increase for grow(): ${statusColor}${ns.formatNumber(securityIncreaseIfGrow)}${colors.Reset}`);        

        
        const securityDecreaseifWeaken = ns.weakenAnalyze(growThreadsNeeded);
        ns.tprintf(`Security decrease for weaken(): ${statusColor}${ns.formatNumber(securityDecreaseifWeaken)}${colors.Reset}`);

        
        ns.tprintf(`Security Level: ${statusColor}${ns.formatNumber(securityLevel, 3)}${colors.Reset}`);
        
        await ns.sleep(500);
    }
}
