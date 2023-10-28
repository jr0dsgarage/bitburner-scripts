import { NS, Server } from '@ns';

export class ServerMatrix {
    public serverList: Server[] = [];

    constructor(ns: NS, scanDepth: number = 3) {
        ns.tprint(`INFO: serverMatrix initialized...`);
        ns.tprint(`INFO: ...building list of all servers to depth of ${scanDepth}...`);
        this.buildScannedServerList(ns, scanDepth);
    }

    private async buildScannedServerList(ns: NS, depth: number, serverList: Server[] = this.serverList) {      
        let allowedServerNameList: string[] = []
        if (serverList.length === 0) {
            const scannedServerNames: string[] = ns.scan();
            allowedServerNameList = scannedServerNames.filter(server => this.canAddServer(ns.getServer(server)));
            this.serverList.push(...allowedServerNameList.map(allowedHostname => ns.getServer(allowedHostname)));
            --depth;
        }
        
        while (depth > 0) {
            const newServers: Server[] = [];
    
            for (const server of serverList) {
                const serverNeighborNames: string[] = ns.scan(server.hostname);
                const allowedNeighborNames = serverNeighborNames.filter(server => this.canAddServer(ns.getServer(server), this.serverList.concat(newServers)));
                newServers.push(...allowedNeighborNames.map(allowedHostname => ns.getServer(allowedHostname)));
                allowedServerNameList.push(...allowedNeighborNames);
            }
            this.serverList.push(...newServers);
            --depth;
        }       
    }

    private canAddServer(serverToCheck: Server, serverListToCheckAgainst: Server[] = this.serverList): boolean {
        const forbiddenServerNames = ['home', 'darkweb'];
        const forbiddenServerPrefixes = ['pserv-'];

        const isForbiddenServer = forbiddenServerNames.some(forbiddenServer => forbiddenServer === serverToCheck.hostname);
        const isForbiddenServerPrefix = forbiddenServerPrefixes.some(prefix => serverToCheck.hostname.startsWith(prefix));
        const isDuplicateServer = serverListToCheckAgainst.some(s => s.hostname === serverToCheck.hostname);

        return !isForbiddenServer && !isDuplicateServer && !isForbiddenServerPrefix;
    }

    public getHackableServers( ): Server[] {
        return this.serverList.filter(server => server.maxRam > 0);
    }
    
    
}