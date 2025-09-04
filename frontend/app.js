// get contract address and ABI
const contractAddress = "0x3f4e98c1650b2FaEA02F87fD407b2E264a8f9091";
const contractABI = "...";

document.addEventListener("DOMContentLoaded", () => {
  // get references of html elements
  // buttons and text
  const connectWalletButton = document.getElementById("connectWalletButton");
  const walletAddressText = document.getElementById("walletAddress");

  let signer;
  let todoContract;

  // add listener to event at button
  connectWalletButton.addEventListener("click", async () => {
    // check if wallet extension (Metamask) is installed
    if (typeof window.ethereum !== "undefined") {
      try {
        // create a provider to connect with blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // request accounts to Metamask
        // pop of Metamask open
        await ethereum.request({ method: "eth_requestAccounts" });

        // get the signer, account that will sign the transactions
        signer = provider.getSigner();

        // if connection was a success, shows the address of the first account
        const account = await signer.getAddress();
        walletAddressText.textContent = `Wallet connected: ${account}`;
        console.log("Wallet connected:", account);

        // create the instance of the contract
        todoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
      } catch (error) {
        // Handles errors if the user rejects the connection
        console.error("Error connecting wallets", error);
        walletAddressText.textContent = "Connection error.";
      }
    } else {
      // If Metamask was not installed, informs user
      walletAddressText.textContent = "Please install Metamask to continue";
      console.log("Metamask not installed");
    }
  });
});
