import { NS, Server as Server } from '@ns';
import { Logger } from './logger';

//import { ServerNode as Server } from './server-node';
import * as hl from './helperLib';
import { portOpeningPrograms as programs } from './helperLib';

/**
 * Represents a server matrix that contains a list of all servers up to a certain depth.
 */
export class ServerMatrix {
    private ns: NS;
    public fullScannedServerList: Server[] = [];
    public purchasedServerList: Server[] = [];
    public serversToUse: Server[] = [];
    public scannedDepth: number;
    public hackTarget!: Server;

    constructor(ns: NS, requestedScanDepth = NaN, requestedHackTarget: Server = ns.getServer(hl.defaultHackTargetHostname)) {
        this.ns = ns;
        if (isNaN(requestedScanDepth)) requestedScanDepth = this.findMaxPossibleScanDepth();
        this.scannedDepth = requestedScanDepth;
        this.hackTarget = requestedHackTarget;
        this.purchasedServerList = ns.getPurchasedServers().map((hostname: string) => ns.getServer(hostname));
    }

    /**
     * Initializes the server matrix by building a list of scanned servers and a list of purchased servers.
     * If no servers have been purchased, it will purchase servers before building the list if requested.
     * If servers exist already, it will upgrade them to the maximum amount of RAM that can be afforded if requested.
     * @param purchaseOrUpgradeServers Whether to purchase servers if none are found; defaults to false
     * @param ns Netscript namespace; defaults to this.ns
     */
    public async initialize(ns: NS = this.ns, purchaseOrUpgradeServers = false): Promise<void> {
        Logger.info(ns, 'serverMatrix initializing...');
        Logger.info(ns, '➡️📃 building list of scanned servers to depth of {0}...', this.scannedDepth);
        await this.buildScannedServerList();
        Logger.info(ns, '...found {0} servers.', this.fullScannedServerList.length);
        Logger.info(ns, '➡️📃 building list of purchased servers...');
        Logger.info(ns, '...found {0} purchased servers.', this.purchasedServerList.length);
        if (purchaseOrUpgradeServers) {
            if (this.purchasedServerList.length != ns.getPurchasedServerLimit()) {
                await this.purchaseServers();
            }
            if (this.purchasedServerList.length > 0) {
                await this.upgradePurchasedServers();
            }
        }
        Logger.info(ns, '...serverMatrix initialized!');
    }

    /**
     * Attempts to gain root access to a server by using the nuke function.
     * @param server The server to attempt to nuke
     * @param ns Netscript namespace; defaults to this.ns
     * @returns A Promise that resolves to true if root access was granted, false otherwise
     */
    public async attemptToNukeServer(server: Server, ns: NS = this.ns): Promise<boolean> {
        Logger.warn(ns, '{0} does not have root access. attempting root...', server.hostname);
        this.openPortsOnServer(server);
        try {
            ns.nuke(server.hostname);
            Logger.info(ns, '...💣 successful. root access granted!');
            return true;
        }
        catch {
            Logger.error(ns, '...root access denied! ❌ cannot hack {0}!', server.hostname);
            return false;
        }

    }

    /**
     * Builds a list of Server objects that can be found, given a scan depth 
     * @param ns - Netscript namespace
     * @param depth - The depth of the search
     * @param serverList - The list of servers to start the search from
     * @returns A Promise that resolves to an array of Server objects
     */
    private async buildScannedServerList(depth = NaN) {
        const visitedServers = new Set<string>();
        const queue: string[] = ['home'];

        if (isNaN(depth)) depth = this.scannedDepth;

        while (queue.length > 0 && depth > 0) {
            const currentServerName = queue.shift();
            if (!currentServerName) continue;
            if (visitedServers.has(currentServerName)) continue;

            visitedServers.add(currentServerName);
            const currentServer = this.ns.getServer(currentServerName);

            if (this.canAddServer(currentServer)) {
                this.fullScannedServerList.push(currentServer);
            }

            const neighbors = this.ns.scan(currentServerName);
            for (const neighbor of neighbors) {
                if (!visitedServers.has(neighbor)) {
                    queue.push(neighbor);
                }
            }

            if (queue.length === 0) {
                --depth;
                if (depth > 0) {
                    queue.push(...this.fullScannedServerList.map(server => server.hostname));
                }
            }
        }
    }

