import { NS, Server } from '@ns';

/**
 * Represents a server matrix that contains a list of all servers up to a certain depth.
 */
export class ServerMatrix {
    public fullServerList: Server[] = [];
    private ns: NS;
    private scannedDepth: number; // scannedDepth because it holds the depth value to which constructor builds the serverList
    
    constructor(ns: NS, scanDepth: number = NaN) {
        this.ns = ns;
        ns.tprint(`INFO: serverMatrix initialized...`);
        if (isNaN(scanDepth)) scanDepth = this.getMaxPossibleScanDepth(); 
        this.scannedDepth = scanDepth;

        ns.tprint(`INFO: ...building list of all servers to depth of ${this.scannedDepth}...`);
        this.buildScannedServerList();
    }

    /**
     * Builds a list of Server objects that can be found, given a scan depth 
     * @param ns - Netscript namespace
     * @param depth - The depth of the search
     * @param serverList - The list of servers to start the search from
     * @returns A Promise that resolves to an array of Server objects
     */
    private async buildScannedServerList(depth: number = NaN, serverList: Server[] = this.fullServerList) {
        let allowedServerNameList: string[] = []

        if (isNaN(depth)) depth = this.scannedDepth;

        if (serverList.length === 0) {
            const scannedServerNames: string[] = this.ns.scan();
            allowedServerNameList = scannedServerNames.filter(server => this.canAddServer(this.ns.getServer(server)));
            this.fullServerList.push(...allowedServerNameList.map(allowedHostname => this.ns.getServer(allowedHostname)));
            --depth;
        }

        while (depth > 0) {
            const newServers: Server[] = [];

            for (const server of serverList) {
                const serverNeighborNames: string[] = this.ns.scan(server.hostname);
                const allowedNeighborNames = serverNeighborNames.filter(server => this.canAddServer(this.ns.getServer(server), this.fullServerList.concat(newServers)));
                newServers.push(...allowedNeighborNames.map(allowedHostname => this.ns.getServer(allowedHostname)));
                allowedServerNameList.push(...allowedNeighborNames);
            }
            this.fullServerList.push(...newServers);
            --depth;
        }
    }

    /**
     * Checks if a server can be added to the matrix serverList array
     * @param serverToCheck The server to check
     * @param serverListToCheckAgainst The server list to check against. Defaults to the current server list, but can be passed any array of Server objects
     * @returns True if the server can be added, false otherwise
     */
    private canAddServer(serverToCheck: Server, serverListToCheckAgainst: Server[] = this.fullServerList): boolean {
        const forbiddenServerNames = ['home', 'darkweb'];
        const forbiddenServerPrefixes = ['pserv-'];

        const isForbiddenServer = forbiddenServerNames.some(forbiddenServer => forbiddenServer === serverToCheck.hostname);
        const isForbiddenServerPrefix = forbiddenServerPrefixes.some(prefix => serverToCheck.hostname.startsWith(prefix));
        const isDuplicateServer = serverListToCheckAgainst.some(s => s.hostname === serverToCheck.hostname);

        return !isForbiddenServer && !isDuplicateServer && !isForbiddenServerPrefix;
    }

    /**
     * Fetches all fetchable files from all servers in the matrix' serverList
     * - `scp` only works for scripts (.js or .script), text files (.txt), and literature files (.lit)
     * @param ns - Netscript namespace; defaults to this.ns
     */
    public async fetchFilesFromServers(ns: NS = this.ns) { 
        ns.tprint(`INFO: fetching files from servers:\n` + this.fullServerList.map(server => server.hostname).join(`, `));
        this.fullServerList.forEach(async server => {
            await (async () => this.fileFetch(server))();
        });
    }

    /**
     * Fetches all fetchable files from a Server (.js or .script)
     * @param server The server to fetch files from
     * @param ns Netscript namespace; defaults to this.ns
     */
    private async fileFetch(server: Server, ns:NS = this.ns) {   
        const homefilelist = await (async () =>  this.ns.ls('home'))();
        ns.ls(server.hostname).forEach((file: string) => {
            if (!homefilelist.includes(file))
                try {
                    ns.scp(file, `home`, server.hostname);
                    ns.tprint(`INFO: ...${file} fetched from ${server.hostname}`);
                }
                catch { ns.tprint(`ERROR: ...can't fetch ${file} from ${server.hostname}!`); }
        });
    }

    /**
     * Returns an array of Server objects that are suitable for hacking, i.e. servers that have more than 0 RAM
     * @returns An array of Server object
     */
    public getHackableServers(): Server[] {
        return this.fullServerList.filter(server => server.maxRam > 0);
    }


    /**
     * @remarks determines whether DeepscanV1.exe and/or DeepscanV2.exe are available, and provides the maximum scan depth possible depending on the outcome.
     * @param ns Netscript namespace
     * @returns maximum scan depth based on the executables available, returns a number
     */
    private getMaxPossibleScanDepth(ns: NS = this.ns): number {
        let scanDepth: number = 3;
        if (ns.fileExists(`DeepscanV1.exe`)) scanDepth = 5;
        if (ns.fileExists(`DeepscanV2.exe`)) scanDepth = 10;
        return scanDepth;
    }
}