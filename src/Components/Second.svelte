<script>
  import Line from "./Line.svelte";
  import {
    userConnected,
    userAddress,
    networkProvider,
    networkSigner,
  } from "../Stores/Network";
  import { ethers } from "ethers";
  import {
    abiWorker,
    abiSoldier,
    abiANT,
    abiFeromon,
    abiLarva,
    abiTournament,
  } from "../Stores/ABIs";

  export let addr;
  export let tournament;

  let workerInput;
  let soldierInput;
  let availableWorkers = "N/A";
  let totalWorkers = "N/A";
  let totalSoldiers = "N/A";
  let availableSoldiers = "N/A";
  let zombieSoldiers = "N/A";
  let infectedSoldiers = "N/A";
  let workerMissions = [];
  let activeWorkerMissions = [];
  let soldierMissions = [];
  let activeSoldierMissions = [];
  let missionUpdating = false;
  let soldierMissionUpdating = false;
  let claimUpdating = null;
  let targetUpdating = null;
  let acquiredTargets = [];
  let acquiredTargetsNicknames = [];
  let targetLarvae = [];
  let targetSoldiers = [];
  let feromonBalance;
  let claimableFunghi;
  let claimableLarva;

  $: $userConnected ? fetchUserData() : "";
  $: occupiedWorkers = totalWorkers - availableWorkers;
  $: occupiedSoldiers = totalSoldiers - availableSoldiers - zombieSoldiers;
  $: if (acquiredTargets.length > 0) {
    fetchTargetData(acquiredTargets);
  }

  const fetchTargetData = async (targets) => {
    const larvaContract = new ethers.Contract(
      addr.contractLarva,
      abiLarva,
      $networkProvider
    );
    const soldierContract = new ethers.Contract(
      addr.contractSoldier,
      abiSoldier,
      $networkProvider
    );
    for (let i = 0; i < targets.length; i++) {
      if (targets[i] != "") {
        targetLarvae[i] = await larvaContract.getLarvae(targets[i]);
        targetSoldiers[i] = await soldierContract.getAvailableSoldiers(
          targets[i]
        );
      } else {
        targetLarvae[i] = [];
        targetSoldiers[i] = [];
      }
    }
  };

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
    infectedSoldiers = (await soldierContract.getInfectedSoldiers($userAddress))
      .length;
    claimableFunghi = await workerContract.getClaimableFunghi($userAddress);
    claimableLarva = await soldierContract.getClaimableLarvaCount($userAddress);
    soldierMissions = await soldierContract.getMissions($userAddress);
    activeSoldierMissions = soldierMissions.filter((x) => !x.finalized);
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    let _acquiredTargets = [];
    let _acquiredTargetsNicknames = [];
    for (let i = 0; i < soldierMissions.length; i++) {
      if (soldierMissions[i].end < now && !soldierMissions[i].finalized) {
        try {
          let reveal = await antContract.revealTarget(i);
          console.log(reveal);
          let nickname;
          try {
            const tournamentContract = new ethers.Contract(
              tournament,
              abiTournament,
              $networkSigner
            );
            nickname = await tournamentContract.getNickname(
              "0x187549F02D96d94945f2c4Dd206cF58AEed8EBAE"
            );
            console.log(nickname);
          } catch (e) {
            console.log(e);
          }
          _acquiredTargets.push(reveal);
          _acquiredTargetsNicknames.push(nickname);
        } catch (e) {
          console.log(e);
        }
      } else {
        _acquiredTargets.push("");
        _acquiredTargetsNicknames.push("");
      }
    }
    acquiredTargets = _acquiredTargets;
    acquiredTargetsNicknames = _acquiredTargetsNicknames;

    const feromonContract = new ethers.Contract(
      addr.contractFeromon,
      abiFeromon,
      $networkProvider
    );
    feromonBalance = ethers.utils.formatEther(
      await feromonContract.balanceOf($userAddress)
    );
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
  const sendToRaid = async () => {
    soldierMissionUpdating = true;
    const soldierContract = new ethers.Contract(
      addr.contractSoldier,
      abiSoldier,
      $networkSigner
    );

    const approved = await soldierContract.isApprovedForAll(
      $userAddress,
      addr.contractAnt
    );
    try {
      if (!approved) {
        const approval = await soldierContract.setApprovalForAll(
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
      await antContract.findTarget(soldierInput);
    } catch (e) {
      console.log(e);
    }
    await fetchUserData().then((claimSoldierUpdating = null));
  };
  const claimLarva = async (id) => {
    targetUpdating = id;
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    try {
      await antContract.claimStolenLarvae(id);
    } catch (e) {
      console.log(e);
    }
    await fetchUserData().then((targetUpdating = null));
  };
  const retreat = async (id) => {
    targetUpdating = id;
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    try {
      await antContract.retreatSoldiers(id);
    } catch (e) {
      console.log(e);
    }
    await fetchUserData().then((targetUpdating = null));
  };
  const healInfected = async () => {
    const soldierContract = new ethers.Contract(
      addr.contractSoldier,
      abiSoldier,
      $networkSigner
    );
    await soldierContract.healSoldier(soldierInput);
  };
  const harvestZombie = async () => {
    const soldierContract = new ethers.Contract(
      addr.contractSoldier,
      abiSoldier,
      $networkSigner
    );
    await soldierContract.harvestZombie(soldierInput);
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
  <div style="height:24px" />
  <div class="header">
    <h3>SOLDIER ANTS</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
    <Line title="Total: " value={totalSoldiers} />
    <Line title="Available:" value={availableSoldiers} />
    <Line title="Occupied:" value={occupiedSoldiers} />
    <Line title="Infected:" value={infectedSoldiers} />
    <Line title="Zombie:" value={zombieSoldiers} />

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
        scout
      </div>
      <div class="detail">-> find a target</div>
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
    <p class="detail">--------------------------------------------</p>

    <div class="header">
      <h3>Soldier Missions</h3>
    </div>
    {#if soldierMissionUpdating}
      <p style="width:100%;">Deploying new mission...</p>
    {/if}
    {#if activeSoldierMissions.length == 0 && !targetUpdating}
      <p style="width:100%;">No active missions.</p>
    {:else}
      {#each soldierMissions as m, i}
        {#if !m.finalized}
          {#if targetUpdating != i}
            {#if m.end < now}
              <div style="height:8px" />
              <Line title="Target name:" value={acquiredTargetsNicknames[i]} />
              <Line
                title="Target address:"
                value={acquiredTargets[i]?.substring(0, 6)}
              />
              <Line
                title="Target soldiers:"
                value={targetSoldiers[i]?.length}
              />
              <Line title="Target larvae:" value={targetLarvae[i]?.length} />
              <p class="detail">--------------------------------------------</p>

              <div class="buttons">
                <div
                  class={`button-small green`}
                  on:click={() => claimLarva(i)}
                >
                  attack
                </div>
                <div class="detail">-> for the glory</div>
              </div>
              <div class="buttons">
                <div class={`button-small green`} on:click={() => retreat(i)}>
                  retreat
                </div>
                <div class="detail">-> and waste your time</div>
              </div>
            {:else}
              <div class="buttons" style="justify-content:space-between;">
                <p>Scout ({m.ids.length} ants)</p>
                <p>
                  {m.end > now
                    ? `${parseInt((m.end - now) / 86400)}d ${parseInt(
                        ((m.end - now) / 3600) % 24
                      )}h ${parseInt(((m.end - now) / 60) % 60)}  m`
                    : ""}
                </p>
              </div>
            {/if}
          {:else}
            <p class="notification">Transaction in progress...</p>
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
  .notification {
    width: 100%;
    color: #00ff6a;
    animation-name: strobe;
    animation-duration: 2s;
    animation-iteration-count: infinite;
  }
  @keyframes strobe {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
