import { readFileSync } from "fs";
import path from "path";
import { GenLayerChain, GenLayerClient, TransactionHash, TransactionStatus } from "genlayer-js/types";

export default async function main(client: GenLayerClient<GenLayerChain>) {
  const filePath = path.resolve(process.cwd(), "contracts/grantora_protocol.py");
  const contractCode = new Uint8Array(readFileSync(filePath));

  await client.initializeConsensusSmartContract();

  const deployTransaction = await client.deployContract({
    code: contractCode,
    args: [],
  });

  const receipt = await client.waitForTransactionReceipt({
    hash: deployTransaction as TransactionHash,
    status: TransactionStatus.ACCEPTED,
    retries: 200,
    interval: 4000,
  });

  const leaderReceipt = receipt.consensus_data?.leader_receipt?.[0];

  if (leaderReceipt?.execution_result !== "SUCCESS") {
    throw new Error(`Deployment failed. Receipt: ${JSON.stringify(receipt)}`);
  }

  console.log("Contract deployed successfully.", {
    transactionHash: deployTransaction,
    contractAddress: receipt.data?.contract_address,
  });
}
