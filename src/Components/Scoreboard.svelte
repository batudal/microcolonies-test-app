<script>
  import { ethers } from "ethers";
  import { addr } from "../Stores/Addresses";
  import Line from "./Line.svelte";
  import {
    userConnected,
    userAddress,
    networkProvider,
    networkSigner,
  } from "../Stores/Network";
  import {
    abiFunghi,
    abiFeromon,
    abiWorker,
    abiSoldier,
    abiMale,
    abiPrincess,
    abiQueen,
    abiLarva,
  } from "../Stores/ABIs";

  export let type;
  let scoreboard = [
    {
      address: "0xbC1f51b74Ad7754839a1fCB4a86a3E75A6E1F544",
      title: "hakan: ",
      value: "",
    },
    {
      address: "0xCa953b66E2372714C2DCF13d0970aBe1077D521D",
      title: "tolunay: ",
      value: "",
    },
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
      address: "0xb9Eb8B4CbdaDBf0eD7a3E65b10F8A31B4a7671eF",
      title: "ege: ",
      value: "",
    },
    {
      address: "0xC370b50eC6101781ed1f1690A00BF91cd27D77c4",
      title: "zeynep: ",
      value: "",
    },
    {
      address: "0x187549F02D96d94945f2c4Dd206cF58AEed8EBAE",
      title: "batu: ",
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
    }
  };

  const getFunghiBalances = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      scoreboard[i].value = await getFunghiBalance(scoreboard[i].address);
    }
  };
  const getFunghiBalance = async (user) => {
    const funghiContract = new ethers.Contract(
      addr.funghi,
      abiFunghi,
      $networkProvider
    );
    const userBalance = ethers.utils.formatEther(
      await funghiContract.balanceOf(user)
    );
    return userBalance;
  };
  const getFeromonBalances = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      scoreboard[i].value = await getFeromonBalance(scoreboard[i].address);
    }
  };
  const getFeromonBalance = async (user) => {
    const feromonContract = new ethers.Contract(
      addr.feromon,
      abiFeromon,
      $networkProvider
    );
    const userBalance = ethers.utils.formatEther(
      await feromonContract.balanceOf(user)
    );
    return userBalance;
  };
  const getPopulations = async () => {
    for (let i = 0; i < scoreboard.length; i++) {
      scoreboard[i].value = await getPopulation(scoreboard[i].address);
    }
  };
  const getPopulation = async (user) => {
    let balance = 0;
    const workerContract = new ethers.Contract(
      addr.worker,
      abiWorker,
      $networkProvider
    );
    const soldierContract = new ethers.Contract(
      addr.soldier,
      abiSoldier,
      $networkProvider
    );
    const queenContract = new ethers.Contract(
      addr.queen,
      abiQueen,
      $networkProvider
    );
    const larvaContract = new ethers.Contract(
      addr.larva,
      abiLarva,
      $networkProvider
    );
    const maleContract = new ethers.Contract(
      addr.male,
      abiMale,
      $networkProvider
    );
    const princessContract = new ethers.Contract(
      addr.princess,
      abiPrincess,
      $networkProvider
    );
    balance += (await workerContract.getWorkers(user)).length;
    balance += (await soldierContract.getSoldiers(user)).length;
    balance += (await queenContract.getQueens(user)).length;
    balance += (await larvaContract.getLarvae(user)).length;
    balance += (await maleContract.getMales(user)).length;
    balance += (await princessContract.getPrincesses(user)).length;
    return balance;
  };
</script>

<div class="header">
  <h3>{type.toUpperCase()} SCOREBOARD</h3>
</div>
<div style="height:8px" />
<main class="card">
  {#each scoreboard as user}
    <Line title={user.title} value={user.value} />
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
