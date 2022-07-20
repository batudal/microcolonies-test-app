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
  // import { addr } from "../Stores/Addresses";
  import {
    abiWorker,
    abiSoldier,
    abiANT,
    abiFeromon,
    abiBB,
    abiLarva,
  } from "../Stores/ABIs";

  export let addr;

  let workerInput;
  let soldierInput;
  let availableWorkers = "N/A";
  let homelessWorkers = "N/A";
  let totalWorkers = "N/A";
  let totalSoldiers = "N/A";
  let availableSoldiers = "N/A";
  let zombieSoldiers = "N/A";
  let infectedSoldiers = "N/A";
  let claimableBB, claimableFunghi, claimableLarva;
  let feromonBalance;
  let workerMissions = [];
  let activeWorkerMissions = [];
  let soldierMissions = [];

  $: $userConnected ? fetchUserData() : "";
  $: occupiedWorkers = totalWorkers - availableWorkers;
  $: occupiedSoldiers = totalSoldiers - availableSoldiers - zombieSoldiers;

  const fetchUserData = async () => {
    if ($userConnected) {
      const workerContract = new ethers.Contract(
        addr.contractWorker,
        abiWorker,
        $networkProvider
      );
      totalWorkers = (await workerContract.getWorkers($userAddress)).length;
      availableWorkers = (
        await workerContract.getAvailableWorkers($userAddress)
      ).length;
      // homelessWorkers = (await workerContract.getUnHousedWorkers($userAddress))
      //   .length;
      // claimableBB = await workerContract.getClaimableBB($userAddress);
      workerMissions = await workerContract.getMissions($userAddress);
      activeWorkerMissions = workerMissions.filter((w) => {
        !w.finalized;
      });
      console.log(activeWorkerMissions);

      const soldierContract = new ethers.Contract(
        addr.contractSoldier,
        abiSoldier,
        $networkProvider
      );
      totalSoldiers = (await soldierContract.getSoldiers($userAddress)).length;
      availableSoldiers = (
        await soldierContract.getAvailableSoldiers($userAddress)
      ).length;
      zombieSoldiers = (await soldierContract.getZombieSoldiers($userAddress))
        .length;
      infectedSoldiers = (
        await soldierContract.getInfectedSoldiers($userAddress)
      ).length;
      claimableFunghi = await workerContract.getClaimableFunghi($userAddress);
      claimableLarva = await soldierContract.getClaimableLarvaCount(
        $userAddress
      );
      soldierMissions = await soldierContract.getMissions($userAddress);
      const feromonContract = new ethers.Contract(
        addr.contractFeromon,
        abiFeromon,
        $networkProvider
      );
      feromonBalance = ethers.utils.formatEther(
        await feromonContract.balanceOf($userAddress)
      );
    }
  };
  let now;
  setInterval(() => {
    fetchUserData();
    now = parseInt(new Date(now) / 1000);
  }, 10000);

  const expandNest = async () => {
    const workerContract = new ethers.Contract(
      addr.contractWorker,
      abiWorker,
      $networkSigner
    );
    const approved = await workerContract.isApprovedForAll(
      $userAddress,
      addr.contractAnt
    );
    if (!approved) {
      const approval = await workerContract.setApprovalForAll(
        addr.contractAnt,
        true
      );
      await approval.wait();
    }
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.expandNest(workerInput);
  };

  const claimBlocks = async (index) => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.claimAndIncreaseSpace(index);
  };

  const gatherFood = async () => {
    const workerContract = new ethers.Contract(
      addr.contractWorker,
      abiWorker,
      $networkSigner
    );
    const approved = await workerContract.isApprovedForAll(
      $userAddress,
      addr.contractAnt
    );
    if (!approved) {
      const approval = await workerContract.setApprovalForAll(
        addr.contractAnt,
        true
      );
      await approval.wait();
    }
    await workerContract.stakeWorker(workerInput);
  };

  const claimFunghi = async (index) => {
    const workerContract = new ethers.Contract(
      addr.contractWorker,
      abiWorker,
      $networkSigner
    );
    await workerContract.claimFunghi(index);
  };

  const sendToRaid = async () => {
    const soldierContract = new ethers.Contract(
      addr.contractSoldier,
      abiSoldier,
      $networkSigner
    );
    const approved = await soldierContract.isApprovedForAll(
      $userAddress,
      addr.contractAnt
    );
    if (!approved) {
      const approval = await soldierContract.setApprovalForAll(
        addr.contractAnt,
        true
      );
      await approval.wait();
    }
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.sendSoldierToRaid(soldierInput);
  };
  const claimLarva = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.claimStolenLarvae();
  };
  const healInfected = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.healSoldier(soldierInput);
  };
  const harvestZombie = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.claimPassiveSoldierReward(soldierInput);
  };
