import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("ToDo", function () {

  // 1. Should be possible create tasks
  it("Should be possible to create tasks", async function () {
    const instance = await ethers.deployContract("ToDo");

    const tx = await instance.createTask("First task");
    await tx.wait();

    const tasks = await instance.getTasks(false, false);

    expect(tasks.length).to.equal(1);
    expect(tasks[0].taskName).to.equal("First task");
    expect(tasks[0].taskStatus).to.equal(false);
  });

  // 2. Should be possible return tasks
  it("Should be possible return all tasks available", async function () {
    const instance = await ethers.deployContract("ToDo");

    // Create 3 tasks
    const tx1 = await instance.createTask("First task");
    await tx1.wait();
    const tx2 = await instance.createTask("Second task");
    await tx2.wait();
    const tx3 = await instance.createTask("Third task");
    await tx3.wait();

    const tasks = await instance.getTasks(false, false);

    expect(tasks.length).to.equal(3);
    expect(tasks[0].taskName).to.equal("First task");
    expect(tasks[0].taskStatus).to.equal(false);
    expect(tasks[1].taskName).to.equal("Second task");
    expect(tasks[1].taskStatus).to.equal(false);
    expect(tasks[2].taskName).to.equal("Third task");
    expect(tasks[2].taskStatus).to.equal(false);
  })

  // 3. Shoul be possible delete selected tasks
  it("Should be possible delete selected tasks", async function () {
    
    const instance = await ethers.deployContract("ToDo");

    // Create 3 tasks
    const tx1 = await instance.createTask("First task");
    await tx1.wait();
    const tx2 = await instance.createTask("Second task");
    await tx2.wait();
    const tx3 = await instance.createTask("Third task");
    await tx3.wait();

    const tasks = await instance.getTasks(false, false);

    const deleteTask = await instance.deleteTask(tasks[1].taskId);
    deleteTask.wait();

    const newTasks = await instance.getTasks(false, false);

    expect(newTasks.length).to.equal(2);
  })
});
