
import { Server } from '@ns';

export class ServerNode implements Server {
    public hostname: string;
    public ip: string;
    public sshPortOpen: boolean;
    public ftpPortOpen: boolean;
    public httpPortOpen: boolean;
    public numOpenPortsRequired: number;
    public hackingRequired: number;
    public maxMoney: number;
    public minSecurity: number;
    public money: number;
    public requiredHackingSkill: number;
    public requiredPortAccess: string[];
    public security: number;
    public vulnerability: number;

    constructor(
        hostname: string,
        ip: string,
        sshPortOpen: boolean,
        ftpPortOpen: boolean,
        httpPortOpen: boolean,
        numOpenPortsRequired: number,
        hackingRequired: number,
        maxMoney: number,
        minSecurity: number,
        money: number,
        requiredHackingSkill: number,
        requiredPortAccess: string[],
        security: number,
        vulnerability: number
    ) {
        this.hostname = hostname;
        this.ip = ip;
        this.sshPortOpen = sshPortOpen;
        this.ftpPortOpen = ftpPortOpen;
        this.httpPortOpen = httpPortOpen;
        this.numOpenPortsRequired = numOpenPortsRequired;
        this.hackingRequired = hackingRequired;
        this.maxMoney = maxMoney;
        this.minSecurity = minSecurity;
        this.money = money;
        this.requiredHackingSkill = requiredHackingSkill;
        this.requiredPortAccess = requiredPortAccess;
        this.security = security;
        this.vulnerability = vulnerability;
    }
    smtpPortOpen!: boolean;
    sqlPortOpen!: boolean;
    hasAdminRights!: boolean;
    cpuCores!: number;
    isConnectedTo!: boolean;
    ramUsed!: number;
    maxRam!: number;
    organizationName!: string;
    purchasedByPlayer!: boolean;
    backdoorInstalled?: boolean | undefined;
    baseDifficulty?: number | undefined;
    hackDifficulty?: number | undefined;
    minDifficulty?: number | undefined;
    moneyAvailable?: number | undefined;
    moneyMax?: number | undefined;
    openPortCount?: number | undefined;
    serverGrowth?: number | undefined;
}