    /**
     * Checks if a server can be added to the matrix serverList array
     * @param serverToCheck The server to check
     * @param serverListToCheckAgainst The server list to check against. Defaults to the current server list, but can be passed any array of Server objects
     * @returns True if the server can be added, false otherwise
     */
    private canAddServer(serverToCheck: Server, serverListToCheckAgainst: Server[] = this.fullScannedServerList): boolean {
        const forbiddenServerNames = ['home', 'darkweb'];
        const forbiddenServerPrefixes = ['pserv-'];

        const isForbiddenServer = forbiddenServerNames.some(forbiddenServer => forbiddenServer === serverToCheck.hostname);
        const isForbiddenServerPrefix = forbiddenServerPrefixes.some(prefix => serverToCheck.hostname.startsWith(prefix));
        const isDuplicateServer = serverListToCheckAgainst.some(s => s.hostname === serverToCheck.hostname);

        return !isForbiddenServer && !isDuplicateServer && !isForbiddenServerPrefix;
    }

    /**
     * Copies a script to a server
     * @param scriptToCopy The script to copy; needs to be a .js or .script file
     * @param server The server to copy the script to
     * @param ns Netscript namespace; defaults to this.ns
     */
    public async copyScriptToServer(scriptToCopy: string, server: Server, ns: NS = this.ns): Promise<boolean> {
        try {
            if (!ns.scp(scriptToCopy, server.hostname))
                throw `...can't scp ${scriptToCopy} to ${server.hostname}!`
            if (ns.fileExists(scriptToCopy, server.hostname))
                Logger.info(ns, '...{0} copied to {1}', scriptToCopy, server.hostname);
            else
                throw `...${scriptToCopy} not found on ${server.hostname}!`;
            return true;
        }
        catch (err) {
            Logger.error(ns, `${err}`);
            return false;
        }
    }

    /**
     * Executes a hack on a server
     * @param scriptToDeploy The hack script to deploy; needs to be a .js or .script file
     * @param server The server to deploy the hack on
     * @param killAllFirst Whether to kill all currently running scripts before deploying the hack
     * @param threadsToUse The number of threads to use for the hack; defaults to the maximum number of threads available on the server
     * @param ns Netscript namespace; defaults to this.ns
     * @returns The number of threads used for the script execution
     */
    public async execScriptOnServer(scriptToDeploy: string, server: Server, killAllFirst = false, debug = false, threadsToUse?: number, ns: NS = this.ns): Promise<number> {
        if (killAllFirst) ns.killall(server.hostname);
        if (!threadsToUse) threadsToUse = Math.max(1, (ns.getServerMaxRam(server.hostname) - ns.getServerUsedRam(server.hostname)) / ns.getScriptRam(scriptToDeploy));
        try {
            if (!ns.exec(scriptToDeploy, server.hostname, ~~threadsToUse, this.hackTarget.hostname, threadsToUse, debug))
                throw `...can't exec {0}!`;
            if (!ns.scriptRunning(scriptToDeploy, server.hostname))
                throw `...{0} died`;
            else {
                Logger.info(ns, '...script deployed on {0} using {1} threads!', server.hostname, ~~threadsToUse);
                return ~~threadsToUse;
            }
        }
        catch (err) {
            Logger.error(ns, `${err} on {1}`, scriptToDeploy, server.hostname);
            return 0;
        }
    }

    /**
     * Deploys a hack on all servers in the matrix' serverList
     * @param scriptsToDeploy The hack script to deploy; needs to be a .js or .script file
     * @param includeHome Whether to include the home server in the deployment
     * @param killAllFirst Whether to kill all currently running scripts before deploying the hack
     * @param debug Whether to log debug information
     * @param ns Netscript namespace; defaults to this.ns
     */
    public async deployScriptsonAllServers(scriptsToDeploy: string[], includeHome = false, killAllFirst = false, execScripts = false, debug = false, ns: NS = this.ns): Promise<void> {
        this.serversToUse = await this.getServersThatRunScripts();
        if (includeHome) this.serversToUse.push(ns.getServer('home'));
        if (this.purchasedServerList.length > 0) this.serversToUse.push(...this.purchasedServerList);

        Logger.info(ns, 'attempting to deploy {0} to {1} servers...', scriptsToDeploy, this.serversToUse.length);

        let totalThreadsUsed = 0; // Track total threads used

        for (const server of this.serversToUse) {
            try {
                if (ns.hasRootAccess(server.hostname)) {
                    for (const script of scriptsToDeploy) {
                        if (!await this.copyScriptToServer(script, server))
                            throw `...${script} copy failed`;
                        if (execScripts) {
                            const threadsUsed = await this.execScriptOnServer(script, server, killAllFirst, debug);
                            totalThreadsUsed += threadsUsed; // Add threads used for this script
                        }
                    }
                }
            }
            catch (err) {
                Logger.error(ns, `${err} on {0}`, server.hostname);
            }
        }

        Logger.info(ns, '...scripts executed using {0} total threads', totalThreadsUsed);
    }

