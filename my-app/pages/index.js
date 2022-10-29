import { Contract, providers, utils } from "ethers"
import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import Web3Modal from 'web3modal'
import { abi, NFT_CONTRACT_ADDRESS } from '../constants'
import styles from '../styles/Home.module.css'

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false)
  // presaleStarted keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState(false)
  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState(false)
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false)
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false)
  // okenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0")
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef()

  /**
  * presaleMint: Mint an NFT during the presale
  */
 const presaleMint = async () => {
  try {
    // We need a signer here since this is a 'write' transaction
    const signer = await getProviderOrSigner(true)
    // Create a new instance of the Contract with a Signer, which allow update methods
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
    // call the presaleMint from the contract, only whitelisted addresses would be able to mint
    const tx = await nftContract.presaleMint({
      // value signifies the cost of one crypto dev which is "0.01" eth.
      // We are parsing `0.01` string to ether using the utils lib from ether.js
      value: utils.parseEther("0.01")
    })
    setLoading(true)
    // wait for the transaction to get mined
    await tx.wait()
    setLoading(false)
    window.alert('You successfully minted a Cryto Dev!')
  } catch(e) {
    console.log(e)
  }
 }

 /**
  * publicMint: Mint an NFT after the presale
  */
 const publicMint = async () => {
  try {
    // We need a signer here since this is a 'write' transaction
    const signer = await getProviderOrSigner(true)
    // Create a new instance of the Contract with a Signer, which allow update methods
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
    // call the presaleMint from the contract, only whitelisted addresses would be able to mint
    const tx = await nftContract.mint({
      // value signifies the cost of one crypto dev which is "0.01" eth.
      // We are parsing `0.01` string to ether using the utils lib from ether.js
      value: utils.parseEther("0.01")
    })
    setLoading(true)
    // wait for the transaction to get mined
    await tx.wait()
    setLoading(false)
    window.alert('You successfully minted a Cryto Dev!')
  } catch(e) {
    console.error(e)
  }
 }

 /**
  * connectWallet: Connects the MetaMask wallet
  */
 const connectWallet = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // When used for the first time, it prompts the user to connect theirwallet
    await getProviderOrSigner()
    setWalletConnected(true)
  } catch(e) {
    console.error(e)
  }
 }

 /**
  * startPresale: starts the presale for the NFT Collection
  */
 const startPresale = async () => {
  try {
    // We need a Signer here since this is a 'write' transaction
    const signer = await getProviderOrSigner(true)
    // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
      // call the startPresale from the contract
      const tx = await nftContract.startPresale();
      setLoading(true)
      // wait for the transaction to get mined
      await tx.wait()
      setLoading(false)
      // set the presale
      await checkIfPresaleStarted()
  } catch(e) {
    console.error(e)
  }
 }
 
 /**
  * checkIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
  * variable in the contract
  */
 const checkIfPresaleStarted = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
    // No need for the Signer here, as we are only reading state from the blockchain
    const provider = await getProviderOrSigner()
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
    // call the presaleStarted from the contract
    const _presaleStarted = await nftContract.presaleStarted()
    if(!_presaleStarted)
      await getOwner()
    
    setPresaleStarted(_presaleStarted)
    return _presaleStarted
  } catch(e) {
    console.error(e)
    return false
  }
 }
 /**
  * checkIfPresaleEnded: checks if the presale has ended by quering the `presaleEnded`
  * variable in the contract
  */
 const checkIfPresaleEnded = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask 
    // No need for the Signer here, as we are only reading state from the blockchain
    const provider = await getProviderOrSigner()
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
    // call the presaleStarted from the contract
    const _presaleEnded = await nftContract.presaleEnded()
    // presaleEnded is a Big Number, so we are using the lt (less than function) instead of '<'
    // Date.now() / 1000 returns the current time in seconds
    // We check if the _presaleEnded timestamp is less than the current time
    const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000))

    if(hasEnded) {
      setPresaleEnded(true)
    } else {
      setPresaleEnded(false)
    }

    return hasEnded
  } catch(e) {
    console.error(e)
    return false
  }
 }

 /**
  * getOwner: calls the contract to retrieve the owner
  */
 const getOwner = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner()
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
      // call the owner function from the contract
      const _owner = await nftContract.owner()
      // We will get the signer now to extract the address at the currently connected MetaMask account
      const address = await signer.getAddress()

      if(address.toLowerCase() === _owner.toLowerCase())
        setIsOwner(true)
  } catch(e) {
    console.error(e.message)
  }
 }

 /**
  * getTokenIdsMinted: get the number of tokenIds that have been minted
  */
 const getTokenIdsMinted = async () => {
  try {
    // Get the provider from web3Modal, which in our case is MetaMask 
    // No need for the Signer here, as we are only reading state from the blockchain
    const provider = await getProviderOrSigner()
    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
    // call the tokenIds from the contracts
    const _tokenIds = await nftContract.tokenIds()
    // _tokenIds is a Big Number
    // we need to convert it to a string
    setTokenIdsMinted(_tokenIds.toString())
  } catch(e) {
    console.error(e.message)
  }
 }

   /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
    const getProviderOrSigner = async (needSigner = false) => {
      // connect to Metamask
      // since we store 'web3Modal' as a reference, we need to access the 'current' value to get access to the underlying object
      const provider = await web3ModalRef.current.connect()
      const web3Provider = new providers.Web3Provider(provider)
  
      // if user is not connected to the goerli network, let them know and throw an error
      const { chainId } = await web3Provider.getNetwork()
      if(chainId !== 5) {
        window.alert('Change to the Goerli network')
        throw new Error('Change to the Goerli network')
      }
  
      if(needSigner) {
        const signer = web3Provider.getSigner()
        return signer
      }
  
      return web3Provider
    }
  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, created a new instance of Web3Modal
    // and connect the MetaMask wallet
    if(!walletConnected) {
      // Assign theWeb3Modal class to the reference object by setting it's`current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false
      })
    }

    connectWallet()

    // Check if presale has started and ended
    const _presaleStarted = checkIfPresaleEnded()
    if(_presaleStarted)
      checkIfPresaleEnded()
    
      getTokenIdsMinted()

      // Set an interval which gets called every 5 seconds to check if presale has ended
      const presaleEndedInterval = setInterval(async () => {
        const _presaleStarted = await checkIfPresaleStarted()
        if(_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded()
          if(_presaleEnded)
            clearInterval(presaleEndedInterval)
        }
      }, 5 * 1000);

      // set an interval to get the number of tokenIds minted every 5 seconds
      setInterval(async () => {
        await getTokenIdsMinted()
      }, 5 * 1000);
  }, [walletConnected])

  /**
   * renderButton: Returns a button based on the state of the dapp
   */
  const renderButton = () => {
    // If wallet is not connected, returns a button allowing them to connect their wallet
    if(!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }

    // If we are currently waiting for soething, return a loading button
    if(loading) {
      return <button className={styles.button}>Loading...</button>
    }

    // If connected user is the owner, and presale hasn't started yet, allow them to start the presale
    if(isOwner && !presaleStarted) {
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale
        </button>
      )
    }

    // If connected user is not the owner but presale hasn't started yet, let them know
    if(!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>
            Presale hasn't started!
          </div>
        </div>
      )
    }

    // If presale started but hasn't ended yet, allow minting
    if(presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started! If your address is whiteListed, Mint a Crypto Dev 🥳
          </div>
          <button onClick={presaleMint} className={styles.button}>
            Presale Mint
          </button>
        </div>
      )
    }

    // If presale started and has ended, public mint can start
    if(presaleStarted && presaleEnded) {
      return (
        <button onClick={publicMint} className={styles.button}>
          Public Mint 🚀
        </button>
      )
    }
  }

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="NFT Collection" />
        <link rel="incon" href="/favicon.ico"/>
      </Head>
      <div className={styles.main}>
        <h1 className={styles.title}>Welcome to the Crypto Devs!</h1>
        <div className={styles.description}>
          It's an NFT collection for developers in Crypto
        </div>
        <div>
          {tokenIdsMinted}/20 have been minted
        </div>
        {renderButton()}
      </div>
      <div>
        <img className={styles.image} src="./cryptodevs/0.svg" />
      </div>

      <footer>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}


