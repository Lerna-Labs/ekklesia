import { MeshWallet } from "@meshsdk/core";
// @ts-ignore
import fs from "node:fs";

async function main() {
    const secret_key = MeshWallet.brew(true) as string;

    fs.writeFileSync("admin.sk", secret_key, "utf8");

    const wallet = new MeshWallet({
        networkId: 0,
        key: {
            type: "root",
            bech32: secret_key,
        },
    });

    fs.writeFileSync("admin.addr", (await wallet.getUnusedAddresses())[0]);
}

main();