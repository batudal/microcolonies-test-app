<script>
  import Line from "./Line.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import { allMinted } from "../Stores/States";
  import {
    userConnected,
    userAddress,
    networkProvider,
    networkSigner,
  } from "../Stores/Network";
  import { ethers } from "ethers";
  // import { addr } from "../Stores/Addresses";
  import {
    abiFunghi,
    abiFeromon,
    abiWorker,
    abiSoldier,
    abiMale,
    abiPrincess,
    abiQueen,
    abiLarva,
    abiANT,
    abiTournament,
  } from "../Stores/ABIs";

  export let addr;
  export let tournament;

  let funghiBalance = "N/A";
  let feromonBalance = "N/A";
  let workerBalance = "N/A";
  let soldierBalance = "N/A";
  let queenBalance = "N/A";
  let larvaBalance = "N/A";
  let maleBalance = "N/A";
  let princessBalance = "N/A";
  let totalPopulation = "N/A";
  let nestCapacity;
  let mateInput, mintInput;
  let claimableQueens = "N/A";
  let blocks = [];
  let blockResidents = [];
  let blockCapacities = [];
  let blockCumCapacities = [];
  let homelessWorkers;
  let underConstruction;
  let matingPrincesses = 0;
  let remainingConstruction;
  let princessMissions = [];
  let nickname = "";

  const fetchUserData = async () => {
    if ($userConnected) {
      const funghiContract = new ethers.Contract(
        addr.contractFunghi,
        abiFunghi,
        $networkProvider
      );
      funghiBalance = ethers.utils.formatEther(
        await funghiContract.balanceOf($userAddress)
      );
      const feromonContract = new ethers.Contract(
        addr.contractFeromon,
        abiFeromon,
        $networkProvider
      );
      feromonBalance = ethers.utils.formatEther(
        await feromonContract.balanceOf($userAddress)
      );
      const workerContract = new ethers.Contract(
        addr.contractWorker,
        abiWorker,
        $networkProvider
      );
      workerBalance = (await workerContract.getWorkers($userAddress)).length;
      homelessWorkers = (await workerContract.getUnHousedWorkers($userAddress))
        .length;
      const soldierContract = new ethers.Contract(
        addr.contractSoldier,
        abiSoldier,
        $networkProvider
      );
      soldierBalance = (await soldierContract.getSoldiers($userAddress)).length;
      const queenContract = new ethers.Contract(
        addr.contractQueen,
        abiQueen,
        $networkProvider
      );
      queenBalance = (await queenContract.getQueens($userAddress)).length;
      const larvaContract = new ethers.Contract(
        addr.contractLarva,
        abiLarva,
        $networkProvider
      );
      larvaBalance = (await larvaContract.getLarvae($userAddress)).length;
      const maleContract = new ethers.Contract(
        addr.contractMale,
        abiMale,
        $networkProvider
      );
      maleBalance = (await maleContract.getMales($userAddress)).length;
      const princessContract = new ethers.Contract(
        addr.contractPrincess,
        abiPrincess,
        $networkProvider
      );
      princessBalance = (await princessContract.getPrincesses($userAddress))
        .length;

      const antContract = new ethers.Contract(
        addr.contractAnt,
        abiANT,
        $networkSigner
      );

      totalPopulation = await antContract.getPopulation();
      nestCapacity = await antContract.playerToCapacity($userAddress);

      princessMissions = await princessContract.getMissions($userAddress);

      // claimableQueens = await princessContract.getClaimable($userAddress);
      // matingPrincesses = (
      //   await princessContract.getMatedPrincesses($userAddress)
      // ).length;
      // const buildingContract = new ethers.Contract(
      //   addr.buildingblock,
      //   abiBB,
      //   $networkProvider
      // );
      // blocks = await buildingContract.getBuildingBlocks($userAddress);
      // for (let i = 0; i < blocks.length; i++) {
      //   blockResidents[i] = parseInt(
      //     (await buildingContract.getWorkersHoused(blocks[i])).length
      //   );
      //   blockCapacities[i] = parseInt(
      //     await buildingContract.idToCapacity(blocks[i])
      //   );
      //   blockCumCapacities[i] = parseInt(
      //     await buildingContract.idToCumulativeCapacity(blocks[i])
      //   );
      // }
      // underConstruction = await buildingContract.underConstruction();
      // const now = parseInt(Date.now() / 1000);
      // const start = await buildingContract.idToConstructionTime(blocks[0]);
      // remainingConstruction = now - start;
    }
  };
  setInterval(() => {
    fetchUserData();
  }, 10000);
  $: $userConnected ? fetchUserData() : "";

  const mate = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.mateMalePrincess(mateInput);
  };
  const claimQueen = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.claimQueen(mateInput);
  };
  const houseWorkers = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.houseWorkers();
  };
  const merge = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.mergeBBs();
  };
  const claimBuilding = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.claimUpgradedBuilding();
  };
  const enterTournament = async () => {
    const tournamentContract = new ethers.Contract(
      tournament,
      abiTournament,
      $networkSigner
    );
    await tournamentContract.enterTournament("");
  };
</script>

<div class="container">
  <!-- <Scoreboard type="funghi" /> -->
  <div style="height:24px" />
  <!-- <Scoreboard type="queen population" />
  <div style="height:24px" />
  <Scoreboard type="larva population" />
  <div style="height:24px" /> -->
  <div class="header">
    <h3>GENESIS ROUND</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
    <Line title="Funghi" value={funghiBalance} />
    <Line title="Feromons" value={feromonBalance} />
    <Line
      title="Population / Capacity"
      value={`${totalPopulation}/${nestCapacity}`}
    />
    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      Welcome Fren. This game is alpha test mode. Feel free to mint some larvae
      and start multiplying.
    </p>
    <input
      type="text"
      placeholder="Nickname"
      style="margin-top:8px"
      bind:value={nickname}
    />
    <div class="buttons" style="margin-top:8px">
      <div class="button-small" on:click={enterTournament}>
        enter tournament
      </div>
      <div class="detail">-> unlimited for fast test</div>
    </div>
  </main>
  <div style="height:24px" />
  <div class="header">
    <h3>UTILITIES</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
    <div class="header">
      <h3>Mating</h3>
    </div>
    <Line title="Total males" value={maleBalance} />
    <Line title="Total princesses" value={princessBalance} />
    <Line title="Claimable queens" value={claimableQueens} />
    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      Burn a pair of male & princess to mate them. Mating takes 1 day and mints
      a Queen Ant.
    </p>
    <div class="buttons" style="margin-top:8px">
      <div
        class={`button-small ${
          (princessBalance - matingPrincesses &&
            maleBalance - matingPrincesses) > 0
            ? "green"
            : ""
        }`}
        on:click={mate}
      >
        mate pairs
      </div>
      <div class="detail">-> to create a queen</div>
    </div>
    <p class="detail">--------------------------------------------</p>

    {#each princessMissions as m, i}
      <div class="buttons" style="margin-top:8px">
        <p>Mission #{i + 1}</p>
        <div class={`button-small`}>claim</div>
      </div>
    {/each}
  </main>
  <div style="height:24px" />
</div>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    max-width: 320px;
  }
</style>
