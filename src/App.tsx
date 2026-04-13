import React, { useState } from 'react';
import { Wallet, Coins, Gift, ExternalLink, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useWeb3 } from './hooks/useWeb3';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function App() {
  const { account, loading, error, contractData, connectWallet, buyTokens, claimAirdrop } = useWeb3();
  const [buyAmount, setBuyAmount] = useState('0.1');
  const [referrer, setReferrer] = useState('');
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const handleBuy = async () => {
    try {
      setTxSuccess(null);
      const tx = await buyTokens(buyAmount, referrer || undefined);
      setTxSuccess(`Successfully purchased tokens! Hash: ${tx.hash}`);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleClaim = async () => {
    try {
      setTxSuccess(null);
      const tx = await claimAirdrop();
      setTxSuccess(`Airdrop claimed successfully! Hash: ${tx.hash}`);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-yellow-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Coins className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">BSC Portal</h1>
              <p className="text-[10px] text-yellow-500 font-mono uppercase tracking-widest leading-none">Binance Smart Chain</p>
            </div>
          </div>

          <button
            onClick={connectWallet}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 border
              ${account 
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                : 'bg-yellow-500 border-yellow-400 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
              }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Info & Stats */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                The Future of <span className="text-yellow-500">DeFi</span> on BSC
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                Participate in our exclusive pre-sale and claim your free airdrop tokens. 
                Built on a secure, audited smart contract for maximum transparency.
              </p>
            </div>

            {contractData && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Your Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {Number(contractData.balance).toLocaleString()} <span className="text-yellow-500 text-sm">{contractData.tokenSymbol}</span>
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Airdrop Reward</p>
                  <p className="text-2xl font-bold text-white">
                    {Number(contractData.airdropAmount).toLocaleString()} <span className="text-yellow-500 text-sm">{contractData.tokenSymbol}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0a0b] bg-white/10 flex items-center justify-center overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/40/40`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Join <span className="text-white font-semibold">2,400+</span> early adopters
              </p>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Buy Section */}
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-yellow-500/10 transition-colors duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                    <Coins className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Pre-sale Buy</h3>
                    <p className="text-sm text-gray-500">Get tokens at the lowest price</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <label className="text-gray-400 font-medium">Amount in BNB</label>
                      <span className="text-yellow-500 font-mono">Unlimited</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        placeholder="0.1"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png" alt="BNB" className="w-6 h-6" referrerPolicy="no-referrer" />
                        <span className="font-bold text-gray-400">BNB</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm text-gray-400 font-medium">Referrer Address (Optional)</label>
                    <input
                      type="text"
                      value={referrer}
                      onChange={(e) => setReferrer(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                    />
                  </div>

                  <button
                    onClick={handleBuy}
                    disabled={loading || !account}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-white/5 disabled:text-gray-600 text-black font-bold py-5 rounded-2xl text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-yellow-500/10"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                    {account ? 'Buy Tokens Now' : 'Connect Wallet to Buy'}
                  </button>
                </div>
              </div>
            </section>

            {/* Airdrop Section */}
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] -ml-32 -mb-32 rounded-full group-hover:bg-purple-500/10 transition-colors duration-700"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                    <Gift className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Claim Airdrop</h3>
                    <p className="text-sm text-gray-500">Free tokens for our community</p>
                  </div>
                </div>

                <button
                  onClick={handleClaim}
                  disabled={loading || !account || contractData?.hasClaimed}
                  className={`px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
                    ${contractData?.hasClaimed 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' 
                      : 'bg-white text-black hover:bg-gray-200 disabled:bg-white/5 disabled:text-gray-600'
                    }`}
                >
                  {contractData?.hasClaimed ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      Claimed
                    </>
                  ) : (
                    <>
                      <Gift className="w-6 h-6" />
                      {account ? 'Claim Now' : 'Connect to Claim'}
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Notifications */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-red-400">Transaction Failed</p>
                  <p className="text-sm text-red-400/80 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {txSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-bold text-green-400">Success!</p>
                  <p className="text-sm text-green-400/80 leading-relaxed break-all">{txSuccess}</p>
                  <a 
                    href={`https://bscscan.com/tx/${txSuccess.split('Hash: ')[1]}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-400 underline mt-2 hover:text-green-300"
                  >
                    View on BscScan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Coins className="w-5 h-5" />
            <span className="font-bold">BSC Portal</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Contract</a>
            <a href="#" className="hover:text-white transition-colors">Whitepaper</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Telegram</a>
          </div>
          <p className="text-xs text-gray-600">© 2026 BSC Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
