<script>
  import Line from "../UI/Line.svelte";
  import { userConnected, userAddress, networkProvider, networkSigner } from "../../Stores/Network";
  import { ethers } from "ethers";
  import { abiWorker, abiANT } from "../../Stores/ABIs";

  export let addr;

  let workerInput;
  let availableWorkers = "N/A";
  let totalWorkers = "N/A";
  let workerMissions = [];
  let activeWorkerMissions = [];
  let missionUpdating = false;
  let nestMissionUpdating = false;
  let claimUpdating = null;
  let nestClaimUpdating = null;
  let converting = false;

  $: $userConnected ? fetchUserData() : "";
  $: occupiedWorkers = totalWorkers - availableWorkers;

  const fetchUserData = async () => {
    const workerContract = new ethers.Contract(addr.contractWorker, abiWorker, $networkProvider);
    totalWorkers = (await workerContract.getWorkers($userAddress)).length;
    availableWorkers = (await workerContract.getAvailableWorkers($userAddress)).length;
    workerMissions = await workerContract.getMissions($userAddress);
    activeWorkerMissions = workerMissions.filter((x) => !x.finalized);
  };

  setInterval(() => {
    if ($userConnected) {
      fetchUserData();
    }
  }, 10000);

  let now;
  setInterval(() => {
    now = parseInt(Date.now()) / 1000;
  });

  const expandNest = async () => {
    nestMissionUpdating = true;
    const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
    try {
      const expand = await antContract.expandNest(workerInput);
      await expand.wait();
    } catch (e) {
      console.log(e);
      nestMissionUpdating = false;
    }
    await fetchUserData();
    nestMissionUpdating = false;
  };
  const claimBlocks = async (index) => {
    nestClaimUpdating = index;
    const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
    try {
      const claimtx = await antContract.claimAndIncreaseSpace(index);
      await claimtx.wait();
    } catch (e) {
      console.log(e);
      nestClaimUpdating = null;
    }
    await fetchUserData();
    nestClaimUpdating = null;
  };
  const gatherFood = async () => {
    missionUpdating = true;
    const workerContract = new ethers.Contract(addr.contractWorker, abiWorker, $networkSigner);
    try {
      const stake = await workerContract.stakeWorker(workerInput);
      await stake.wait();
    } catch (e) {
      console.log(e);
      missionUpdating = false;
    }
    await fetchUserData();
    missionUpdating = false;
  };
  const claimFunghi = async (index) => {
    claimUpdating = index;
    const workerContract = new ethers.Contract(addr.contractWorker, abiWorker, $networkSigner);
    try {
      const claim = await workerContract.claimFunghi(index);
      await claim.wait();
    } catch (e) {
      console.log(e);
      claimUpdating = null;
    }
    await fetchUserData();
    claimUpdating = null;
  };
  const convertWorker = async () => {
    converting = true;
    const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
    try {
      const converttx = await antContract.convertFromWorkerToSoldier(workerInput);
      await converttx.wait();
    } catch (e) {
      console.log(e);
      converting = false;
    }
    converting = false;
  };
</script>

<div class="container">
  <div style="height:24px" />
  <div class="header">
    <h3>WORKER ANTS</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
    <Line title="Total:" value={totalWorkers} />
    <Line title="Available:" value={availableWorkers} />
    <Line title="Occupied:" value={occupiedWorkers} />

    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      Gathering building parts occupy your worker ants for 7 days. Gathering food occupy your worker ants for 1 day.
      Each mission reduces worker health points by 2.<br /><br />Soldier can be sent along with worker ants for
      protection which mitigates 50% of damage taken by worker ants. A soldier can protect up to 10 worker ants.
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
      {#if nestMissionUpdating}
        <p class="notification">Deploying build mission...</p>
      {:else}
        <div class={`button-small ${availableWorkers > 0 ? "green" : ""}`} on:click={expandNest}>build</div>
        <div class="detail">-> increase nest capacity (5)</div>
      {/if}
    </div>
    <div class="buttons">
      {#if converting}
        <p class="notification">Metamorphosing into soldier...</p>
      {:else}
        <div class={`button-small ${availableWorkers > 0 ? "green" : ""}`} on:click={convertWorker}>metamorphose</div>
        <div class="detail">-> into soldier (-10 feromon)</div>
      {/if}
    </div>

    <div class="buttons">
      {#if missionUpdating}
        <p class="notification">Deploying farm mission...</p>
      {:else}
        <div class={`button-small ${availableWorkers > 0 ? "green" : ""}`} on:click={gatherFood}>farm</div>
        <div class="detail">-> produce funghi (80)</div>
      {/if}
    </div>
    <p class="detail">--------------------------------------------</p>
    <div class="header">
      <h3>Worker Missions</h3>
    </div>
    {#if activeWorkerMissions.length == 0}
      <p style="width:100%;">No active missions.</p>
    {:else}
      {#each workerMissions as m, i}
        {#if claimUpdating == i}
          <p class="notification">Claiming funghi...</p>
        {:else if nestClaimUpdating == i}
          <p class="notification">Increasing nest capacity...</p>
        {:else if !m.finalized}
          {#if m.missionType == 1}
            <div class="buttons" style="justify-content:space-between;">
              <p>Nest ({m.ids.length} ants)</p>
              <p>
                {m.end > now
                  ? `${parseInt((m.end - now) / 86400)}d ${parseInt(((m.end - now) / 3600) % 24)}h ${parseInt(
                      ((m.end - now) / 60) % 60
                    )}m`
                  : ""}
              </p>
              {#if m.end < now}
                <div class={`button-small green`} on:click={() => claimBlocks(i)}>finalize</div>
              {/if}
            </div>
          {:else}
            <div class="buttons" style="justify-content:space-between;">
              <p>Funghi ({m.ids.length} ants)</p>
              <p>
                {m.end > now
                  ? `${parseInt((m.end - now) / 86400)}d ${parseInt(((m.end - now) / 3600) % 24)}h ${parseInt(
                      ((m.end - now) / 60) % 60
                    )}m`
                  : ""}
              </p>
              {#if m.end < now}
                <div class={`button-small green`} on:click={() => claimFunghi(i)}>claim funghi</div>
              {/if}
            </div>
          {/if}
        {/if}
      {/each}
    {/if}
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
  .row-buttons {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
</style>
