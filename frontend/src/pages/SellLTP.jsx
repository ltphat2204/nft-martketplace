import { useState, useEffect } from 'react';
import '../styles/SellLTP.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { web3, ltpContract } from '../contract-api/web3';

const SellLTP = ({ show, handleClose, updateBalances }) => {
    const [amountLTP, setAmountLTP] = useState('');
    const [amountETH, setAmountETH] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableLTP, setAvailableLTP] = useState(0);

    const ltpToEthRate = 0.000097; // 1 LTP = 0.000097 ETH if sold

    // Function to fetch available LTP from the contract
    const fetchAvailableLTP = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const userAddress = accounts[0];
            const balance = await ltpContract.methods.balanceOf(userAddress).call();
            setAvailableLTP(balance);
        } catch (error) {
            console.error('Error fetching available LTP:', error);
        }
    };

    useEffect(() => {
        if (show) {
            fetchAvailableLTP();
        }
    }, [show]);

    const handleAmountLTPChange = (value) => {
        if (isNaN(value) || value < 0) return;
        setAmountLTP(value);
        const ethValue = parseFloat(value) * ltpToEthRate;
        setAmountETH(ethValue.toFixed(10));
        // Reset errors when input changes
        setErrors({});
    };

    const handleAmountETHChange = (value) => {
        if (isNaN(value) || value < 0) return;
        setAmountETH(value);
        const ltpValue = parseFloat(value) / ltpToEthRate;
        setAmountLTP(ltpValue.toFixed(0));
        // Reset errors when input changes
        setErrors({});
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
            const inputAmountLTP = parseFloat(amountLTP);
            const availableLTPFloat = parseFloat(web3.utils.fromWei(String(availableLTP), 'ether'));

            if (inputAmountLTP > availableLTPFloat) {
                setErrors({
                    amountLTP: 'Insufficient LTP. Enter a valid amount.',
                    amountLTPColor: 'red'  // This color state will be used to change text color
                });
            } else {
                setLoading(true);
                try {
                    if (window.ethereum) {
                        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                        const amountInWei = web3.utils.toWei(amountLTP, 'ether');

                        await ltpContract.methods.sellLTP(amountInWei).send({ from: accounts[0] });

                        setSuccessMessage('Transaction successful!');
                        setTimeout(() => {
                            setSuccessMessage('');
                            handleClose();
                            updateBalances(); // Update balances in Wallet.jsx
                        }, 1000);
                    } else {
                        console.error('Ethereum wallet not detected');
                    }
                } catch (error) {
                    console.error('Transaction failed', error);
                    setErrors({ transaction: 'Transaction failed. Please try again.' });
                } finally {
                    setLoading(false);
                    setAmountLTP('');
                    setAmountETH('');
                    fetchAvailableLTP(); // Update available LTP after transaction
                }
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Sell LTP</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                {errors.transaction && <div className="alert alert-danger">{errors.transaction}</div>}
                <p className="exchange-rate">1 LTP = {ltpToEthRate} ETH</p>
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
                            isInvalid={!!errors.amountETH}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.amountETH}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <div className="available-ltp">
                        Available LTP: {' '}
                        <span style={{ color: errors.amountLTPColor }}>
                            {web3.utils.fromWei(String(availableLTP), 'ether')}
                        </span>
                    </div>
                    <div className="sell-button-container">
                        <Button variant="danger" type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Sell'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer className="custom-modal-footer">
                <Button variant="secondary" onClick={handleClose} className="custom-close-button">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SellLTP;
