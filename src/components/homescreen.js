import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { utils, ethers } from 'ethers';
import abi from './Bank.json';

const HomeScreen = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankOwner, setIsBankOwner] = useState(false);
  const [deposit, setDeposit] = useState('');
  const [withdraw, setWithdraw] = useState('');
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [bankNameInput, setBankNameInput] = useState('');
  const [CustomerAddress, setCustomerAddress] = useState(null);
  const [contractBankName, setContractBankName] = useState('');
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);

  const contractAbi = abi?.abi;

  const contractAddress = '0xC8ba6Ab91d5ea9Ac37c3a48C77Dc52D3134A4f8F';

  const OpenWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log(account);
      } else {
        window.alert('Install a Metamask wallet to use our Bank');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBankName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signerD = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signerD
        );
        let bankName = await bankContract.bankName();
        bankName = utils.parseBytes32String(bankName);
        setContractBankName(bankName.toString());
      } else {
        console.log("Could't find Ethereum. Please install a Metamask account");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const CreateBankName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );
        const txn = await bankContract.setBankName(
          utils.formatBytes32String(bankNameInput)
        );
        console.log('Setting Bank Name');
        await txn.wait();
        console.log('Bank Name changed', txn.hash);
        getBankName();
      } else {
        console.log(
          'Did not find an Ethereum account, Please install metamask to proceed'
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBankOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let owner = await bankContract.bankOwner();
        setBankOwnerAddress(owner);
        console.log(owner);

        const [account] = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        console.log(account);
        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsBankOwner(true);
        }
      } else {
        console.log(
          'Did not find an Ethereum account, Please install metamask to proceed'
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let balance = await bankContract.getCustomerBalance();
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log('Retrived Balance', balance);
      } else {
        console.log(
          'Did not find an Ethereum account, Please install metamask to proceed'
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const depositMoneyFunction = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const txn = await bankContract.depositMoney({
          value: ethers.utils.parseEther(deposit),
        });

        console.log('Depositing money');

        await txn.wait();

        console.log('Money deposited', txn.hash);

        customerBalanceHandler();
      } else {
        console.log(
          'Did not find an Ethereum account, Please install metamask to proceed'
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withDrawMoneyFunction = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let myAddress = await signer.getAddress();
        console.log('my address', myAddress);
        const txn = await bankContract.withDrawMoney(
          myAddress,
          ethers.utils.parseEther(withdraw)
        );
        txn.wait();
        console.log('money withdraw', txn);
        customerBalanceHandler();
      } else {
        console.log(
          'Did not find an Ethereum account, Please install metamask to proceed'
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    OpenWallet();
    getBankName();
    getBankOwnerHandler();
    customerBalanceHandler();
  }, [isWalletConnected, customerTotalBalance]);

  return (
    <Container>
      <Head>Bank Contract Project</Head>
      <Wrapper>
        {contractBankName === '' && isBankOwner ? (
          <Text>Please set up your Bank Name</Text>
        ) : (
          <Text>{contractBankName}</Text>
        )}
        <InputHolder>
          <InputHold>
            <Input
              placeholder="0.00004 ETH"
              type="number"
              value={deposit}
              onChange={(e) => {
                setDeposit(e.target.value);
              }}
            />
            <Button
              onClick={() => {
                // console.log(deposit);
                depositMoneyFunction();
              }}
            >
              Deposit
            </Button>
          </InputHold>
          <InputHold>
            <Input
              placeholder="9.005 ETH"
              type="number"
              value={withdraw}
              onChange={(e) => {
                setWithdraw(e.target.value);
              }}
            />
            <Button
              onClick={() => {
                // console.log(withdraw);
                withDrawMoneyFunction();
              }}
            >
              Withdraw
            </Button>
          </InputHold>{' '}
          <BalanceText>
            <Customer>Customer's Balance:</Customer>
            <Amount> {customerTotalBalance}</Amount>
          </BalanceText>
        </InputHolder>
        <CustomerAddressStyle>
          <MyAddress>
            Your Address:<span> {CustomerAddress}</span>
          </MyAddress>
          <MyAddress>
            Bank Address:<span> {bankOwnerAddress}</span>
          </MyAddress>
        </CustomerAddressStyle>
        {isWalletConnected ? (
          <ConnectButton>Wallet Connected</ConnectButton>
        ) : (
          <ConnectButton onClick={OpenWallet}>Connect Wallet</ConnectButton>
        )}
        {isBankOwner ? (
          <InputHolder1>
            <InputHold>
              <Input
                placeholder="Please input your Bank Name"
                type="text"
                value={bankNameInput}
                onChange={(e) => {
                  setBankNameInput(e.target.value);
                }}
              />
              <Button
                onClick={() => {
                  console.log(bankNameInput);
                  CreateBankName();
                }}
              >
                Update Bank Name
              </Button>
            </InputHold>
          </InputHolder1>
        ) : null}
      </Wrapper>
    </Container>
  );
};

export default HomeScreen;

const Head = styled.div`
  margin-bottom: 50px;
  text-transform: uppercase;
  font-size: 30px;
  font-weight: 600;
  font-family: algerian;
  color: crimson;
  text-align: center;

`;
const ConnectButton = styled.div`
  padding: 8px 14px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 20px;
  background: crimson;
  margin-bottom: 30px;
  transition: all 350ms;
  :hover {
    transform: scale(1.02);
  }
`;

const MyAddress = styled.div`
  width: 100%;
  font-weight: 600;
  margin: 15px 0;
  display: flex;
  flex-wrap: wrap;
  span {
    display: flex;
    text-align: left;
    flex-wrap: wrap;
    font-weight: 600;
    color: red;
    margin-left: 4px;
    align-items: center;
    font-size: 17px;
  }
 
`;
const CustomerAddressStyle = styled.div`
  width: 520px;
  margin-top: 10px;
 
`;
const Amount = styled.div`
  color: crimson;
  margin-left: 5px;
  font-weight: 600;
`;
const Customer = styled.div`
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
`;
const BalanceText = styled.div`
  display: flex;
  width: 95%;
  margin-top: 10px;
`;
const Button = styled.div`
  width: 25%;
  height: 100%;
  background-color: red;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  color: white;
  font-weight: 600;
  justify-content: center;
  align-items: center;
  transition: all 350ms;
  :hover {
    transform: scale(1.02);
  }
`;
const Input = styled.input`
  padding: 5px;
  width: 70%;
  height: 90%;
  border: none;
  outline: none;
  /* background: lightgray; */
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  ::placeholder {
  }
`;
const InputHold = styled.div`
  display: flex;
  width: 95%;
  background-color: white;
  height: 45px;
  align-items: center;
  margin: 15px 0;
`;
const InputHolder1 = styled.div`
  width: 550px;
  height: 100px;
  border: 2px solid gray;
  justify-content: center;
  align-items: center;
 

  display: flex;
  flex-direction: column;
`;
const InputHolder = styled.div`
  width: 550px;
  height: 230px;
  border: 2px solid gray;
  justify-content: center;
  align-items: center;

  display: flex;
  flex-direction: column;
 
`;
const Text = styled.div`
  font-size: 19px;
  font-weight: 700;
  margin-bottom: 20px;
  text-transform: uppercase;
  text-align: center;
  color: crimson;
 
`;
const Wrapper = styled.div`
  width: 87%;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: #020c1b;
`;