    /**
     * Fetches all fetchable files from all servers in the matrix' serverList
     * - `scp` only works for scripts (.js or .script), text files (.txt), and literature files (.lit)
     * @param ns - Netscript namespace; defaults to this.ns
     */
    public async fetchFilesFromServers(ns: NS = this.ns) {
        Logger.info(ns, 'fetching files from servers...');
        this.fullScannedServerList.forEach(async server => {
            await (async () => this.fetchAllFiles(server))();
        });
        Logger.info(ns, '...all possible files fetched!');
    }

    /**
     * Fetches all fetchable files from a Server (.js or .script)
     * @param server The server to fetch files from
     * @param ns Netscript namespace; defaults to this.ns
     */
    private async fetchAllFiles(server: Server, ns: NS = this.ns) {
        const homefilelist = await (async () => this.ns.ls('home'))();
        ns.ls(server.hostname).forEach((file: string) => {
            if (!homefilelist.includes(file))
                try {
                    if (!file.endsWith('.cct')) {
                        ns.scp(file, `home`, server.hostname);
                        Logger.info(ns, `...{0} fetched from {1}`, file, server.hostname);
                    }
                }
                catch { Logger.error(ns, `...can't fetch {0} from {1}!`, file, server.hostname); }
        });
    }

    /**
     * Finds the best server to hack based on the score of each server
     * @param ns Netscript namespace; defaults to this.ns
     * @returns The best server to hack as a Server object
     */
    public async findBestServerToHack(ns: NS = this.ns): Promise<Server> {
        let currentBestTarget: Server | undefined = undefined;
        let bestScore = -Infinity;
        this.fullScannedServerList.forEach(server => {
            const score = this.scoreServer(server);
            if (score > bestScore) {
                currentBestTarget = server;
                bestScore = score;
            }
        });
        return currentBestTarget ? currentBestTarget : ns.getServer(hl.defaultHackTargetHostname);
    }

    /**
     * Returns an array of Server objects that can hack other servers, i.e. servers that have more than 0 RAM
     * @returns An array of Server object
     */
    private async getServersThatRunScripts(): Promise<Server[]> {
        return this.fullScannedServerList.filter(server => server.maxRam > 0);
    }

    /**
     * Returns the server that is the best target for hacking, based on the player's hacking level and the server's max money.
     * @param ns Netscript namespace; defaults to this.ns
     * @returns The best server to hack as a Server object
     */
    public async getTargetServer(ns: NS = this.ns): Promise<Server> {
        const playerHackingLevel = ns.getHackingLevel();
        // find the server with the most money that meets the criteria and has the highest combined score
        let bestTarget: Server | null = null;
        let maxScore = -Infinity;

        for (const server of this.fullScannedServerList) {
            const requiredHackingLevel: number = ns.getServerRequiredHackingLevel(server.hostname);
            const maxMoneyonServer: number = ns.getServerMaxMoney(server.hostname);

            if (
                (playerHackingLevel / requiredHackingLevel) > 0.5 &&
                ns.hackAnalyzeThreads(server.hostname, maxMoneyonServer) > 0
            ) {
                const score = this.scoreServer(server);
                if (score > maxScore) {
                    ns.tprint(`new best target: ${server.hostname} with score: ${score}`);
                    bestTarget = server;
                    maxScore = score;
                }
            }
        }
        return bestTarget ?? ns.getServer(hl.defaultHackTargetHostname);
    }

    /**
     * Gets the maximum number of threads available for a script on a server
     * @param script The script to check
     * @param server The server to check
     * @param ns Netscript namespace; defaults to this.ns
     * @returns The maximum number of threads available for the script on the server
     */
    public async getThreadsAvailableForScript(script: string, server: Server, ns: NS = this.ns): Promise<number> {
        const maxThreads = Math.floor((server.maxRam - server.ramUsed) / ns.getScriptRam(script));
        const maxThreadsAvailable = Math.floor(ns.getServerMaxRam(server.hostname) / ns.getScriptRam(script));
        const threadsAvailable = Math.min(maxThreads, maxThreadsAvailable);
        return threadsAvailable;
    }

