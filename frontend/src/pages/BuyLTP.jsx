import { useState, useEffect } from 'react';
import '../styles/BuyLTP.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { web3, ltpContract } from '../contract-api/web3'; // Adjust the import path as necessary

const BuyLTP = ({ show, handleClose, refreshBalances }) => {
    const [amountLTP, setAmountLTP] = useState('');
    const [amountETH, setAmountETH] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [ethBalance, setEthBalance] = useState('0'); // New state for ETH balance
    const [ethAmountError, setEthAmountError] = useState(false); // State for ETH amount error
    const [isBuying, setIsBuying] = useState(false); // State for transaction in progress

    const ltpToEthRate = 0.0001; // 1 LTP = 0.0001 ETH

    useEffect(() => {
        const fetchEthBalance = async () => {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                
                console.log(accounts[0])
                const account = accounts[0];
                const balance = await web3.eth.getBalance(account);
                const ethBalance = web3.utils.fromWei(balance, 'ether');
                setEthBalance(ethBalance);
            } catch (error) {
                console.error('Error fetching ETH balance:', error);
            }
        };

        if (show) {
            fetchEthBalance();
        }
    }, [show]);

    const handleAmountLTPChange = (value) => {
        if (isNaN(value) || value < 0) return;
        setAmountLTP(value);
        const ethValue = parseFloat(value) * ltpToEthRate;
        setAmountETH(ethValue.toFixed(10));
    };

    const handleAmountETHChange = (value) => {
        if (isNaN(value) || value < 0) return;
        setAmountETH(value);
        const ltpValue = parseFloat(value) / ltpToEthRate;
        setAmountLTP(ltpValue.toFixed(0));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!amountLTP || parseFloat(amountLTP) <= 0) {
            newErrors.amountLTP = 'Amount of LTP is required and must be greater than 0';
        }
        if (!amountETH || parseFloat(amountETH) <= 0) {
            newErrors.amountETH = 'Amount of ETH is required and must be greater than 0';
        }
        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
        } else {
            try {
                setIsBuying(true); // Set state to indicate transaction in progress

                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                const account = accounts[0];
                console.log('Connected account:', account);

                const ethAmount = web3.utils.toWei(amountETH, 'ether');

                // Check if ETH amount exceeds available ETH balance
                if (parseFloat(amountETH) > parseFloat(ethBalance)) {
                    setEthAmountError(true);
                    setIsBuying(false); // Reset state if validation fails
                    return;
                }

                await ltpContract.methods.buyLTP().send({ from: account, value: ethAmount });
                console.log('Transaction successful!');

                setAmountLTP('');
                setAmountETH('');
                setErrors({});
                setSuccessMessage('Transaction successful!');
                setTimeout(() => {
                    setSuccessMessage('');
                    handleClose();
                    refreshBalances();
                }, 1000);
            } catch (error) {
                console.error('Error connecting to contract:', error);
                setErrors({ form: 'Transaction failed. Please try again.' });
            } finally {
                setIsBuying(false); // Reset state after transaction attempt
            }
        }
    };

    return (
        <Modal show={show} onHide={() => { handleClose(); refreshBalances(); }} centered>
            <Modal.Header closeButton>
                <Modal.Title>Buy LTP</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                <p className="custom-text">1 LTP = {ltpToEthRate} ETH</p>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formLTPAmount">
                        <Form.Label>Amount of LTP</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter amount"
                            value={amountLTP}
                            onChange={(e) => handleAmountLTPChange(e.target.value)}
                            isInvalid={!!errors.amountLTP}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.amountLTP}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formETHAmount">
                        <Form.Label>Amount of ETH</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.0000000001"
                            placeholder="Enter amount"
                            value={amountETH}
                            onChange={(e) => handleAmountETHChange(e.target.value)}
                            isInvalid={!!errors.amountETH || ethAmountError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.amountETH || (ethAmountError && `Amount exceeds available ETH: ${ethBalance} ETH`)}
                        </Form.Control.Feedback>
                        <Form.Text className={`custom-text ${ethAmountError ? 'text-danger' : ''}`}>
                            Available ETH: {ethBalance} ETH
                        </Form.Text>
                    </Form.Group>
                    <Button variant="success" type="submit" disabled={isBuying}>
                        {isBuying ? 'Processing...' : 'Buy'}
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer className="custom-modal-footer">
                <Button variant="secondary" onClick={() => { handleClose(); refreshBalances(); }} className="custom-close-button">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BuyLTP;
