import "dotenv/config";
// @ts-ignore
import fs from "node:fs";

import {
    BlockfrostProvider,
    MeshTxBuilder,
    MeshWallet,
    serializePlutusScript,
    UTxO,
    applyParamsToScript, deserializeAddress
} from "@meshsdk/core";

import blueprint from "../plutus.json"

const blockchainProvider = new BlockfrostProvider(process.env.BLOCKFROST_PROJECT_ID);

export const wallet = new MeshWallet({
    networkId: 0,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
        type: "root",
        bech32: fs.readFileSync("admin.sk").toString()
    }
});

export const drep = new MeshWallet({
    networkId: 0,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
        type: "root",
        bech32: fs.readFileSync("drep.sk").toString()
    }
})

export function getScript(admin_wallet: MeshWallet) {
    console.log("Preparing to apply params to the script...", deserializeAddress(admin_wallet.addresses.baseAddressBech32));
    const scriptCbor = applyParamsToScript(
        blueprint.validators[0].compiledCode,
        [
            deserializeAddress(admin_wallet.addresses.baseAddressBech32).pubKeyHash
        ]
    )

    const scriptAddr = serializePlutusScript({
        code: scriptCbor,
        version: "V3"
    }).address;

    return {scriptCbor, scriptAddr};
}

export function getTxBuilder() {
    return new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        verbose: true,
    });
}

export async function getUtxoByTxHash(txHash: string): Promise<UTxO> {
    const utxos = await blockchainProvider.fetchUTxOs(txHash);
    if (utxos.length === 0) {
        throw new Error("UTxO not found");
    }

    return utxos[0];
}