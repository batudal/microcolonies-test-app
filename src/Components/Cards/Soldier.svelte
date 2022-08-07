<script>
  import Line from "../UI/Line.svelte";
  import { userConnected, userAddress, networkProvider, networkSigner } from "../../Stores/Network";
  import { ethers } from "ethers";
  import { abiSoldier, abiANT, abiLarva, abiTournament } from "../../Stores/ABIs";

  export let addr;
  export let tournament;

  let soldierInput;
  let totalSoldiers = "N/A";
  let availableSoldiers = "N/A";
  let zombieSoldiers = "N/A";
  let infectedSoldiers = "N/A";
  let soldierMissions = [];
  let activeSoldierMissions = [];
  let soldierMissionUpdating = false;
  let targetUpdating = null;
  let retreatUpdating = null;
  let soldierHealing = false;
  let soldierHarvesting = false;
  let acquiredTargets = [];
  let acquiredTargetsNicknames = [];
  let targetLarvae = [];
  let targetSoldiers = [];

  $: $userConnected ? fetchUserData() : "";
  $: occupiedSoldiers = totalSoldiers - availableSoldiers - zombieSoldiers;
  $: if (acquiredTargets.length > 0) {
    fetchTargetData(acquiredTargets);
  }

  const fetchTargetData = async (targets) => {
    const larvaContract = new ethers.Contract(addr.contractLarva, abiLarva, $networkProvider);
    const soldierContract = new ethers.Contract(addr.contractSoldier, abiSoldier, $networkProvider);
    for (let i = 0; i < targets.length; i++) {
      if (targets[i] != "") {
        targetLarvae[i] = await larvaContract.getLarvae(targets[i]);
        targetSoldiers[i] = await soldierContract.getAvailableSoldiers(targets[i]);
      } else {
        targetLarvae[i] = [];
        targetSoldiers[i] = [];
      }
    }
  };

  const fetchUserData = async () => {
    const soldierContract = new ethers.Contract(addr.contractSoldier, abiSoldier, $networkProvider);
    totalSoldiers = (await soldierContract.getSoldiers($userAddress)).length;
    availableSoldiers = (await soldierContract.getAvailableSoldiers($userAddress)).length;
    zombieSoldiers = (await soldierContract.getZombieSoldiers($userAddress)).length;
    infectedSoldiers = (await soldierContract.getInfectedSoldiers($userAddress)).length;
    soldierMissions = await soldierContract.getMissions($userAddress);
    activeSoldierMissions = soldierMissions.filter((x) => !x.finalized);
    const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
    let _acquiredTargets = [];
    let _acquiredTargetsNicknames = [];
    for (let i = 0; i < soldierMissions.length; i++) {
      if (soldierMissions[i].end < now && !soldierMissions[i].finalized) {
        try {
          let reveal = await antContract.revealTarget(i);
          let nickname;
          try {
            const tournamentContract = new ethers.Contract(tournament, abiTournament, $networkSigner);
            nickname = await tournamentContract.getNickname(reveal);
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
  };

  setInterval(() => {
    if ($userConnected) {
      fetchUserData();
    }
  }, 10000);

  let now;
  setInterval(() => {
    now = parseInt(Date.now()) / 1000;
  }, 1000);

  const sendToRaid = async () => {
    soldierMissionUpdating = true;
    const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
    try {
      const findtx = await antContract.findTarget(soldierInput);
      await findtx.wait();
    } catch (e) {
      console.log(e);
      soldierMissionUpdating = null;
    }
    await fetchUserData();
    soldierMissionUpdating = null;
  };
  const claimLarva = async (id) => {
    targetUpdating = id;
    const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
    try {
      const claimtx = await antContract.claimStolenLarvae(id);
      await claimtx.wait();
    } catch (e) {
      console.log(e);
    }
    await fetchUserData();
    targetUpdating = null;
  };
  const retreat = async (id) => {
    retreatUpdating = id;
    const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
    try {
      const retreattx = await antContract.retreatSoldiers(id);
      await retreattx.wait();
    } catch (e) {
      console.log(e);
      retreatUpdating = null;
    }
    await fetchUserData();
    retreatUpdating = null;
  };
  const healInfected = async (id) => {
    soldierHealing = true;
    const soldierContract = new ethers.Contract(addr.contractSoldier, abiSoldier, $networkSigner);
    try {
      const healtx = await soldierContract.healSoldier(soldierInput);
      await healtx.wait();
    } catch (e) {
      console.log(e);
      soldierHealing = false;
    }
    await fetchUserData();
    soldierHealing = false;
  };
  const harvestZombie = async (id) => {
    soldierHarvesting = true;
    const soldierContract = new ethers.Contract(addr.contractSoldier, abiSoldier, $networkSigner);
    try {
      const harvesttx = await soldierContract.harvestZombie(soldierInput);
      await harvesttx.wait();
    } catch (e) {
      console.log(e);
      soldierHarvesting = false;
    }
    soldierHarvesting = false;
  };
</script>

<div class="container">
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
      You can heal infected soldiers but if you ignore them more than 3 days, they will turn into zombie ants, only to
      be harvested as $FUNGHI.
    </p>
    <input type="text" placeholder="Amount of Soldiers" bind:value={soldierInput} style="margin-top:8px" />
    <div class="buttons" style="margin-top:8px">
      {#if soldierMissionUpdating}
        <p class="notification">Deploying scout mission...</p>
      {:else}
        <div class={`button-small ${availableSoldiers > 0 ? "green" : ""}`} on:click={sendToRaid}>scout</div>
        <div class="detail">-> find a target</div>
      {/if}
    </div>
    <div class="buttons">
      {#if soldierHealing}
        <p class="notification">Healing infected soldiers...</p>
      {:else}
        <div class={`button-small ${infectedSoldiers > 0 ? "green" : ""}`} on:click={healInfected}>heal infected</div>
        <div class="detail">-> to restore health</div>
      {/if}
    </div>
    <div class="buttons">
      {#if soldierHarvesting}
        <p class="notification">Harvesting zombie...</p>
      {:else}
        <div class={`button-small ${zombieSoldiers > 0 ? "green" : ""}`} on:click={harvestZombie}>harvest zombie</div>
        <div class="detail">-> to stop spread</div>
      {/if}
    </div>
    <p class="detail">--------------------------------------------</p>

    <div class="header">
      <h3>Soldier Missions</h3>
    </div>
    {#if activeSoldierMissions.length == 0}
      <p style="width:100%;">No active missions.</p>
    {:else}
      {#each soldierMissions as m, i}
        {#if targetUpdating == i}
          <p class="notification">Attacking {acquiredTargetsNicknames[i]}...</p>
        {:else if retreatUpdating == i}
          <p class="notification">
            Leaving {acquiredTargetsNicknames[i]} alone...
          </p>
        {:else if !m.finalized}
          {#if m.end < now}
            <div style="height:8px" />
            <Line title="Target name:" value={acquiredTargetsNicknames[i]} />

            <Line title="Target soldiers:" value={targetSoldiers[i]?.length} />
            <Line title="Target larvae:" value={targetLarvae[i]?.length} />
            <p class="detail">--------------------------------------------</p>

            <div class="buttons">
              <div class={`button-small green`} on:click={() => claimLarva(i)}>attack</div>
              <div class="detail">-> for the glory</div>
            </div>
            <div class="buttons">
              <div class={`button-small green`} on:click={() => retreat(i)}>retreat</div>
              <div class="detail">-> and waste your time</div>
            </div>
          {:else}
            <div class="buttons" style="justify-content:space-between;">
              <p>Scout ({m.ids.length} ants)</p>
              <p>
                {m.end > now
                  ? `${parseInt((m.end - now) / 86400)}d ${parseInt(((m.end - now) / 3600) % 24)}h ${parseInt(
                      ((m.end - now) / 60) % 60
                    )}m`
                  : ""}
              </p>
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
