import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

const BSC_CHAIN_ID = '0x38'; // 56 in decimal
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<{
    airdropAmount: string;
    hasClaimed: boolean;
    balance: string;
    tokenName: string;
    tokenSymbol: string;
  } | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();

      if (network.chainId !== BigInt(56)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BSC_CHAIN_ID }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: BSC_CHAIN_ID,
                  chainName: 'Binance Smart Chain',
                  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                  rpcUrls: [BSC_RPC_URL],
                  blockExplorerUrls: ['https://bscscan.com/'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      const signer = await browserProvider.getSigner();
      const bscContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setContract(bscContract);
      
      // Initial data fetch
      fetchContractData(bscContract, accounts[0]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContractData = async (contractInstance: ethers.Contract, userAddress: string) => {
    try {
      // Check which functions exist in the new ABI
      const [balance, name, symbol, presaleSupply] = await Promise.all([
        contractInstance.balanceOf(userAddress),
        contractInstance.name(),
        contractInstance.symbol ? contractInstance.symbol() : Promise.resolve("TOKEN"),
        contractInstance.PRESALE_SUPPLY ? contractInstance.PRESALE_SUPPLY() : Promise.resolve(BigInt(0))
      ]);

      setContractData({
        airdropAmount: ethers.formatEther(presaleSupply), // Using PRESALE_SUPPLY as a placeholder for airdropAmount
        hasClaimed: false, // New contract doesn't have hasClaimedAirdrop
        balance: ethers.formatEther(balance),
        tokenName: name,
        tokenSymbol: symbol
      });
    } catch (err) {
      console.error("Error fetching contract data:", err);
    }
  };

  const buyTokens = async (bnbAmount: string, _referrer: string = ethers.ZeroAddress) => {
    if (!contract) return;
    setLoading(true);
    setError(null);
    try {
      // New ABI uses buyPresale (no arguments)
      const tx = await contract.buyPresale({
        value: ethers.parseEther(bnbAmount)
      });
      await tx.wait();
      if (account) fetchContractData(contract, account);
      return tx;
    } catch (err: any) {
      console.error(err);
      setError(err.reason || err.message || "Transaction failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const claimAirdrop = async () => {
    if (!contract || !account) return;
    setLoading(true);
    setError(null);
    try {
      // New ABI uses airdrop(address[]) - assuming user can call it for themselves
      const tx = await contract.airdrop([account]);
      await tx.wait();
      if (account) fetchContractData(contract, account);
      return tx;
    } catch (err: any) {
      console.error(err);
      setError(err.reason || err.message || "Airdrop claim failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (contract) fetchContractData(contract, accounts[0]);
        } else {
          setAccount(null);
          setContractData(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [contract]);

  return {
    account,
    loading,
    error,
    contractData,
    connectWallet,
    buyTokens,
    claimAirdrop,
    refreshData: () => account && contract && fetchContractData(contract, account)
  };
}
