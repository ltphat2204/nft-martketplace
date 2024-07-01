import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import Web3 from 'web3';
import LTPCoin from '../contract-api/LTPCoin.json';

const Withdraw = ({ show, handleClose, updateBalances }) => {
    const [contractBalance, setContractBalance] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);
    const [withdrawError, setWithdrawError] = useState('');

    useEffect(() => {
        const fetchContractBalance = async () => {
            try {
                const web3 = new Web3(window.ethereum);
                const contractAddress = '0x0005BA5281CEB65A1E99de9a08798F93063E557D';
                const balanceInWei = await web3.eth.getBalance(contractAddress);
                const balanceInEther = web3.utils.fromWei(balanceInWei, 'ether');
                setContractBalance(balanceInEther);
            } catch (error) {
                console.error('Error fetching contract balance:', error);
            }
        };

        fetchContractBalance();
    }, []);

    const handleWithdraw = async () => {
        if (!withdrawAmount) {
            setWithdrawError('Please enter the amount to withdraw.');
            return;
        }

        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            setWithdrawError('Please enter a valid amount.');
            return;
        }

        if (amount > parseFloat(contractBalance)) {
            setWithdrawError('Withdraw amount exceeds contract balance.');
            return;
        }

        setIsWithdrawing(true);
        setWithdrawError('');

        try {
            const web3 = new Web3(window.ethereum);
            await window.ethereum.enable(); // Ensure MetaMask is enabled
            const contract = new web3.eth.Contract(LTPCoin.abi, '0x0005BA5281CEB65A1E99de9a08798F93063E557D');
            const accounts = await web3.eth.getAccounts();
            const fromAddress = accounts[0]; // Assuming MetaMask is used and connected
            await contract.methods.withdrawETH(web3.utils.toWei(withdrawAmount, 'ether')).send({ from: fromAddress });
            setWithdrawSuccess(true);
        } catch (error) {
            console.error('Withdraw failed:', error);
            setWithdrawError('Withdraw failed. Please try again.');
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleAlertClose = () => {
        setWithdrawSuccess(false);
        handleClose();
        updateBalances(); // Update balances after closing modal
    };

    // Close modal after 1 second if withdrawal was successful
    useEffect(() => {
        let timeout;
        if (withdrawSuccess) {
            timeout = setTimeout(() => {
                handleClose();
                updateBalances(); // Update balances after closing modal
            }, 1000); // 1 second timeout
        }
        return () => clearTimeout(timeout);
    }, [withdrawSuccess, handleClose, updateBalances]);

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Withdraw ETH from Contract</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {withdrawSuccess && (
                    <Alert variant="success" onClose={handleAlertClose} dismissible>
                        Withdraw successful!
                    </Alert>
                )}
                {withdrawError && (
                    <Alert variant="danger" onClose={() => setWithdrawError('')} dismissible>
                        {withdrawError}
                    </Alert>
                )}
                <Form.Group className="mb-3" controlId="formWithdrawAmount">
                    <Form.Label>Withdraw Amount (ETH)</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        isInvalid={!!withdrawError}
                    />
                    <Form.Control.Feedback type="invalid">
                        {withdrawError}
                    </Form.Control.Feedback>
                    <Form.Text className="white-text">
                        Contract ETH Balance: <span>{contractBalance}</span>
                    </Form.Text>
                </Form.Group>
                <Button variant="info" onClick={handleWithdraw} disabled={isWithdrawing}>
                    {isWithdrawing ? 'Processing...' : 'Withdraw'}
                </Button>
            </Modal.Body>
            <Modal.Footer className="custom-modal-footer">
                <Button variant="secondary" onClick={handleClose} className="custom-close-button">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Withdraw;
