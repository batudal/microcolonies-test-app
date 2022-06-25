<script>
  import Line from "./Line.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import {
    userConnected,
    userAddress,
    networkProvider,
    networkSigner,
  } from "../Stores/Network";
  import { ethers } from "ethers";
  import { addr } from "../Stores/Addresses";
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
    abiBB,
    abiFakeDollars,
  } from "../Stores/ABIs";

  const whitelist = [
    "0xbC1f51b74Ad7754839a1fCB4a86a3E75A6E1F544",
    "0xCa953b66E2372714C2DCF13d0970aBe1077D521D",
    "0x6bF075861cC6c478baF22bB0C71179fF5F830cBC",
    "0xFC1EaD6E63D3C744E5290ca4fb96F6519eAe8bb1",
    "0xb9Eb8B4CbdaDBf0eD7a3E65b10F8A31B4a7671eF",
    "0xC370b50eC6101781ed1f1690A00BF91cd27D77c4",
    "0x187549F02D96d94945f2c4Dd206cF58AEed8EBAE",
    "0x47124988aED21c3fB3357e8412fb7191Ee5DF3f1",
  ];
  const whitelistMembers = [
    "hakan:",
    "tolunay:",
    "umut:",
    "suleyman:",
    "ege:",
    "batu: ",
    "zeynep: ",
    "nuriye: ",
  ];
  let whitelistBalances = [];

  let funghiBalance = "N/A";
  let feromonBalance = "N/A";
  let workerBalance = "N/A";
  let soldierBalance = "N/A";
  let queenBalance = "N/A";
  let larvaBalance = "N/A";
  let maleBalance = "N/A";
  let princessBalance = "N/A";
  let totalPopulation = "N/A";
  let mateInput, mintInput;
  let claimableQueens = "N/A";
  let claimableMerged = "N/A";

  let blocks = [];
  let blockResidents = [];
  let blockCapacities = [];
  let blockCumCapacities = [];
  let homelessWorkers;
  let underConstruction;
  let matingPrincesses = 0;

  let fakeDollarsApproved;

  const fetchUserData = async () => {
    if ($userConnected) {
      const fakeDollarsContract = new ethers.Contract(
        addr.fakeDollars,
        abiFakeDollars,
        $networkProvider
      );
      const fakeDollarsAllowance = ethers.utils.formatEther(
        await fakeDollarsContract.allowance($userAddress, addr.larva)
      );
      fakeDollarsApproved = fakeDollarsAllowance >= 100;
      const funghiContract = new ethers.Contract(
        addr.funghi,
        abiFunghi,
        $networkProvider
      );
      funghiBalance = ethers.utils.formatEther(
        await funghiContract.balanceOf($userAddress)
      );
      const feromonContract = new ethers.Contract(
        addr.feromon,
        abiFeromon,
        $networkProvider
      );
      feromonBalance = ethers.utils.formatEther(
        await feromonContract.balanceOf($userAddress)
      );
      const workerContract = new ethers.Contract(
        addr.worker,
        abiWorker,
        $networkProvider
      );
      workerBalance = (await workerContract.getWorkers($userAddress)).length;
      homelessWorkers = (await workerContract.getUnHousedWorkers($userAddress))
        .length;
      const soldierContract = new ethers.Contract(
        addr.soldier,
        abiSoldier,
        $networkProvider
      );
      soldierBalance = (await soldierContract.getSoldiers($userAddress)).length;
      const queenContract = new ethers.Contract(
        addr.queen,
        abiQueen,
        $networkProvider
      );
      queenBalance = (await queenContract.getQueens($userAddress)).length;
      const larvaContract = new ethers.Contract(
        addr.larva,
        abiLarva,
        $networkProvider
      );
      larvaBalance = (await larvaContract.getLarvae($userAddress)).length;
      const maleContract = new ethers.Contract(
        addr.male,
        abiMale,
        $networkProvider
      );
      maleBalance = (await maleContract.getMales($userAddress)).length;
      const princessContract = new ethers.Contract(
        addr.princess,
        abiPrincess,
        $networkProvider
      );
      princessBalance = (await princessContract.getPrincesses($userAddress))
        .length;
      totalPopulation =
        workerBalance +
        soldierBalance +
        queenBalance +
        larvaBalance +
        maleBalance +
        princessBalance;
      claimableQueens = await princessContract.getClaimable($userAddress);
      matingPrincesses = (
        await princessContract.getMatedPrincesses($userAddress)
      ).length;
      const buildingContract = new ethers.Contract(
        addr.buildingblock,
        abiBB,
        $networkProvider
      );
      blocks = await buildingContract.getBuildingBlocks($userAddress);
      for (let i = 0; i < blocks.length; i++) {
        blockResidents[i] = parseInt(
          (await buildingContract.getWorkersHoused(blocks[i])).length
        );
        blockCapacities[i] = parseInt(
          await buildingContract.idToCapacity(blocks[i])
        );
        blockCumCapacities[i] = parseInt(
          await buildingContract.idToCumulativeCapacity(blocks[i])
        );
      }
      underConstruction = await buildingContract.underConstruction();
      //   await getFunghiBalances();
    }
  };
  setInterval(() => {
    fetchUserData();
  }, 10000);
  $: $userConnected ? fetchUserData() : "";

  const mate = async () => {
    const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
    await antContract.mateMalePrincess(mateInput);
  };
  const claimQueen = async () => {
    const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
    await antContract.claimQueen(mateInput);
  };
  const houseWorkers = async () => {
    const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
    await antContract.houseWorkers();
  };
  const merge = async () => {
    const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
    await antContract.mergeBBs();
  };
  const claimBuilding = async () => {
    const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
    await antContract.claimUpgradedBuilding();
  };

  const genesisMint = async () => {
    const larvaContract = new ethers.Contract(
      addr.larva,
      abiLarva,
      $networkSigner
    );
    await larvaContract.genesisMint(mintInput);
  };
