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
    abiLollipop,
  } from "../Stores/ABIs";

  export let addr;
  export let tournament;

  let funghiBalance = "N/A";
  let lollipopBalance = "N/A";
  let feromonBalance = "N/A";
  let workerBalance = "N/A";
  let soldierBalance = "N/A";
  let queenBalance = "N/A";
  let larvaBalance = "N/A";
  let maleBalance = "N/A";
  let princessBalance = "N/A";
  let totalPopulation = "N/A";
  let nestCapacity;

  let claimableQueens = "N/A";
  let matingPrincesses = 0;
  let princessMissions = [];
  let nickname = "";
  let now;
  let activePrincessMissions = [];

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

      const lollipopContract = new ethers.Contract(
        addr.contractLollipop,
        abiLollipop,
        $networkSigner
      );
      lollipopBalance = await lollipopContract.balanceOf($userAddress);
      console.log(lollipopBalance);

      totalPopulation = await antContract.getPopulation();
      nestCapacity = await antContract.playerToCapacity($userAddress);

      princessMissions = await princessContract.getMissions($userAddress);
      activePrincessMissions = princessMissions.filter((w) => !w.finalized);
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
    await antContract.claimQueen(index, { gasLimit: "1000000" });
  };
  const enterTournament = async () => {
    const tournamentContract = new ethers.Contract(
      tournament,
      abiTournament,
      $networkSigner
    );
    await tournamentContract.enterTournament(nickname);
  };
  const activateLollipop = async () => {
    const lollipopContract = new ethers.Contract(
      addr.contractLollipop,
      abiLollipop,
      $networkSigner
    );
    try {
      await lollipopContract.activate($userAddress);
    } catch (e) {
      console.log(e);
    }
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
      <div class="detail">-> let's go</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${lollipopBalance > 0 ? "green" : ""}`}
        on:click={activateLollipop}
      >
        use lollipop
      </div>
      <div class="detail">-> to speed up missions</div>
    </div>
  </main>
  <div style="height:24px" />
  <div class="header">
    <h3>PRINCESS & DRONE ANTS</h3>
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
