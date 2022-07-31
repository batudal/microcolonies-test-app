<script>
  import Line from "../UI/Line.svelte";
  import {
    userConnected,
    userAddress,
    networkProvider,
    networkSigner,
  } from "../../Stores/Network";
  import { ethers } from "ethers";
  import { abiPrincess, abiANT, abiMale } from "../../Stores/ABIs";

  export let addr;

  let maleBalance = "N/A";
  let princessBalance = "N/A";
  let claimableQueens = "N/A";
  let matingPrincesses = 0;
  let princessMissions = [];
  let now;
  let activePrincessMissions = [];

  const fetchUserData = async () => {
    if ($userConnected) {
      const princessContract = new ethers.Contract(
        addr.contractPrincess,
        abiPrincess,
        $networkProvider
      );
      princessMissions = await princessContract.getMissions($userAddress);
      activePrincessMissions = princessMissions.filter((w) => !w.finalized);
      princessBalance = (await princessContract.getPrincesses($userAddress))
        .length;
      claimableQueens = (
        await princessContract.getMatedPrincesses($userAddress)
      ).length;

      const maleContract = new ethers.Contract(
        addr.contractMale,
        abiMale,
        $networkProvider
      );
      maleBalance = (await maleContract.getMales($userAddress)).length;
    }
  };
  setInterval(() => {
    fetchUserData();
  }, 10000);
  $: $userConnected ? fetchUserData() : "";

  setInterval(() => {
    now = parseInt(Date.now()) / 1000;
  }, 1000);

  const mate = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.mateMalePrincess();
  };
  const claimQueen = async (index) => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.claimQueen(index);
  };
</script>

<div class="container">
  <div style="height:24px" />
  <div class="header">
    <h3>PRINCESS & DRONE ANTS</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
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
    <div class="header">
      <h3>Princess Missions</h3>
    </div>
    {#if activePrincessMissions.length == 0}
      <p style="width:100%;">No missions...</p>
    {:else}
      {#each princessMissions as m, i}
        {#if !m.finalized}
          <div class="buttons">
            <p>
              Mission #{i + 1} - {m.end > now
                ? `${parseInt((m.end - now) / 86400)}d ${parseInt(
                    ((m.end - now) / 3600) % 24
                  )}h ${parseInt(((m.end - now) / 60) % 60)}m`
                : ""}
            </p>
            <div
              class={`button-small ${now > m.end ? "green" : ""}`}
              on:click={() => claimQueen(i)}
            >
              claim
            </div>
          </div>
        {/if}
      {/each}
    {/if}
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
