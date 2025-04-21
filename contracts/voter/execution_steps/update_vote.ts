import {drep, getScript, getTxBuilder, getUtxoByTxHash, wallet} from "./common.js";
import {Asset, deserializeAddress, mConStr0} from "@meshsdk/core";
import * as crypto from "crypto";

const known_tx_hash = '7f5a3901e5f4bc03db4ae4530f305b6009ca97e8841e13118a9731fd24b6d068';

async function main() {
    await drep.init();
    await wallet.init();

    const utxo = await getUtxoByTxHash(known_tx_hash);

    const {scriptCbor, scriptAddr} = getScript(wallet);

    const assets: Asset[] = [
        {
            unit: "lovelace",
            quantity: "17000000"
        }
    ]

    const walletAddress = (await wallet.getUnusedAddresses())[0];
    const changeAddress = (await drep.getUnusedAddresses())[0];
    // console.log(`Change Address: ${changeAddress}`);
    const signerHash = deserializeAddress(changeAddress).pubKeyHash;
    const walletHash = deserializeAddress(walletAddress).pubKeyHash;
    const vote_hash = crypto.randomBytes(32).toString('hex')

    const utxos = await wallet.getUtxos();

    const collateral_utxo = utxos[0];

    // console.log(utxo);
    // console.log(utxo.output.amount[0])

    const txBuilder = getTxBuilder();
    await txBuilder
        .spendingPlutusScript("V3")
        .txIn(
            utxo.input.txHash,
            utxo.input.outputIndex,
            utxo.output.amount,
            scriptAddr
        )
        .spendingReferenceTxInInlineDatumPresent()
        .spendingReferenceTxInRedeemerValue("")
        .txInScript(scriptCbor)
        .txOut(scriptAddr, assets)
        .txOutInlineDatumValue(mConStr0([signerHash, vote_hash]))
        .txInCollateral(
            collateral_utxo.input.txHash,
            collateral_utxo.input.outputIndex,
            collateral_utxo.output.amount,
            collateral_utxo.output.address
        )
        .requiredSignerHash(signerHash)
        .requiredSignerHash(walletHash)
        // .setFee("876761")
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .complete();

    const unsignedTx = txBuilder.txHex;
    const signedTx = await drep.signTx(unsignedTx, true);
    console.log(signedTx)
    const fullySignedTx = await wallet.signTx(signedTx, true);
    const txHash = await drep.submitTx(fullySignedTx);

    console.log(`Submitted change to vote with Tx ID: ${txHash}`);

}

main();