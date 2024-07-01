import { createContext, useState, useEffect } from 'react';
import { ethers } from "ethers";

export const WalletContext = createContext({
    walletAddress: '',
    isConnected: false,
    connectWallet: () => { },
    disconnectWallet: () => { },
    isLoading: false,
});

export const WalletProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install Metamask");
            }

            setIsLoading(true);
        
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setWalletAddress(address);
            setIsConnected(true);
            setIsLoading(false);
            return address;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setIsLoading(false);
            throw error;
        }
    };

    const disconnectWallet = async () => {
        setWalletAddress('');
        setIsConnected(false);
    };

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            const address = accounts[0];
            setWalletAddress(address);
            setIsConnected(true);
        } else {
            setWalletAddress('');
            setIsConnected(false);
        }
    };

    const value = {
        walletAddress,
        isConnected,
        connectWallet,
        disconnectWallet,
        isLoading,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
