import Web3 from 'web3';
import { combineLatest, from, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { $http } from '../api/http';
import { $storage } from './storage';

const ConnectType = {
  NotInstall: 'NotInstall', //没有安装metamask
  NotLogin: 'NotLogin', //没有登录metamask
  AccountChange: 'AccountChange', //帐号改变    返回格式 {account: xxx, chainName:xxx}
  ChainChanged: 'ChainChanged', //连接的链改变
  ConnectSuccess: 'ConnectSuccess', //连接成功
  ConnectReject: 'ConnectReject', //用户拒绝
};


const WalletType = {
  MetaMask: 'MetaMask',
  BinanceWallet: 'Binance Chain Wallet',
  TrustWallet: 'Trust Wallet',
  MathWallet: 'Math Wallet',
};

export const CHAIN_BROWSER = {
  1: 'https://etherscan.io',
  42: 'https://kovan.etherscan.io',
  56: 'https://bscscan.com',
  97: 'https://testnet.bscscan.com',
  128: 'https://scan.hecochain.com',
  256: 'https://scan-testnet.hecochain.com',
};

class WalletInit {
  connected: false;
  currentWallet: '';
  currentAccount: string;
  currentChainId: number;
  currentBalance: '';
  web3: Web3;
  ethereum: null;
  public accountStatusObservable = new ReplaySubject<string>(1);
  public connectStatusObservable = new ReplaySubject<boolean>(1);

  public chainIdObservable = new ReplaySubject<number>(1);
  public connectSuccess = new Subject<boolean>();

  constructor() {
    combineLatest([this.loginStatus()]).subscribe(
      ([isLogin]) => {
        console.log('isLogin', isLogin);
      },
    );
  }

  connect(walletType: string = WalletType.MetaMask) {
    // if (walletType === WalletType.MetaMask) {
    //
    // }
    if (walletType === WalletType.BinanceWallet) {
      // @ts-ignore
      this.web3 = new Web3(window['BinanceChain']);
      this.connectBinanceWallet();
    } else {
      // @ts-ignore
      this.web3 = new Web3(window['ethereum']);
      this.connectMetaMask();
    }
  }

  onInit() {
    // @ts-ignore
    const ethereum = window['ethereum'];
    if (ethereum) {
      ethereum.on('accountsChanged', (account: any) => {
        this.setAccount(account[0]);
      });
      ethereum.on('networkChanged', (chainId: string) => {
        this.setChain(Number(chainId));
      });
    }
    // @ts-ignore
    const binanceChain = window['BinanceChain'];
    if (binanceChain) {
      binanceChain.on('accountsChanged', (accounts: any) => {
      });
      binanceChain.on('chainChanged', (chainId: any) => {
      });
    }
  }

  public loginStatus() {
    return combineLatest([
      this.connectStatusObservable,
      this.accountStatusObservable.pipe(distinctUntilChanged()),
    ]).pipe(
      map(([isConnected, isLogin]) => {
        return Boolean(isConnected && isLogin);
      }),
    );
  }

  connectMetaMask() {
    // @ts-ignore
    const ethereum = window['ethereum'];
    if (!ethereum) {
      // NotInstall
    } else if (!ethereum.isConnected()) {
      // NotLogin
    } else {
      ethereum.enable().then((account: any) => {
        if (account.length) {
          this.setAccount(account[0]);
          this.getWeb3().eth.getChainId().then(id => {
            this.setChain(id);
            this.accountStatusChange();
          });
        }
      });
    }
  }

  connectBinanceWallet() {
    // @ts-ignore
    const binanceChain = window['BinanceChain'];
    if (!binanceChain) {
      console.log('window.BinanceChain is not found');
    } else if (!binanceChain.on) {
      console.log('window.BinanceChain is not connect');
    } else {
      binanceChain.enable().then((account: any) => {
        if (account.length) {
          this.setAccount(account[0]);
          this.getWeb3().eth.getChainId().then(id => {
            this.setChain(id);
            this.accountStatusChange();
          });
        }
      });
    }
  }

  setAccount(account: string) {
    this.currentAccount = account;
  }

  setChain(chain: number) {
    this.currentChainId = chain;
  }

  getWeb3() {
    return new Web3(Web3.givenProvider);
  }

  accountStatusChange() {
    this.accountStatusObservable.next(this.currentAccount);
    this.connectStatusObservable.next(true);
    this.chainIdObservable.next(this.currentChainId);
    this.connectSuccess.next(true);
  }

  handleSubscribe(data: {
    pool_address: string;
    master_chelf_addr?: string;
    user_address: string;
    email?: string;
    watch_fl?: string;
    tvl_inc?: number | string;
    tvl_dec?: number | string;
    method?: string;
  }) {
    console.log('data', data);
    return $http.post('/web/HandleSubcribe', {
      ...data,
    });
  }

  addressAnalysis(data: {
    chain: string;
    address: string;
    connect_address: string;
  }) {
    return $http.post('/web/AddressAnalysis', {
      ...data,
    });
  }

  getBrowserAddress = async (address: string, chainId?:number) => {
    const chain = chainId ? chainId : await this.getWeb3().eth.getChainId();
    // @ts-ignore
    return CHAIN_BROWSER[chain] + '/address/' + address;
  };

  getBrowserTx = async (tx: string) => {
    const chain = await this.getWeb3().eth.getChainId();
    // @ts-ignore
    return CHAIN_BROWSER[id] + '/tx/' + tx;
  };

  getChainId = async () => {
    return await this.getWeb3().eth.getChainId();
  };

  winOpen = (url: string) => {
    window.open(url);
  };
}

const walletInit = new WalletInit();
export { walletInit, WalletType };
