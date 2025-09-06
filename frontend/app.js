// get contract address and ABI
const contractAddress = "0xc1766216C5db017676A24DC5FA63FCdBa74a5827";
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
    inputs: [
      {
        internalType: "uint256",
        name: "_taskId",
        type: "uint256",
      },
    ],
    name: "deleteTask",
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
    ],
    name: "TaskDeleted",
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

        // load tasks after connect wallet
        const rawTasks = await todoContract.getTasks(false, false);
        const tasks = Array.from(rawTasks); // or [...rawTasks]

        console.log("Tasks recebidas do contrato:", tasks);
        renderTasks(tasks);
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

  // ======= Get tasks from Smart Contract =======
  function renderTasks(tasks) {
    // 1️⃣ Limpa a lista antes de redesenhar
    taskList.innerHTML = "";

    // 2️⃣ Show or hide tasks messages
    if (!tasks || tasks.length === 0) {
      console.log("DEBUG → Nenhuma task detectada");
      noTasksMessage.classList.remove("hidden");
      return;
    }

    noTasksMessage.classList.add("hidden");

    // 3️⃣ Fill list dynamically
    tasks.forEach((task) => {
      // create main <li>
      const li = document.createElement("li");
      li.className = "task-item";

      // create div for text
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

      // create delete button
      const deleteTaskButton = document.createElement("button");
      deleteTaskButton.className = "delete-button";
      deleteTaskButton.textContent = "X";

      // add div and button to <li>
      li.appendChild(div);
      li.appendChild(deleteTaskButton);

      // add <li> to HTML list
      taskList.appendChild(li);

      // ======= Delete tasks from list =======
      deleteTaskButton.addEventListener("click", async () => {
        // call deleteTask function()
        const tx = await todoContract.deleteTask(task.taskId);
        // wait for transaction
        await tx.wait();

        // get updated tasks
        const tasks = await todoContract.getTasks(false, false);
        renderTasks(tasks);
      });
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
      renderTasks(tasks); // put tasks again in the list
      taskInput.value = ""; // clean input
    } catch (err) {
      console.error("Error adding task:", err);
    }
  });
});