    /**
     * Sorts the fullScannedServerList by money available
     * @param ns Netscript namespace; defaults to this.ns
     * @returns The hostname of the server with the most money available.
     */
    public async getRichestServerHostname(ns: NS = this.ns): Promise<string> {
        const sortedServerList = [... this.fullScannedServerList].sort((a, b) => ns.getServerMoneyAvailable(b.hostname) - ns.getServerMoneyAvailable(a.hostname));
        return sortedServerList[0].hostname;
    }

    /**
     * @remarks determines whether DeepscanV1.exe and/or DeepscanV2.exe are available, and provides the maximum scan depth possible depending on the outcome.
     * @param ns Netscript namespace
     * @returns maximum scan depth based on the executables available, returns a number
     */
    private findMaxPossibleScanDepth(ns: NS = this.ns): number {
        let scanDepth = 3;
        if (ns.fileExists(`DeepscanV1.exe`)) scanDepth = 5;
        if (ns.fileExists(`DeepscanV2.exe`)) scanDepth = 10;
        return scanDepth;
    }

    /**
    * calculates the maximum amount of RAM that can be purchased for all servers at the same time
    * @remarks based on the amount of money currently available on the home server; aka the Player's current available money
    * @param ns Netscript namespace
    * @returns the maximum amount of RAM that can be purchased for each server, as a 2^n number (8, 16, 32, 64, etc.)
    */
    private getMaxAffordableRAMforServers(ns: NS = this.ns) {
        const moneyPerServer = ns.getServerMoneyAvailable(`home`) / ns.getPurchasedServerLimit();
        const maxPossibleRAM = ns.getPurchasedServerMaxRam();
        let maxRAM = 8;
        while (maxRAM * 2 <= maxPossibleRAM && ns.getPurchasedServerCost(maxRAM * 2) <= moneyPerServer) {
            maxRAM *= 2;
        }
        return maxRAM;
    }

    /**
     * Gets the server path from the target server to home
     * @param ns Netscript namespace
     * @param target The target server to get the path for
     * @returns A Promise that resolves to an array of strings representing the server path
     */
    public getServerPath(ns: NS, target: string): Promise<string[]> {
        const serverPath: string[] = [target];
        let currentServer: string = target;
        while (currentServer !== `home`) {
            const parentServer: string | null = ns.scan(currentServer).find(server => server !== currentServer && server !== serverPath[serverPath.length - 1]) || null;
            if (parentServer) {
                serverPath.push(parentServer);
                currentServer = parentServer;
            } else {
                break;
            }
        }
        return Promise.resolve(serverPath.reverse());
    }

    /*
    * This function nukes all servers in the serverList array
    * @param ns Netscript namespace
    * @returns void
    */
    public async nukeAllServers(ns: NS = this.ns): Promise<void> {
        let nukedServerCount = 0;
        let failednukeCount = 0;
        Logger.info(ns, 'attempting to nuke all servers...');

        for (const server of this.fullScannedServerList) {
            if (!ns.hasRootAccess(server.hostname)) {
                if (await this.attemptToNukeServer(server)) {
                    ++nukedServerCount;
                } else {
                    ++failednukeCount;
                }
            } else {
                Logger.info(ns, '...{0} already has root access!', server.hostname);
                ++nukedServerCount;
            }
        }

        Logger.info(ns, '...{0} servers nuked!  {1} servers failed.', nukedServerCount, failednukeCount);
    }

    /**
     * @remarks This function opens a specified number of ports on a server. 
     * @param ns Netscript namespace
     * @param hostname hostname of server on which to open ports
     */
    private async openPortsOnServer(server: Server, ns: NS = this.ns) {
        const maxPorts = programs.length;
        const portsRequired = ns.getServerNumPortsRequired(server.hostname);
        for (let i = 0; i < portsRequired && i < maxPorts; i++) {
            try {
                if (ns.fileExists(programs[i])) {
                    switch (i) {
                        case 0:
                            ns.brutessh(server.hostname);
                            break;
                        case 1:
                            ns.ftpcrack(server.hostname);
                            break;
                        case 2:
                            ns.relaysmtp(server.hostname);
                            break;
                        case 3:
                            ns.httpworm(server.hostname);
                            break;
                        case 4:
                            ns.sqlinject(server.hostname);
                            break;
                    }
                } else {
                    throw (`{0} unavailable, cannot open port {1}`);
                }
            } catch (err) {
                Logger.error(ns, `${err}`, programs[i], i + 1);
                break;
            }
        }
    }

