//  imports

import { ethers } from "./ethers.js"
import { abi, contractAddress } from "./constants.js"

//  buttons
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

//  eventlisteners
connectButton.addEventListener("click", connect)
fundButton.addEventListener("click", fund)
balanceButton.addEventListener("click", getBalance)
withdrawButton.addEventListener("click", withdraw)

//  functions
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Connecting...")

    await window.ethereum.request({ method: "eth_requestAccounts" })
    document.getElementById("connectButton").innerHTML = "Connected!"

    console.log("Connected!")
  } else {
    document.getElementById("connectButton").innerHTML =
      "Please install Metamask!"
  }
}

async function fund(ethAmount) {
  ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}ETH.`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTxMine(txResponse, provider)
      console.log("DONE")
    } catch (e) {
      console.log(e)
    }
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTxMine(transactionResponse, provider)
      // await transactionResponse.wait(1)
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

function listenForTxMine(txResponse, provider) {
  console.log(`Mining ${txResponse.hash}...`)
  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (txReceipt) => {
      console.log(`Complete with ${txReceipt.confirmations} confirmations.`)
      resolve()
    })
  })
}