</script>

<div class="container">
  <Scoreboard type="funghi" />
  <div style="height:24px" />
  <div class="header">
    <h3>GENESIS ROUND</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
    <Line title="Funghi" value={funghiBalance} />
    <Line title="Feromons" value={feromonBalance} />
    <Line title="Population" value={totalPopulation} />
    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      Welcome Fren. This game is alpha test mode. Feel free to mint some larvae
      and start multiplying.
    </p>
    <input
      type="text"
      placeholder="Amount of Larvae"
      style="margin-top:8px"
      bind:value={mintInput}
    />
    <div class="buttons" style="margin-top:8px">
      <div class="button-small" on:click={genesisMint}>genesis mint</div>
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
    <input
      type="text"
      placeholder="Amount of Ant Pairs / Queens"
      style="margin-top:8px"
      bind:value={mateInput}
    />
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
        mate pair
      </div>
      <div class="detail">-> to create a queen</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${claimableQueens > 0 ? "green" : ""}`}
        on:click={claimQueen}
      >
        claim queen
      </div>
      <div class="detail">-> and start producing</div>
    </div>
  </main>
  <div style="height:24px" />
  <main class="card">
    <div class="header">
      <h3>Building Blocks</h3>
    </div>
    {#each blocks as block, index}
      <Line
        title={index == 0 ? "Nest" : "Block #" + parseInt(block)}
        value={index == 0
          ? "Available " +
            blockResidents[index] +
            "/" +
            blockCumCapacities[index]
          : "+10 capacity"}
      />
    {/each}
    <p class="detail" style="margin-top:8px">
      --------------------------------------------
    </p>
    <p class="detail">
      Worker Ants need housing to hatch. 1 block houses 10 Worker Ants.
    </p>
    <div class="buttons" style="margin-top:8px">
      <div
        class={`button-small ${
          blockCapacities[0] > 0 && homelessWorkers > 0 ? "green" : ""
        }`}
        on:click={houseWorkers}
      >
        house workers
      </div>
      <div class="detail">-> to create space</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${
          blockCapacities[0] == 0 &&
          blockCapacities.length >= 2 &&
          !underConstruction
            ? "green"
            : ""
        }`}
        on:click={merge}
      >
        start merge
      </div>
      <div class="detail">-> to start construction</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${underConstruction ? "green" : ""}`}
        on:click={claimBuilding}
      >
        claim merged
      </div>
      <div class="detail">-> to finish construction</div>
    </div>
  </main>
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
