// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;
pragma experimental ABIEncoderV2;

contract ToDo {
    struct Task {
        uint256 taskId;
        string taskName;
        string taskDescription;
        bool taskStatus;
        address owner;
    }

    // returns only essential data for function getTasks()
    struct TaskView {
        uint256 taskId;
        string taskName;
        string taskDescription;
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

    constructor() {
        owner = msg.sender;
    }

    function createTask(
        string memory _taskName,
        string memory _taskDescription
    ) external {
        uint256 taskId = tasks[msg.sender].length;
        tasks[msg.sender].push(
            Task(taskId, _taskName, _taskDescription, false, msg.sender)
        );

        emit TaskCreated(msg.sender, taskId, _taskName, false);
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
            if (!filterByStatus || userTasks[i].taskStatus == status) {
                taskCount++;
            }
        }

        // temporary array to store tasks to return
        TaskView[] memory result = new TaskView[](taskCount);
        uint index = 0;

        for (uint i = 0; i < userTasks.length; i++) {
            if (!filterByStatus || userTasks[i].taskStatus == status) {
                Task storage t = userTasks[i];
                result[index++] = TaskView(
                    t.taskId,
                    t.taskName,
                    t.taskDescription,
                    t.taskStatus
                );
            }
        }

        return result;
    }
}
