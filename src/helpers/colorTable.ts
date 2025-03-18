import { NS } from '@ns';

/*
 * This script generates a 256-color table in the terminal
 * https://gist.github.com/dominikwilkowski/60eed2ea722183769d586c76f22098dd
 * Colors are called using the format `\u001b[38;5;nm`
 *   where n is the color code printed in the table
 */

export async function main(ns: NS) {
    function generateColorTable() {
        let line = '';
        for (let n = 0; n <= 255; n++) {
            const colorCode = `\u001b[38;5;${n}m`;
            line += `${colorCode}${n}\u001b[0m `;
            if ((n - 15) % 10 === 0) {
                ns.tprint(line);
                line = '';
            }
        }
        if (line !== '') ns.tprint(line);
    }
    generateColorTable();
}