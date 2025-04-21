import {Asset, deserializeAddress, mConStr0} from "@meshsdk/core";
import {drep, getScript, getTxBuilder, wallet} from "./common.ts";

async function main() {
    await wallet.init();

    const assets: Asset[] = [
        {
            unit: "lovelace",
            quantity: "20000000"
        }
    ]


    const utxos = await wallet.getUtxos();

    console.log(utxos);

    const walletAddress = (await wallet.getUnusedAddresses())[0];
    const drepAddress = (await drep.getUnusedAddresses())[0];

    const {scriptAddr} = getScript(wallet);

    const signerHash = deserializeAddress(drepAddress).pubKeyHash;

    const txBuilder = getTxBuilder();
    await txBuilder
        .txOut(scriptAddr, assets)
        .txOutInlineDatumValue(mConStr0([signerHash, '']))
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .complete();

    const unsignedTx = txBuilder.txHex;

    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    console.log(`1 tADA locked into the contract as Tx ID: ${txHash}`);
}

main();

