<script>
  import Line from "../UI/Line.svelte";
  import { userConnected, userAddress, networkProvider, networkSigner } from "../../Stores/Network";
  import { ethers } from "ethers";
  import { abiFunghi, abiQueen, abiLarva, abiANT, abiTournament } from "../../Stores/ABIs";

  export let addr;
  export let tournament;

  let totalLarva;
  let maxHatch;
  let larvaInput;
  let queens = [];
  let queenLevels = [];
  let queenEggs = [];
  let funghiAmount;
  let firstMint = false;
  let hatching = false;
  let feeding = false;
  let fed;
  let nickname = null;

  $: $userConnected ? fetchUserData() : "";

  const fetchUserData = async () => {
    if ($userConnected) {
      const larvaContract = new ethers.Contract(addr.contractLarva, abiLarva, $networkProvider);
      totalLarva = (await larvaContract.getLarvae($userAddress)).length;
      fed = await larvaContract.getFed($userAddress);
      const queenContract = new ethers.Contract(addr.contractQueen, abiQueen, $networkProvider);
      queens = await queenContract.getQueens($userAddress);
      const funghiContract = new ethers.Contract(addr.contractFunghi, abiFunghi, $networkProvider);
      funghiAmount = await funghiContract.balanceOf($userAddress);

      for (let i = 0; i < queens.length; i++) {
        queenLevels[i] = await queenContract.idToLevel(queens[i]);
        queenEggs[i] = await queenContract.eggsFormula(queens[i]);
        queenEggs[i] -= await queenContract.idToEggs(queens[i]);
      }

      const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
      firstMint = await antContract.firstMint($userAddress);
      maxHatch = await antContract.playerToAvailableSpace($userAddress);

      try {
        const tournamentContract = new ethers.Contract(tournament, abiTournament, $networkSigner);
        nickname = await tournamentContract.nicknames($userAddress);
        console.log("Nickname: ", nickname);
      } catch (e) {
        console.log(e);
      }
    }
  };
  setInterval(() => {
    fetchUserData();
  }, 10000);

  const feedLarva = async () => {
    feeding = true;
    const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
    try {
      const feedtx = await antContract.feedLarva(larvaInput);
      await feedtx.wait();
    } catch (e) {
      console.log(e);
      feeding = false;
    }
    await fetchUserData();
    feeding = false;
  };

  const hatch = async () => {
    hatching = true;
    const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
    try {
      const hatchtx = await antContract.hatch(parseInt(larvaInput));
      await hatchtx.wait();
    } catch (e) {
      console.log(e);
      hatching = false;
    }
    await fetchUserData();
    hatching = false;
  };
</script>

<div class="container">
  <div style="height:24px" />
  <div class="header">
    <h3>LARVAE</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
    <Line title="Fed larvae / Total larvae" value={`${fed}/${totalLarva}`} />
    <Line title="Available nest capacity:" value={nickname != "" ? (!firstMint ? "10" : maxHatch) : "0"} />
    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      All larvae will be incubated for 3 days. User can feed the upcoming larvae to hatch to boost their chances to
      improve offspring rarity.
    </p>
    <div class="inputs-container">
      <input type="text" placeholder="Amount of Larvae" bind:value={larvaInput} style="margin-top:8px;" />
    </div>
    <div class="buttons" style="margin-top:8px">
      {#if !feeding}
        <div class={`button-small ${funghiAmount > 0 && totalLarva > 0 ? "green" : ""}`} on:click={feedLarva}>
          feed larva
        </div>
        <div class="detail">-> for better ants</div>
      {:else}
        <p class="notification">Feeding larvae...</p>
      {/if}
    </div>
    <div class="buttons">
      {#if !hatching}
        <div
          class={`button-small ${(!firstMint && nickname != "") || (maxHatch > 0 && totalLarva > 0) ? "green" : ""}`}
          on:click={hatch}
        >
          hatch
        </div>
        <div class="detail">-> to get new ants</div>
      {:else}
        <p class="notification">Hatching new ants...</p>
      {/if}
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
