import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import WalletConnection from './WalletConnection';

import BackgroundMain from './assets/Background_main.png';
import ConnectWallet from './assets/connect_wallet.png';
import Pay from './assets/pay.png';
import BackgroundGame from './assets/Background_game.png';
import Chihcoin from './assets/Chihcoin.png';
import Withdraw from './assets/withdraw.png';
import BackgroundSoon from './assets/Background_soon.png';
import Back from './assets/Back.png';

const App = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [paid, setPaid] = useState(false);
  const [balance, setBalance] = useState(0);
  const [view, setView] = useState('main');

  useEffect(() => {
    if (publicKey) {
      // Проверка первичного взноса
      checkPayment();
    }
  }, [publicKey]);

  const checkPayment = async () => {
    // Логика проверки, оплатил ли пользователь взнос
    // Пример:
    const transactions = await connection.getConfirmedSignaturesForAddress2(publicKey);
    const paymentTransaction = transactions.find(tx => tx.memo === 'Initial Payment');
    setPaid(!!paymentTransaction);
  };

  const handlePayment = async () => {
    if (!publicKey) return;
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey('2773TmmVMdRWCCEtj2TxtazmgACgBNGEDrtmvGNaLr9U'),
        lamports: 0.1 * LAMPORTS_PER_SOL,
      })
    );
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'processed');
    setPaid(true);
  };

  const handleChihcoinClick = () => {
    const increment = Math.floor(Math.random() * 10) + 1;
    setBalance(balance + increment);
    // Здесь логика сохранения баланса в локальном хранилище или на сервере
  };

  return (
    <WalletConnection>
      {view === 'main' && (
        <div style={{ backgroundImage: `url(${BackgroundMain})` }}>
          {!publicKey ? (
            <img src={ConnectWallet} alt="Connect Wallet" />
          ) : !paid ? (
            <>
              <img src={Pay} alt="Pay" onClick={handlePayment} />
              <p>To access the application, a one-time fee of 0.1 Sol is required.</p>
            </>
          ) : (
            <button onClick={() => setView('game')}>Enter Game</button>
          )}
        </div>
      )}

      {view === 'game' && (
        <div style={{ backgroundImage: `url(${BackgroundGame})` }}>
          <img src={Chihcoin} alt="Chihcoin" onClick={handleChihcoinClick} />
          <div>{balance} CHIH</div>
          <img src={Withdraw} alt="Withdraw" onClick={() => setView('soon')} />
        </div>
      )}

      {view === 'soon' && (
        <div style={{ backgroundImage: `url(${BackgroundSoon})` }}>
          <img src={Back} alt="Back" onClick={() => setView('game')} />
        </div>
      )}
    </WalletConnection>
  );
};

export default App;
