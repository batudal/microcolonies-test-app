<script>
  import Line from "../UI/Line.svelte";
  import {
    userConnected,
    userAddress,
    networkProvider,
    networkSigner,
  } from "../../Stores/Network";
  import { ethers } from "ethers";
  import { abiWorker, abiANT } from "../../Stores/ABIs";

  export let addr;

  let workerInput;
  let availableWorkers = "N/A";
  let totalWorkers = "N/A";
  let workerMissions = [];
  let activeWorkerMissions = [];
  let missionUpdating = false;
  let claimUpdating = null;

  $: $userConnected ? fetchUserData() : "";
  $: occupiedWorkers = totalWorkers - availableWorkers;

  const fetchUserData = async () => {
    const workerContract = new ethers.Contract(
      addr.contractWorker,
      abiWorker,
      $networkProvider
    );
    totalWorkers = (await workerContract.getWorkers($userAddress)).length;
    availableWorkers = (await workerContract.getAvailableWorkers($userAddress))
      .length;
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
    missionUpdating = true;
    const workerContract = new ethers.Contract(
      addr.contractWorker,
      abiWorker,
      $networkSigner
    );
    const approved = await workerContract.isApprovedForAll(
      $userAddress,
      addr.contractAnt
    );
    try {
      if (!approved) {
        const approval = await workerContract.setApprovalForAll(
          addr.contractAnt,
          true
        );
        await approval.wait();
      }
    } catch (e) {
      console.log(e);
    }
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    try {
      const expand = await antContract.expandNest(workerInput);
      await expand.wait();
    } catch (e) {
      console.log(e);
    }
    await fetchUserData().then((missionUpdating = false));
  };
  const claimBlocks = async (index) => {
    claimUpdating = index;
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    try {
      await antContract.claimAndIncreaseSpace(index);
    } catch (e) {
      console.log(e);
    }
    await fetchUserData().then((claimUpdating = null));
  };
  const gatherFood = async () => {
    missionUpdating = true;
    const workerContract = new ethers.Contract(
      addr.contractWorker,
      abiWorker,
      $networkSigner
    );
    const approved = await workerContract.isApprovedForAll(
      $userAddress,
      addr.contractAnt
    );
    try {
      if (!approved) {
        const approval = await workerContract.setApprovalForAll(
          addr.contractAnt,
          true
        );
        await approval.wait();
      }
    } catch (e) {
      console.log(e);
    }

    try {
      const stake = await workerContract.stakeWorker(workerInput);
      await stake.wait();
    } catch (e) {
      console.log(e);
    }
    await fetchUserData().then((missionUpdating = false));
  };
  const claimFunghi = async (index) => {
    claimUpdating = index;
    const workerContract = new ethers.Contract(
      addr.contractWorker,
      abiWorker,
      $networkSigner
    );
    try {
      const claim = await workerContract.claimFunghi(index);
      await claim.wait();
    } catch (e) {
      console.log(e);
    }
    await fetchUserData().then((claimUpdating = null));
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
        build
      </div>
      <div class="detail">-> increase nest capacity (10)</div>
    </div>

    <div class="buttons">
      <div
        class={`button-small ${availableWorkers > 0 ? "green" : ""}`}
        on:click={gatherFood}
      >
        farm
      </div>
      <div class="detail">-> produce funghi (240)</div>
    </div>
    <p class="detail">--------------------------------------------</p>
    <div class="header">
      <h3>Worker Missions</h3>
    </div>
    {#if missionUpdating}
      <p class="notification">Deploying new mission...</p>
    {/if}
    {#if activeWorkerMissions.length == 0 && !missionUpdating}
      <p style="width:100%;">No active missions.</p>
    {:else}
      {#each workerMissions as m, i}
        {#if !m.finalized}
          {#if m.missionType == 1}
            <div class="buttons" style="justify-content:space-between;">
              {#if claimUpdating != i}
                <p>Nest ({m.ids.length} ants)</p>
                <p>
                  {m.end > now
                    ? `${parseInt((m.end - now) / 86400)}d ${parseInt(
                        ((m.end - now) / 3600) % 24
                      )}h ${parseInt(((m.end - now) / 60) % 60)}m`
                    : ""}
                </p>
                {#if m.end < now}
                  <div
                    class={`button-small green`}
                    on:click={() => claimBlocks(i)}
                  >
                    claim block
                  </div>
                {/if}
              {:else}
                <p class="notification">Claiming now...</p>
              {/if}
            </div>
          {:else}
            <div class="buttons" style="justify-content:space-between;">
              {#if claimUpdating != i}
                <p>Funghi ({m.ids.length} ants)</p>
                <p>
                  {m.end > now
                    ? `${parseInt((m.end - now) / 86400)}d ${parseInt(
                        ((m.end - now) / 3600) % 24
                      )}h ${parseInt(((m.end - now) / 60) % 60)}m`
                    : ""}
                </p>
                {#if m.end < now}
                  <div
                    class={`button-small green`}
                    on:click={() => claimFunghi(i)}
                  >
                    claim funghi
                  </div>
                {/if}
              {:else}
                <p class="notification">Claiming now...</p>
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
