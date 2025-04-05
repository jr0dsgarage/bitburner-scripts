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
    private totalThreads = 0;
    public fullScannedServerList: Server[] = [];
    public purchasedServerList: Server[] = [];
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
     * If no servers have been purchased, it will purchase servers before building the list.
     * @param ns Netscript namespace; defaults to this.ns
     */
    public async initialize(ns: NS = this.ns, purchaseServers = false): Promise<void> {
        Logger.info(ns, 'serverMatrix initializing...');
        Logger.info(ns, '➡️📃 building list of scanned servers to depth of {0}...', this.scannedDepth);
        await this.buildScannedServerList();
        Logger.info(ns, '...found {0} servers.', this.fullScannedServerList.length);
        Logger.info(ns, '➡️📃 building list of purchased servers...');
        Logger.info(ns, '...found {0} purchased servers.', this.purchasedServerList.length);
        if (purchaseServers) {
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
    private async buildScannedServerList(depth = NaN, serverList: Server[] = this.fullScannedServerList) {
        let allowedServerNameList: string[] = []

        if (isNaN(depth)) depth = this.scannedDepth;

        if (serverList.length === 0) {
            const scannedServerNames: string[] = this.ns.scan();
            allowedServerNameList = scannedServerNames.filter(server => this.canAddServer(this.ns.getServer(server)));
            this.fullScannedServerList.push(...allowedServerNameList.map(allowedHostname => this.ns.getServer(allowedHostname)));
            --depth;
        }

        while (depth > 0) {
            const newServers: Server[] = [];

            for (const server of serverList) {
                const serverNeighborNames: string[] = this.ns.scan(server.hostname);
                const allowedNeighborNames = serverNeighborNames.filter(server => this.canAddServer(this.ns.getServer(server), this.fullScannedServerList.concat(newServers)));
                newServers.push(...allowedNeighborNames.map(allowedHostname => this.ns.getServer(allowedHostname)));
                allowedServerNameList.push(...allowedNeighborNames);
            }
            this.fullScannedServerList.push(...newServers);
            --depth;
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
     * Deploys a hack on a server
     * @param hackToDeploy The hack script to deploy; needs to be a .js or .script file
     * @param server The server to deploy the hack on
     * @param killAllFirst Whether to kill all currently running scripts before deploying the hack
     * @param threadsToUse The number of threads to use for the hack; defaults to the maximum number of threads available on the server
     * @param ns Netscript namespace; defaults to this.ns
     */
    public async deployHackOnServer(hackToDeploy: string, server: Server, killAllFirst = false, debug = false, threadsToUse?: number, ns: NS = this.ns): Promise<boolean> {
        if (killAllFirst) ns.killall(server.hostname);
        if (!threadsToUse) threadsToUse = Math.max(1, (ns.getServerMaxRam(server.hostname) - ns.getServerUsedRam(server.hostname)) / ns.getScriptRam(hackToDeploy));
        try {
            if (!ns.scp(hackToDeploy, server.hostname))
                throw `...can't scp ${hackToDeploy} to ${server.hostname}!`
            if (!ns.exec(hackToDeploy, server.hostname, ~~threadsToUse, this.hackTarget.hostname, debug))
                throw `...can't exec ${hackToDeploy} on ${server.hostname}!`
            if (!ns.scriptRunning(hackToDeploy, server.hostname))
                throw `...script not running on ${server.hostname}!`;
            else {
                Logger.info(ns, '...hack deployed on {0} using {1} threads!', server.hostname, ~~threadsToUse);
                return true;
            }
        }
        catch (err) {
            Logger.error(ns, `${err}`);
            return false;
        }
    }

    /**
     * Deploys a hack on all servers in the matrix' serverList
     * @param hackToDeploy The hack script to deploy; needs to be a .js or .script file
     * @param includeHome Whether to include the home server in the deployment
     * @param killAllFirst Whether to kill all currently running scripts before deploying the hack
     * @param debug Whether to log debug information
     * @param ns Netscript namespace; defaults to this.ns
     */
    public async deployHackOnAllServers(hackToDeploy: string, includeHome = false, killAllFirst = false, debug = false, ns: NS = this.ns): Promise<void> {
        const serversToUseForHacking = await this.getServersThatCanHack();
        if (includeHome) serversToUseForHacking.push(ns.getServer('home'));
        if (this.purchasedServerList.length > 0) serversToUseForHacking.push(...this.purchasedServerList);
        
        Logger.info(ns, 'attempting to deploy {0} to {1} servers...', hackToDeploy, serversToUseForHacking.length);
        
        for (const server of serversToUseForHacking) {
            try {
                if (ns.hasRootAccess(server.hostname)) {
                    if (!await this.deployHackOnServer(hackToDeploy, server, killAllFirst, debug))
                        throw `...hack deployment failed on ${server.hostname}!`;
                }
            }
            catch (err) {
                Logger.error(ns, `${err}`);
            }
        }
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
                    if (!file.endsWith('.cct')){
                        ns.scp(file, `home`, server.hostname);
                        Logger.info(ns, `...{0} fetched from {1}`, file, server.hostname);
                    }
                }
                catch { Logger.error(ns, `...can't fetch {0} from {1}!`, file, server.hostname); }
        });
    }

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
    private async getServersThatCanHack(): Promise<Server[]> {
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
                // Incorporate weaken effect and weaken time into the score
                const score = this.scoreServer(server);
                if (score > maxScore) {
                    bestTarget = server;
                    maxScore = score;
                }
            }
        }
        return bestTarget ?? ns.getServer(hl.defaultHackTargetHostname);
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
    * calculates the maximum amount of RAM that can be purchased for a server
    * @remarks based on the amount of money currently available on the home server; aka the Player's current available money
    * @param ns Netscript namespace
    * @returns the maximum amount of RAM that can be purchased for a server, as a 2^n number (8, 16, 32, 64, etc.)
    */
    private maxPurchaseableRAM(ns: NS = this.ns) {
        const moneyPerServer = ns.getServerMoneyAvailable(`home`) / ns.getPurchasedServerLimit();
        const maxPossibleRAM = ns.getPurchasedServerMaxRam();
        let maxRAM = 8;
        while (maxRAM * 2 <= maxPossibleRAM && ns.getPurchasedServerCost(maxRAM * 2) <= moneyPerServer) {
            maxRAM *= 2;
        }
        return maxRAM;
    }

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
        if (ns.getServerMoneyAvailable('home') > (ns.getPurchasedServerCost(this.maxPurchaseableRAM()) * ns.getPurchasedServerLimit())) {
            Logger.info(ns, 'enough monies secured; attempting to purchase servers...');
            let i = 1;
            while (i < ns.getPurchasedServerLimit() + 1) {
                const hostname: string = ns.purchaseServer('pserv-' + i, this.maxPurchaseableRAM());
                Logger.info(ns, 'purchased server {0} with {1}GB RAM', hostname, this.maxPurchaseableRAM());
                ++i;
                await ns.sleep(100);
            }
        }
        else {
            Logger.warn(ns, 'not enough monies to purchase servers! keep hacking...');
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
     * Upgrades the purchased servers to the maximum amount of RAM available.
     * @param ns - Netscript namespace; defaults to this.ns
     */
    public async upgradePurchasedServers(ns: NS = this.ns): Promise<void> {
        Logger.info(ns, 'attempting to upgrade purchased servers...');
        this.purchasedServerList.forEach(async server => {
            const maxRAM = this.maxPurchaseableRAM();
            const currentRAM = server.maxRam;
            if (currentRAM < maxRAM) {
                const cost = ns.getPurchasedServerCost(maxRAM);
                if (ns.getServerMoneyAvailable('home') > cost) {
                    ns.killall(server.hostname);
                    ns.deleteServer(server.hostname);
                    ns.purchaseServer(server.hostname, maxRAM);
                    Logger.info(ns, 'upgraded server {0} from {1}GB to {2}GB RAM', server.hostname, currentRAM, maxRAM);
                } else {
                    Logger.warn(ns, 'not enough money to upgrade purchased servers!');
                }
            }
        });
    }
}