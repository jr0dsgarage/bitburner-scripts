/** @param {NS} ns */
export async function main(ns) {
    // How much RAM each purchased server will have. In this case, it'll
    // be 8GB.
    const ram = 8;
    // Iterator we'll use for our loop
    let i = 1; // changed to 1 by j__r0d because 1 is a better place to start than 0 for this counter
    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers
    while (i < ns.getPurchasedServerLimit()) {
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with 3 threads
            //  4. Increment our iterator to indicate that we've bought a new server
            const hostname = ns.purchaseServer("pserv-" + i, ram);
            ns.scp("early-hack-template.js", hostname);
            ns.exec("early-hack-template.js", hostname, 3);
            ++i;
        }
        //Make the script wait for a second before looping again.
        //Removing this line will cause an infinite loop and crash the game.
        await ns.sleep(1000);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyY2hhc2Utc2VydmVyLThnYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1cmNoYXNlLXNlcnZlci04Z2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEscUJBQXFCO0FBQ3JCLE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU07SUFDN0Isb0VBQW9FO0lBQ3BFLFVBQVU7SUFDVixNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFFZCxrQ0FBa0M7SUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsc0ZBQXNGO0lBRWpHLHVFQUF1RTtJQUN2RSxvQkFBb0I7SUFDcEIsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEVBQUU7UUFDckMscURBQXFEO1FBQ3JELElBQUksRUFBRSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNyRSxpQ0FBaUM7WUFDakMsMEJBQTBCO1lBQzFCLDhEQUE4RDtZQUM5RCwwRUFBMEU7WUFDMUUsd0VBQXdFO1lBQ3hFLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN0RCxFQUFFLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLEVBQUUsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLEVBQUUsQ0FBQyxDQUFDO1NBQ1A7UUFDRCx5REFBeUQ7UUFDekQsb0VBQW9FO1FBQ3BFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN4QjtBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0aGUgY29udGVudHMgb2YgdGhpcyBzY3JpcHQgY2FtZSBmcm9tIHRoZSBCZWdpbm5lcidzIEd1aWRlIGluIHRoZSBnYW1lJ3MgZG9jdW1lbnRhdGlvbi4uLlxyXG5pbXBvcnQgeyBOUyB9IGZyb20gXCJAbnNcIjtcclxuLyoqIEBwYXJhbSB7TlN9IG5zICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWluKG5zOiBOUykge1xyXG4gICAgLy8gSG93IG11Y2ggUkFNIGVhY2ggcHVyY2hhc2VkIHNlcnZlciB3aWxsIGhhdmUuIEluIHRoaXMgY2FzZSwgaXQnbGxcclxuICAgIC8vIGJlIDhHQi5cclxuICAgIGNvbnN0IHJhbSA9IDg7XHJcblxyXG4gICAgLy8gSXRlcmF0b3Igd2UnbGwgdXNlIGZvciBvdXIgbG9vcFxyXG4gICAgbGV0IGkgPSAxOyAvLyBjaGFuZ2VkIHRvIDEgYnkgal9fcjBkIGJlY2F1c2UgMSBpcyBhIGJldHRlciBwbGFjZSB0byBzdGFydCB0aGFuIDAgZm9yIHRoaXMgY291bnRlclxyXG5cclxuICAgIC8vIENvbnRpbnVvdXNseSB0cnkgdG8gcHVyY2hhc2Ugc2VydmVycyB1bnRpbCB3ZSd2ZSByZWFjaGVkIHRoZSBtYXhpbXVtXHJcbiAgICAvLyBhbW91bnQgb2Ygc2VydmVyc1xyXG4gICAgd2hpbGUgKGkgPCBucy5nZXRQdXJjaGFzZWRTZXJ2ZXJMaW1pdCgpKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBlbm91Z2ggbW9uZXkgdG8gcHVyY2hhc2UgYSBzZXJ2ZXJcclxuICAgICAgICBpZiAobnMuZ2V0U2VydmVyTW9uZXlBdmFpbGFibGUoXCJob21lXCIpID4gbnMuZ2V0UHVyY2hhc2VkU2VydmVyQ29zdChyYW0pKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgZW5vdWdoIG1vbmV5LCB0aGVuOlxyXG4gICAgICAgICAgICAvLyAgMS4gUHVyY2hhc2UgdGhlIHNlcnZlclxyXG4gICAgICAgICAgICAvLyAgMi4gQ29weSBvdXIgaGFja2luZyBzY3JpcHQgb250byB0aGUgbmV3bHktcHVyY2hhc2VkIHNlcnZlclxyXG4gICAgICAgICAgICAvLyAgMy4gUnVuIG91ciBoYWNraW5nIHNjcmlwdCBvbiB0aGUgbmV3bHktcHVyY2hhc2VkIHNlcnZlciB3aXRoIDMgdGhyZWFkc1xyXG4gICAgICAgICAgICAvLyAgNC4gSW5jcmVtZW50IG91ciBpdGVyYXRvciB0byBpbmRpY2F0ZSB0aGF0IHdlJ3ZlIGJvdWdodCBhIG5ldyBzZXJ2ZXJcclxuICAgICAgICAgICAgY29uc3QgaG9zdG5hbWUgPSBucy5wdXJjaGFzZVNlcnZlcihcInBzZXJ2LVwiICsgaSwgcmFtKTtcclxuICAgICAgICAgICAgbnMuc2NwKFwiZWFybHktaGFjay10ZW1wbGF0ZS5qc1wiLCBob3N0bmFtZSk7XHJcbiAgICAgICAgICAgIG5zLmV4ZWMoXCJlYXJseS1oYWNrLXRlbXBsYXRlLmpzXCIsIGhvc3RuYW1lLCAzKTtcclxuICAgICAgICAgICAgKytpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL01ha2UgdGhlIHNjcmlwdCB3YWl0IGZvciBhIHNlY29uZCBiZWZvcmUgbG9vcGluZyBhZ2Fpbi5cclxuICAgICAgICAvL1JlbW92aW5nIHRoaXMgbGluZSB3aWxsIGNhdXNlIGFuIGluZmluaXRlIGxvb3AgYW5kIGNyYXNoIHRoZSBnYW1lLlxyXG4gICAgICAgIGF3YWl0IG5zLnNsZWVwKDEwMDApO1xyXG4gICAgfVxyXG59Il19