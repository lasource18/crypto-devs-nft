 const { ethers } = require('hardhat')
require("dotenv").config({ path: ".env" })
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require('../constants')

async function main() {
  // address of the whitelist contract
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL

  const cryptoDevsContract = await ethers.getContractFactory('CryptoDevs')

  // here we deploy the contract
  // maximun number of whitelisted addresses
  const deployedcryptoDevsContract = await cryptoDevsContract.deploy(metadataURL, whitelistContract)

  await deployedcryptoDevsContract.deployed()

  console.log("Crypto Devs Contract Address:", deployedcryptoDevsContract.address)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })