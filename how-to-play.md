# How to Play Bitburner using this Repo

This is an instructional how-to on using my personal scripts to play Bitburner.

## NB: This is a work in progress and should not be followed yet

## Setup the Game

- Follow the Tutorial, or skip if you're just starting over

- Connect to the Remote API using port `12525` in Options to get the scripts onto the home computer.  If VSCode is not set up to run the API, follow the instructions in  [Beginnersguide.md](/BeginnersGuide.md)

  - In VSCode the src files will end in .ts, but in game they are seen as .js files

## Starting the Game

1. Study Computer Science from `City -> Rothman University` to start increasing Hack skill

2. Run hs1.js

    Usage: `run hs1.js <hack-script> [<target-server>] [-h] [-f] [-k] [-d]`

    ```bash
    home; clear; killall; run hs1.js ./deployables/my-first-hack.js -h -f -k -d
    ```

    NB: the script will automatically target the `n00dles` server with the hack unless the `<target-server>` argument is set
    
    NB: The flags are optional

    - -h runs the hack script on the home computer
    - -f fetches any files found on servers
    - -k will killall running scripts first
    - -d will print debug text for more information

3. At Hacking skill 25 Create Program: `AutoLink.exe`

    - This might be optional, it just makes it easier to get to other servers using `scan-analyze` because you can click on the names, rather than having to connect down through the server chain to connect to a specific server.

4. At Hacking skill 50 Create Program: `BruteSSH.exe`. This program allows you to open the first port on servers that have it closed.

5. Once #4 is complete, run `scan-analyze 3` and click to Connect to CSEC 
    - run `brutessh.exe` then `nuke.exe` 
    - run `backdoor`

6. Join the CSEC Faction to start earning reputation with the faction

7. At $1m upgrade the RAM on the home computer, which will allow us to run hs2
    - Upgrades can be purchased at `City -> Alpha Enterprises`

## After upgrading the home computer

### If there is 'down-time' between creating programs, complete Hacking contracts for CSEC to earn favor and increase hacking skill

1. Run hs2.js.  

    This advanced hacking script will:
    - auto purchase personal servers if there is enough monies to do so. 
    - scan all servers to the depth that is currently possible, and build a server matrix.
    - automatically open ports on each server based off of which programs have been Created.  
    - auto nuke each server
    - start hacking the target using the servers that it was able to scan.

    Usage: `run hs2.js <hack-script> [<target-server>] [-h] [-f] [-k] [-d]`

    ```bash
    home; clear; killall; run hs2.js ./deployables/my-first-hack.js -h -f -k -d
    ```

    NB: the script will automatically target the server designated as default in `server-matrix.js`, which is `joesguns`, unless the `<target-server>` argument is set
    
    NB: The flags are optional

    - -h runs the hack script on the home computer
    - -f fetches any files found on servers
    - -k will killall running scripts first
    - -d will print debug text for more information

    **The hs2.js script can be re-run at any time,  but should ***ALWAYS*** be re-run after a new Program is created, because it will be able to open more ports**

2. At Hacking skill 75 Create Program: `DeepscanV1.exe` then `ServerProfiler.exe`

3. Run `scan-analyze 5` to display a list of all servers

4. Click on the server `I.I.I.I.` 
    - run `backdoor` to receive an invitation to the `The Black Hand` faction

5. Click on the server `avmnite-02h` 
    - run `backdoor` to receive an invitation to the `Nitesec` faction

6. At Hacking skill 100 Create Program: `FTPCrack.exe`

7. At Hacking skill 250 Create Program: `relaySMTP.exe`

8. At Hacking skill 400 Create Program: `DeepscanV2.exe`

9. At Hacking skill 500 Create Program: `HTTPWorm.exe`

10. At Hacking skill 750 Create Program: `SQLInject.exe`

11. At Hacking skill 1000 Create Program: `Formulas.exe`
