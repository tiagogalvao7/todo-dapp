// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
pragma experimental ABIEncoderV2;

contract ToDo {
    struct Task {
        uint256 taskId;
        string taskName;
        bool taskStatus;
        bool isDeleted;
        address owner;
    }

    // returns only essential data for functio getTasks()
    struct TaskView {
        uint256 taskId;
        string taskName;
        bool taskStatus;
    }

    address owner;
    mapping(address => Task[]) tasks;

    // define events
    event TaskCreated(
        address indexed user,
        uint256 taskId,
        string taskName,
        bool taskStatus
    );
    event TaskToggled(address indexed user, uint256 taskId, bool taskStatus);
    event TaskDeleted(address indexed user, uint256 taskId);

    constructor() {
        owner = msg.sender;
    }

    function createTask(string memory _taskName) external {
        uint256 taskId = tasks[msg.sender].length;
        tasks[msg.sender].push(Task(taskId, _taskName, false, false, msg.sender));

        emit TaskCreated(msg.sender, taskId, _taskName, false);
    }

    function deleteTask(uint256 _taskId) external {
        require(_taskId<tasks[msg.sender].length, "This task does not exist");

        tasks[msg.sender][_taskId].isDeleted = true;
        emit TaskDeleted(msg.sender, _taskId);
    }

    function toggleTask(uint256 _taskId) external {
        require(
            _taskId < tasks[msg.sender].length,
            "This task does not exist, insert a valid Id"
        );
        tasks[msg.sender][_taskId].taskStatus = !tasks[msg.sender][_taskId]
            .taskStatus;
        bool newStatus = tasks[msg.sender][_taskId].taskStatus;

        emit TaskToggled(msg.sender, _taskId, newStatus);
    }

    function getTasks(
        bool filterByStatus,
        bool status
    ) public view returns (TaskView[] memory) {
        // get all tasks for that user
        Task[] storage userTasks = tasks[msg.sender];
        uint taskCount = 0;

        // count returned tasks
        for (uint i = 0; i < userTasks.length; i++) {
            if ((!filterByStatus || userTasks[i].taskStatus == status) && userTasks[i].isDeleted == false) {
                taskCount++;
            }
        }

        // temporary array to store tasks to return
        TaskView[] memory result = new TaskView[](taskCount);
        uint index = 0;

        for (uint i = 0; i < userTasks.length; i++) {
            if ((!filterByStatus || userTasks[i].taskStatus == status) && userTasks[i].isDeleted == false) {
                Task storage t = userTasks[i];
                result[index++] = TaskView(t.taskId, t.taskName, t.taskStatus);
            }
        }

        return result;
    }
}

