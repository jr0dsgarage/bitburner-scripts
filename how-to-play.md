# How to Play Bitburner using this Repo

This is an instructional how-to on using my personal scripts to play Bitburner.

**NB: This is a work in progress and should not be followed yet**

## Setup the Game

- Follow the Tutorial, or skip if you're just starting over

- Connect to the Remote API using port `12525` in Options to get the scripts onto the home computer.  If VSCode is not set up to run the API, follow the instructions in  [Beginnersguide.md](/BeginnersGuide.md)

## Starting the Game

1. Study Computer Science from `City -> Rothman University` to start increasing Hack skill

2. Run hs1.js

    Usage: `run hs1.js <hack-script> [<target-server>] [-h] [-f] [-k] [-d]`

    ```
    home; clear; killall; run hs1.js my-first-hack.js -h -f -k -d
    ```
    NB: the script will automatically target the `n00dles` server with the hack unless the <target-server> argument is set
    
    NB: The flags are optional

    - -h runs the hack script on the home computer
    - -f fetches any files found on servers
    - -k will killall running scripts first
    - -d will print debug text for more information

3. At Hacking skill 25 Create Program: `AutoLink.exe`

    - This might be optional, it just makes it easier to get to other servers using `scan-analyze` because you can click on the names, rather than having to connect down through the server chain to connect to a specific server.

4. At Hacking skill 50 Create Program: `BruteSSH.exe`

5. Once #4 is complete, run `scan-analyze 3` and click to Connect to CSEC 
    - run `brutessh.exe` then `nuke.exe` 
    - run `backdoor`

6. Join CSEC

7. At $1m upgrade the RAM on the home computer, which will allow us to run hs2
    - Upgrades can be purchased at `City -> Alpha Enterprises`

### After upgrading the home computer

1. Run hs2.js

    Usage: `run hs2.js <hack-script> [<target-server>] [-h] [-f] [-k] [-d]`

    ```
    home; clear; killall; run hs2.js my-first-hack.js -h -f -k -d
    ```
    NB: the script will automatically target the server designated as default in servermatrix.js, which is `joesguns`, unless the <target-server> argument is set
    
    NB: The flags are optional

    - -h runs the hack script on the home computer
    - -f fetches any files found on servers
    - -k will killall running scripts first
    - -d will print debug text for more information

2. At Hacking skill 75 Create Program: `DeepscanV1.exe`