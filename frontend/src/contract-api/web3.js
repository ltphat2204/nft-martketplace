import Web3 from 'web3';
import LTPCoin from './LTPCoin.json';

const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
const contractAddress = '0x0005BA5281CEB65A1E99de9a08798F93063E557D';
const ltpContract = new web3.eth.Contract(LTPCoin.abi, contractAddress);

const getUserBalance = async (account) => {
    const balance = await ltpContract.methods.balanceOf(account).call();
    return balance;
};

export { web3, ltpContract, getUserBalance };