</script>

<div class="container">
  <!-- <Scoreboard type="feromon" /> -->
  <div style="height:24px" />
  <!-- <Scoreboard type="worker population" />
  <div style="height:24px" />
  <Scoreboard type="soldier population" />
  <div style="height:24px" /> -->

  <div class="header">
    <h3>COMMAND CENTER</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
    <div class="header">
      <h3>Worker Ants</h3>
    </div>
    <Line title="Total worker ants:" value={totalWorkers} />
    <Line title="Available worker ants:" value={availableWorkers} />
    <Line title="Occupied worker ants:" value={occupiedWorkers} />
    <Line title="Homeless worker ants:" value={homelessWorkers} />

    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      Gathering building parts occupy your worker ants for 7 days. Gathering
      food occupy your worker ants for 1 day. Each mission reduces worker health
      points by 2.<br /><br />Soldier can be sent along with worker ants for
      protection which mitigates 50% of damage taken by worker ants. A soldier
      can protect up to 10 worker ants.
    </p>
    <div class="inputs-container">
      <input
        type="text"
        placeholder="Amount of Workers"
        bind:value={workerInput}
        style="margin-top:8px; max-width:320px"
      />
    </div>
    <div class="buttons" style="margin-top:8px">
      <div
        class={`button-small ${availableWorkers > 0 ? "green" : ""}`}
        on:click={expandNest}
      >
        collect blocks
      </div>
      <div class="detail">-> to house more workers</div>
    </div>

    <div class="buttons">
      <div
        class={`button-small ${availableWorkers > 0 ? "green" : ""}`}
        on:click={gatherFood}
      >
        farm $funghi
      </div>
      <div class="detail">-> without soldier protection</div>
    </div>
    <p class="detail">--------------------------------------------</p>
    <!-- <div class="buttons">
      <div
        class={`button-small ${claimableBB > 0 ? "green" : ""}`}
        on:click={claimBlocks}
      >
        claim blocks
      </div>
      <div class="detail">-> {claimableBB} claimable</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${claimableFunghi > 0 ? "green" : ""}`}
        on:click={claimFunghi}
      >
        harvest $funghi
      </div>
      <div class="detail">-> {claimableFunghi} claimable</div>
    </div> -->
    <div class="header">
      <h3>Worker Missions</h3>
    </div>
    {#if activeWorkerMissions.length == 0}
      <p>No missions...</p>
    {:else}
      {#each workerMissions as m, i}
        {#if !m.finalized}
          {#if m.missionType == 1}
            <div class="buttons" style="margin-top:8px">
              <p>{m.missionType == 0 ? "Funghi" : "Nest"}Mission #{i + 1}</p>
              <div class={`button-small`} on:click={() => claimBlocks(i)}>
                claim block
              </div>
            </div>
          {:else}
            <div class="buttons" style="margin-top:8px">
              <p>Mission #{i + 1}</p>
              <div class={`button-small`} on:click={() => claimFunghi(i)}>
                claim funghi
              </div>
            </div>
          {/if}
        {/if}
      {/each}
    {/if}
  </main>
  <div style="height:24px" />
  <main class="card">
    <div class="header">
      <h3>Soldier Ants</h3>
    </div>
    <Line title="Total soldier ants: " value={totalSoldiers} />
    <Line title="Available soldier ants:" value={availableSoldiers} />
    <Line title="Occupied soldier ants:" value={occupiedSoldiers} />
    <Line title="Infected soldier ants:" value={infectedSoldiers} />
    <Line title="Zombie soldier ants:" value={zombieSoldiers} />

    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      You can heal infected soldiers but if you ignore them more than 3 days,
      they will turn into zombie ants, only to be harvested as $FUNGHI.
    </p>
    <input
      type="text"
      placeholder="Amount of Soldiers"
      bind:value={soldierInput}
      style="margin-top:8px"
    />
    <div class="buttons" style="margin-top:8px">
      <div
        class={`button-small ${availableSoldiers > 0 ? "green" : ""}`}
        on:click={sendToRaid}
      >
        send to raid
      </div>
      <div class="detail">-> to steal larva</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${claimableLarva > 0 ? "green" : ""}`}
        on:click={claimLarva}
      >
        try to steal larva
      </div>
      <div class="detail">-> {claimableLarva} trials</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${infectedSoldiers > 0 ? "green" : ""}`}
        on:click={healInfected}
      >
        heal infected
      </div>
      <div class="detail">-> to restore health</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${zombieSoldiers > 0 ? "green" : ""}`}
        on:click={harvestZombie}
      >
        harvest zombie
      </div>
      <div class="detail">-> to stop spread and get $funghi rewards</div>
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
