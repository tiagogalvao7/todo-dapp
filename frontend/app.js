// get contract address and ABI
const contractAddress = "0xC67218EE32DEB14100BF2C8814dc5FD65B2BB4a7";
const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_taskName",
        type: "string",
      },
    ],
    name: "createTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "taskId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "taskName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "taskStatus",
        type: "bool",
      },
    ],
    name: "TaskCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "taskId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "taskStatus",
        type: "bool",
      },
    ],
    name: "TaskToggled",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_taskId",
        type: "uint256",
      },
    ],
    name: "toggleTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "filterByStatus",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "status",
        type: "bool",
      },
    ],
    name: "getTasks",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "taskId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "taskName",
            type: "string",
          },
          {
            internalType: "bool",
            name: "taskStatus",
            type: "bool",
          },
        ],
        internalType: "struct ToDo.TaskView[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// está apenas a renderizar as tasks quando dou add de uma task nova
// mensagem de wallet connected tem que estar centrada
// tem que renderizar primeiro as tasks que estão disponiveis
// e exclui a mensagem se tiver tasks

document.addEventListener("DOMContentLoaded", () => {
  // get references of html elements
  // buttons and text
  const connectWalletButton = document.getElementById("connectWalletButton");
  const walletAddressText = document.getElementById("walletAddress");

  const addTaskButton = document.getElementById("addTaskButton");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const noTasksMessage = document.getElementById("noTasksMessage");

  let signer;
  let todoContract;

  // add listener to event at button
  // ======= Connect Wallet =======
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

  // get tasks from smart contract
  function renderTasks(tasks) {
    // 1️⃣ Limpa a lista antes de redesenhar
    taskList.innerHTML = "";

    // 2️⃣ Mostra ou esconde a mensagem de "no tasks"
    if (tasks.length === 0) {
      noTasksMessage.classList.remove("hidden");
      return; // nada mais a fazer
    } else {
      noTasksMessage.classList.add("hidden");
    }

    // 3️⃣ Preenche a lista dinamicamente
    tasks.forEach((task) => {
      // cria <li> principal
      const li = document.createElement("li");
      li.className = "task-item";

      // cria div interna para checkbox + texto
      const div = document.createElement("div");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.taskStatus;

      const span = document.createElement("span");
      span.className = "task-text";
      span.textContent = task.taskName;

      div.appendChild(checkbox);
      div.appendChild(span);

      // cria botão de delete
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-button";
      deleteBtn.textContent = "X";

      // adiciona div e botão ao <li>
      li.appendChild(div);
      li.appendChild(deleteBtn);

      // adiciona o <li> à lista no HTML
      taskList.appendChild(li);

      // Opcional: adicionar listeners para toggle/delete aqui
      // checkbox.addEventListener("change", () => toggleTask(task.taskId));
      // deleteBtn.addEventListener("click", () => deleteTask(task.taskId));
    });
  }

  // ======= Add new task to list =======
  addTaskButton.addEventListener("click", async () => {
    try {
      const addTaskText = taskInput.value.trim();
      if (!addTaskText) return;

      const tx = await todoContract.createTask(addTaskText);
      await tx.wait();

      const tasks = await todoContract.getTasks(false, false);
      renderTasks(tasks); // função que redesenha a lista
    } catch (err) {
      console.error("Error adding task:", err);
    }
  });
});
