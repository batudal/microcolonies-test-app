<script>
  import { ethers } from "ethers";
  import { allMinted } from "../../Stores/States";
  import Line from "../UI/Line.svelte";
  import { userConnected, userAddress, networkProvider, networkSigner } from "../../Stores/Network";
  import {
    abiFunghi,
    abiFeromon,
    abiWorker,
    abiSoldier,
    abiMale,
    abiPrincess,
    abiQueen,
    abiLarva,
  } from "../../Stores/ABIs";

  export let type;
  export let addr;

  $: console.log("type: ", type);

  let scoreboard = [
    {
      address: "0x6bF075861cC6c478baF22bB0C71179fF5F830cBC",
      title: "umut: ",
      value: "",
    },
    {
      address: "0xFC1EaD6E63D3C744E5290ca4fb96F6519eAe8bb1",
      title: "suleyman: ",
      value: "",
    },
    {
      address: "0xfB1C2FF46962B452C1731d44F0789bFb3607e63f",
      title: "batu: ",
      value: "",
    },
    {
      address: "0x187549F02D96d94945f2c4Dd206cF58AEed8EBAE",
      title: "zeynep: ",
      value: "",
    },
    {
      address: "0x47124988aED21c3fB3357e8412fb7191Ee5DF3f1",
      title: "nuriye: ",
      value: "",
    },
  ];
  setInterval(async () => {
    await fetchData();
  }, 10000);
  $: $userConnected ? fetchData() : "";

  const fetchData = async () => {
    if (type == "funghi") {
      await getFunghiBalances();
    } else if (type == "feromon") {
      await getFeromonBalances();
    } else if (type == "population") {
      await getPopulations();
    } else if (type == "queen population") {
      await getQueenPopulations();
    } else if (type == "larva population") {
      await getLarvaPopulations();
    } else if (type == "worker population") {
      await getWorkerPopulations();
    } else if (type == "soldier population") {
      await getSoldierPopulations();
    } else if (type == "male population") {
      await getMalePopulations();
    } else if (type == "princess population") {
      await getPrincessPopulations();
    }
  };
  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const getFunghiBalances = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      await sleep(300);
      scoreboard[i].value = await getFunghiBalance(scoreboard[i].address);
    }
    scoreboard.sort((a, b) => b.value - a.value);
  };
  const getFunghiBalance = async (user) => {
    const funghiContract = new ethers.Contract(addr.contractFunghi, abiFunghi, $networkProvider);
    const userBalance = ethers.utils.formatEther(await funghiContract.balanceOf(user));
    return userBalance;
  };
  const getFeromonBalances = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      await sleep(300);
      scoreboard[i].value = await getFeromonBalance(scoreboard[i].address);
    }
    scoreboard.sort((a, b) => b.value - a.value);
  };
  const getFeromonBalance = async (user) => {
    const feromonContract = new ethers.Contract(addr.contractFeromon, abiFeromon, $networkProvider);
    const userBalance = ethers.utils.formatEther(await feromonContract.balanceOf(user));
    return userBalance;
  };
  const getPopulations = async () => {
    let zeroPopulation = false;
    for (let i = 0; i < scoreboard.length; i++) {
      await sleep(300);
      scoreboard[i].value = await getPopulation(scoreboard[i].address);
      if (scoreboard[i].value == 0) {
        zeroPopulation = true;
      }
    }
    scoreboard.sort((a, b) => b.value - a.value);
    allMinted.set(!zeroPopulation);
  };
  const getPopulation = async (user) => {
    let balance = 0;
    balance += await getWorkerPopulation(user);
    balance += await getSoldierPopulation(user);
    balance += await getQueenPopulation(user);
    // balance += await getLarvaPopulation(user);
    balance += await getMalePopulation(user);
    balance += await getPrincessPopulation(user);
    return balance;
  };
  const getQueenPopulations = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      await sleep(100);
      scoreboard[i].value = await getQueenPopulation(scoreboard[i].address);
    }
    scoreboard.sort((a, b) => b.value - a.value);
  };
  const getLarvaPopulations = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      await sleep(100);
      scoreboard[i].value = await getLarvaPopulation(scoreboard[i].address);
    }
    scoreboard.sort((a, b) => b.value - a.value);
  };
  const getWorkerPopulations = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      await sleep(100);
      scoreboard[i].value = await getWorkerPopulation(scoreboard[i].address);
    }
    scoreboard.sort((a, b) => b.value - a.value);
  };
  const getSoldierPopulations = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      await sleep(100);
      scoreboard[i].value = await getSoldierPopulation(scoreboard[i].address);
    }
    scoreboard.sort((a, b) => b.value - a.value);
  };
  const getMalePopulations = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      await sleep(100);
      scoreboard[i].value = await getMalePopulation(scoreboard[i].address);
    }
    scoreboard.sort((a, b) => b.value - a.value);
  };
  const getPrincessPopulations = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      await sleep(100);
      scoreboard[i].value = await getPrincessPopulation(scoreboard[i].address);
    }
    scoreboard.sort((a, b) => b.value - a.value);
  };
  const getLarvaPopulation = async (user) => {
    const larvaContract = new ethers.Contract(addr.contractLarva, abiLarva, $networkProvider);
    return (await larvaContract.getLarvae(user)).length;
  };
  const getQueenPopulation = async (user) => {
    const queenContract = new ethers.Contract(addr.contractQueen, abiQueen, $networkProvider);
    return (await queenContract.getQueens(user)).length;
  };
  const getWorkerPopulation = async (user) => {
    const workerContract = new ethers.Contract(addr.contractWorker, abiWorker, $networkProvider);
    return (await workerContract.getWorkers(user)).length;
  };
  const getSoldierPopulation = async (user) => {
    const soldierContract = new ethers.Contract(addr.contractSoldier, abiSoldier, $networkProvider);
    return (await soldierContract.getSoldiers(user)).length;
  };
  const getMalePopulation = async (user) => {
    const maleContract = new ethers.Contract(addr.contractMale, abiMale, $networkProvider);
    return (await maleContract.getMales(user)).length;
  };
  const getPrincessPopulation = async (user) => {
    const princessContract = new ethers.Contract(addr.contractPrincess, abiPrincess, $networkProvider);
    return (await princessContract.getPrincesses(user)).length;
  };
</script>

<div style="height:24px" />
<div class="header">
  <h3>
    {type.toUpperCase()} SCOREBOARD
  </h3>
</div>
<div style="height:8px" />
<main class="card">
  {#each scoreboard as user, index}
    <Line title={user.title} value={user.value} winner={index == 0} />
  {/each}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    max-width: 320px;
  }
</style>
