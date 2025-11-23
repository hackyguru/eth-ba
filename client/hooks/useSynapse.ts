import { Synapse, RPC_URLS, TIME_CONSTANTS } from '@filoz/synapse-sdk';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { useCallback } from 'react';

export const useSynapse = () => {
  const { wallets } = useWallets();
  const wallet = wallets[0];

  const uploadFile = useCallback(async (file: File) => {
    if (!wallet) throw new Error("Wallet not connected");

    try {
      console.log('Initializing Synapse SDK with wallet...');
      // Get Ethers Signer from Privy
      const ethProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethProvider);
      const signer = await provider.getSigner();

      // Initialize Synapse
      // Note: Synapse SDK documentation implies support for signer injection.
      // We pass the signer directly.
      // @ts-ignore - SDK types might not strictly match yet but this is the standard pattern
      const synapse = await Synapse.create({
        signer: signer,
        rpcURL: RPC_URLS.calibration.http,
      });

      console.log('🚀 Uploading file to Filecoin Onchain Cloud...');
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      try {
        const { pieceCid, size } = await synapse.storage.upload(data);
        console.log(`✅ Upload successful! CID: ${pieceCid}`);
        return { cid: pieceCid, size };
      } catch (uploadError: any) {
        const errString = JSON.stringify(uploadError) + (uploadError.message || '');
        
        // Check for Insufficient Funds (Warm Storage)
        if (errString.includes("InsufficientFunds") || errString.includes("MinimumRate") || errString.includes("CreateDataSetError")) {
          console.warn('⚠️ Insufficient funds in Filecoin Cloud. Attempting deposit...');
          
          const depositAmount = ethers.parseUnits("0.1", 18); // 0.1 USDFC
          
          const tx = await synapse.payments.depositWithPermitAndApproveOperator(
            depositAmount,
            synapse.getWarmStorageAddress(),
            ethers.MaxUint256,
            ethers.MaxUint256,
            TIME_CONSTANTS.EPOCHS_PER_MONTH
          );
          
          console.log('⏳ Waiting for deposit confirmation...');
          await tx.wait();
          console.log('✅ Deposit confirmed! Retrying upload...');

          const { pieceCid, size } = await synapse.storage.upload(data);
          return { cid: pieceCid, size };
        }
        throw uploadError;
      }
    } catch (error) {
      console.error("Synapse Upload Failed:", error);
      throw error;
    }
  }, [wallet]);

  return { uploadFile };
};

