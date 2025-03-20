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
    public async initialize(ns: NS = this.ns): Promise<void> {
        Logger.info(ns, 'serverMatrix initializing...');
        Logger.info(ns, '➡️📃 building list of scanned servers to depth of {0}...', this.scannedDepth);
        await this.buildScannedServerList();
        Logger.info(ns, '...found {0} servers.', this.fullScannedServerList.length);
        Logger.info(ns, '➡️📃 building list of purchased servers...');
        Logger.info(ns, '...found {0} purchased servers.', this.purchasedServerList.length);
        if (this.purchasedServerList.length === 0) await this.purchaseServers();
        Logger.info(ns, '...serverMatrix initialized!');
    }

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
            Logger.error(ns, '{0} ...hack deployment failed!', err);
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
        const serversToUseForHacking = await this.getHackableServers();
        if (includeHome) serversToUseForHacking.push(ns.getServer('home'));
        if (this.purchasedServerList.length > 0) serversToUseForHacking.push(...this.purchasedServerList);
        Logger.debug(ns, 'deploying {0} to all servers...', debug, hackToDeploy);
        for (const server of serversToUseForHacking) {
            try {
                if (!ns.hasRootAccess(server.hostname)) {
                    if (!await this.attemptToNukeServer(server))
                        throw `...nuke failed, aborting deployment!`;
                }
                if (!await this.deployHackOnServer(hackToDeploy, server, killAllFirst, debug))
                    throw `...hack deployment failed!`;
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
                    ns.scp(file, `home`, server.hostname);
                    Logger.info(ns, `...{0} fetched from {1}`, file, server.hostname);
                }
                catch { Logger.error(ns, `...can't fetch {0} from {1}!`, file, server.hostname); }
        });
    }

    /**
     * Returns the amount of available RAM on a given server.
     * @param server - The server for which to calculate available RAM.
     * @param ns - Netscript namespace; defaults to this.ns
     * @returns The amount of available RAM on the server as a number, in GB.
     */
    private getAvailableRam(server: Server, ns: NS = this.ns): number {
        return ns.getServerMaxRam(server.hostname) - ns.getServerUsedRam(server.hostname);
    }

    /**
     * Returns an array of Server objects that are suitable for hacking, i.e. servers that have more than 0 RAM
     * @returns An array of Server object
     */
    private async getHackableServers(): Promise<Server[]> {
        return this.fullScannedServerList.filter(server => server.maxRam > 0);
    }

    /**
     * Sorts the fullScannedServerList by money available
     * @param ns Netscript namespace; defaults to this.ns
     * @returns The hostname of the server with the most money available.
     */
    public getRichestServerHostname(ns: NS = this.ns): string {
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
     * Finds the best server to hack based on the score calculated by `scoreServer`
     * @param ns - Netscript namespace; defaults to this.ns
     * @returns The best server to hack, or `undefined` if there are no servers to hack
     */
    /*     public async findBestHackTarget(ns: NS = this.ns): Promise<Server> {
            let currentBestTarget: Server | undefined = undefined;
            let bestScore = -Infinity;
            this.fullScannedServerList.forEach(server => {
                const score = this.scoreServer(server);
                if (score > bestScore) {
                    currentBestTarget = server;
                    bestScore = score;
                }
                //ns.tprint(`INFO: ...${colors.Cyan} ${server.hostname}${colors.Reset} scored ${colors.Green}${score}${colors.Reset}`)
            });
            if (currentBestTarget) return currentBestTarget;
            else throw new Error(`ERROR: could not acquire hack target!`);
        } */

    /**
     * Calculates the score of a server based on its money and security factors.
     * @remarks this algo came from CoPilot 
     * @param server - The server to calculate the score for.
     * @param ns - Netscript namespace; defaults to this.ns
     * @returns The score of the server as a number
     */
    /* public scoreServer = (server: Server, ns: NS = this.ns): number => {
        //ns.tprint(`Calculating score for server ${server.hostname}...`);

        const playerHackingLevel = ns.getHackingLevel();
        //ns.tprint(`Player hacking level: ${playerHackingLevel}`);

        const money = ns.getServerMoneyAvailable(server.hostname);
        //ns.tprint(`Money available on ${server.hostname}: ${money}`);

        const maxMoney = ns.getServerMaxMoney(server.hostname);
        //ns.tprint(`Maximum money available on ${server.hostname}: ${maxMoney}`);

        const moneyFactor = Math.pow(money / maxMoney, 2);
        //ns.tprint(`Money factor: ${moneyFactor}`);

        const securityLevel = ns.getServerSecurityLevel(server.hostname);
        //ns.tprint(`Security level of ${server.hostname}: ${securityLevel}`);

        const requiredHackLevel = ns.getServerRequiredHackingLevel(server.hostname);
        //ns.tprint(`Hacking level required to hack ${server.hostname}: ${requiredHackLevel}`);

        const securityFactor = requiredHackLevel > playerHackingLevel ? 0: (securityLevel - requiredHackLevel) / securityLevel;
        //ns.tprint(`Security factor: ${securityFactor}`);

        const score = moneyFactor * securityFactor;
        return score;
    } */
}