    /**
     * Attempts to purchase servers up to the maximum limit, if there are enough funds available.
     * @param ns - Netscript namespace; defaults to this.ns
     */
    public async purchaseServers(ns: NS = this.ns): Promise<void> {
        Logger.info(ns, '...no purchased servers found. checking for available monies...');
        const moneyRequiredForPurchase = (ns.getPurchasedServerCost(this.getMaxAffordableRAMforServers()) * ns.getPurchasedServerLimit());
        if (ns.getServerMoneyAvailable('home') > moneyRequiredForPurchase) {
            Logger.info(ns, 'enough monies secured; attempting to purchase servers...');
            let i = 1;
            const maxAffordableRAMforServers = this.getMaxAffordableRAMforServers(ns);
            while (i < ns.getPurchasedServerLimit() + 1) {
                const hostname: string = ns.purchaseServer('pserv-' + i, maxAffordableRAMforServers);
                Logger.info(ns, 'purchased server {0} with {1}GB RAM', hostname, maxAffordableRAMforServers);
                this.purchasedServerList.push(ns.getServer(hostname));

                ++i;
                await ns.sleep(100);
            }
        }
        else {
            Logger.warn(ns, 'not enough monies to purchase servers! {0} required! keep hacking...', `$` + ns.formatNumber(moneyRequiredForPurchase, 3));
        }
    }

    /**
     * Calculates the score of a server based on its money and security factors.
     * @remarks this algo came from CoPilot 
     * @param server - The server to calculate the score for.
     * @param ns - Netscript namespace; defaults to this.ns
     * @returns The score of the server as a number
     */
    public scoreServer = (server: Server, ns: NS = this.ns): number => {
        const maxMoneyonServer: number = ns.getServerMoneyAvailable(server.hostname);
        const hackAnalyzeValue: number = ns.hackAnalyze(server.hostname);
        const weakenEffect: number = ns.weakenAnalyze(1); // Effect of a single thread of weaken
        const weakenTime: number = ns.getWeakenTime(server.hostname); // Time required to weaken the server

        // Incorporate weaken effect and weaken time into the score
        const score = (maxMoneyonServer * hackAnalyzeValue) / (weakenEffect * weakenTime);
        return score;

    }

    /**
     * Upgrades the purchased servers to the maximum amount of RAM that can be afforded.
     * @param ns - Netscript namespace; defaults to this.ns
     */
    public async upgradePurchasedServers(ns: NS = this.ns): Promise<void> {
        Logger.info(ns, 'Attempting to upgrade purchased servers...');

        if (this.purchasedServerList.length === 0) {
            Logger.warn(ns, 'No purchased servers to upgrade.');
            return;
        }

        const maxPossibleRam = ns.getPurchasedServerMaxRam();
        const playerMoney = ns.getServerMoneyAvailable('home');
        const currentMinRam = Math.min(...this.purchasedServerList.map(s => s.maxRam));
        let targetRam = currentMinRam * 2;
        let totalCost = 0;

        // Determine the maximum affordable RAM upgrade for all servers
        while (targetRam <= maxPossibleRam) {
            totalCost = this.purchasedServerList.reduce((cost, server) => {
                return server.maxRam < targetRam ? cost + ns.getPurchasedServerUpgradeCost(server.hostname, targetRam) : cost;
            }, 0);

            if (totalCost > playerMoney) {
                targetRam /= 2;
                break;
            }
            targetRam *= 2;
        
        }

        if (targetRam <= currentMinRam) {
            Logger.warn(ns, 'Not enough money to upgrade all servers. Need {0}.', `$` + ns.formatNumber(totalCost, 3));
            return;
        }

        Logger.info(ns, 'Upgrading all purchased servers to {0}GB RAM', targetRam);

        for (const server of this.purchasedServerList) {
            if (server.maxRam < targetRam) {
                if (ns.upgradePurchasedServer(server.hostname, targetRam)) {
                    Logger.info(ns, 'Upgraded {0} to {1}GB RAM.', server.hostname, targetRam);
                } else {
                    Logger.error(ns, 'Failed to upgrade {0} to {1}GB RAM.', server.hostname, targetRam);
                }
            }
        }
    }
}