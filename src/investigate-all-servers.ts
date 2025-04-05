/* `your hacking target should be the server with highest max money that's required hacking level is under 1/2 of your hacking level.`
 * `Keep security level low. Security level affects everything when hacking. Two important Netscript functions for this are getServerSecurityLevel() and getServerMinSecurityLevel()`
 */
import { NS, Server } from '@ns';
import { ServerMatrix } from './lib/server-matrix';
import { TerminalFormats as colors } from './lib/helperLib';

/**
 * investigates all servers and prints pertinent hacking information
 * @param ns Netscript Namespace
*/

export async function main(ns: NS) {
    const matrix = new ServerMatrix(ns);
    await matrix.initialize(ns, false);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        ns.ui.clearTerminal();
        ns.tprintf(`INFO: investigating ${matrix.fullScannedServerList.length} servers...`);
        
        const targetServer = await matrix.getTargetServer();

        matrix.fullScannedServerList.forEach((targetableServer: Server) => {
            const targetHostname: string = targetableServer.hostname;
            const securityLevel: number = ns.getServerSecurityLevel(targetHostname);
            const minSecurityLevel: number = ns.getServerMinSecurityLevel(targetHostname);
            const moneyAvailable: number = ns.getServerMoneyAvailable(targetHostname);
            const maxMoney: number = ns.getServerMaxMoney(targetHostname)
            const statusColor = securityLevel > minSecurityLevel ? colors.Yellow : moneyAvailable < maxMoney ? colors.Magenta : colors.Green;

            const hackTime: number = ns.getHackTime(targetHostname);
            const growTime: number = ns.getGrowTime(targetHostname);
            const weakenTime: number = ns.getWeakenTime(targetHostname);

            const hackChance: number = ns.hackAnalyzeChance(targetHostname);
            const hackAmount: number = ns.hackAnalyze(targetHostname);
            const hackThreads: number = ns.hackAnalyzeThreads(targetHostname, moneyAvailable);

            const serverScore = matrix.scoreServer(targetableServer);
            
            const hostnameString = `${colors.Cyan}${targetHostname}${colors.Reset}:${securityLevel > minSecurityLevel ? '👇' : moneyAvailable < maxMoney ? '👆' : '👉'}`;
            const moneyString = `${colors.Magenta}$${ns.formatNumber(moneyAvailable).padEnd(8, ' ')}/$${ns.formatNumber(maxMoney)}${colors.Reset}`;
            const securityString = `S:${statusColor}${ns.formatNumber(securityLevel, 3)}${colors.Reset}`;
            const hackString = `H:${statusColor}${(~~hackTime)}${colors.Reset}`;
            const growString = `G:${statusColor}${(~~growTime)}${colors.Reset}`;
            const weakenString = `W:${statusColor}${(~~weakenTime)}${colors.Reset}`;
            const hackChanceString = `HC:${statusColor}${hackChance.toFixed(4)}${colors.Reset}`;
            const hackAmountString = `HA:${statusColor}${hackAmount.toFixed(4)}${colors.Reset}`;
            const hackThreadsString = `HT:${statusColor}${hackThreads.toFixed(4)}${colors.Reset}`;
            
            const targetString = targetHostname === targetServer.hostname ? `🎯` : `x`;
            const serverScoreString = `${colors.Cyan}${serverScore.toFixed(5)}${colors.Reset}`;

            ns.tprintf(`${hostnameString.padEnd(30, `.`)}${moneyString.padEnd(30, `.`)}${securityString.padEnd(20, `.`)}${hackString.padEnd(20, `.`)}${growString.padEnd(20, `.`)}${weakenString.padEnd(20, `.`)}${targetString.padEnd(3, `.`)}${hackChanceString.padEnd(20, `.`)}${hackAmountString.padEnd(20, `.`)}${hackThreadsString.padEnd(25, `.`)}${serverScoreString}`);
        });
        await ns.sleep(500);
    }
}