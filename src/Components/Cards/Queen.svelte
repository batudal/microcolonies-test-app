<script>
  import Line from "../UI/Line.svelte";
  import {
    userConnected,
    userAddress,
    networkProvider,
    networkSigner,
  } from "../../Stores/Network";
  import { ethers } from "ethers";
  import { abiFunghi, abiQueen, abiANT, abiFeromon } from "../../Stores/ABIs";

  export let addr;

  let queenInput;
  let queens = [];
  let queenLevels = [];
  let queenEggs = [];
  let queenEnergys = [];
  let feromonAmount;
  let funghiAmount;
  let eggsLayable = 0;
  let feeding = false;
  let claiming = false;
  let upgrading = false;

  $: $userConnected ? fetchUserData() : "";

  const fetchUserData = async () => {
    if ($userConnected) {
      const queenContract = new ethers.Contract(
        addr.contractQueen,
        abiQueen,
        $networkProvider
      );
      queens = await queenContract.getQueens($userAddress);
      const feromonContract = new ethers.Contract(
        addr.contractFeromon,
        abiFeromon,
        $networkProvider
      );
      feromonAmount = await feromonContract.balanceOf($userAddress);
      feromonAmount = parseInt(ethers.utils.formatEther(feromonAmount));

      const funghiContract = new ethers.Contract(
        addr.contractFunghi,
        abiFunghi,
        $networkProvider
      );
      funghiAmount = parseInt(
        ethers.utils.formatEther(await funghiContract.balanceOf($userAddress))
      );

      for (let i = 0; i < queens.length; i++) {
        queenLevels[i] = await queenContract.idToLevel(queens[i]);
        queenEggs[i] =
          (await queenContract.eggsFormula(queens[i])) -
          (await queenContract.idToEggs(queens[i]));
        queenEnergys[i] = await queenContract.getEnergy(queens[i]);
      }
    }
  };
  setInterval(() => {
    fetchUserData();
  }, 10000);
  const feedQueen = async () => {
    feeding = true;
    const funghiContract = new ethers.Contract(
      addr.contractFunghi,
      abiFunghi,
      $networkSigner
    );
    const approved = parseFloat(
      ethers.utils.formatEther(
        await funghiContract.allowance($userAddress, addr.contractAnt)
      )
    );
    if (approved < queenInput * 240) {
      try {
        const approval = await funghiContract.approve(
          addr.contractAnt,
          ethers.constants.MaxUint256
        );
        await approval.wait();
      } catch (e) {
        console.log(e);
        feeding = false;
      }
    }
    if (eggsLayable > 0) {
      await layEggs();
    }
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    try {
      await antContract.feedQueen(queenInput);
    } catch (e) {
      console.log(e);
      feeding = false;
    }
    await fetchUserData();
    feeding = false;
  };
  const layEggs = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    const tx = await antContract.layEggs(queenInput);
    await tx.wait();
  };
  const queenLevelUp = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.queenLevelUp(queenInput);
  };
</script>

<div class="container">
  <div style="height:24px" />
  <div class="header">
    <h3>QUEEN ANTS</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
    {#each queens as queen, index}
      <Line
        title={`Queen #${queen} (${queenEnergys[index]}% energy)`}
        value={`Level ${queenLevels[index]} -> ${queenEggs[index]} Larvae`}
      />
    {/each}
    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      Boosting Queen Ant’s fertility costs $FUNGHI. For 1% increase it costs ~12
      $FUNGHI.
    </p>
    <input
      type="text"
      placeholder="Id of Queen"
      bind:value={queenInput}
      style="margin-top:8px"
    />
    <div class="buttons" style="margin-top:8px">
      {#if feeding}
        <p class="notification">Feeding queen...</p>
      {:else}
        <div
          class={`button-small ${funghiAmount > 1200 ? "green" : ""}`}
          on:click={feedQueen}
        >
          feed queen
        </div>
        <div class="detail">-> to increase her fertility</div>
      {/if}
    </div>
    <div class="buttons">
      {#if claiming}
        <p class="notification">Claiming larvae...</p>
      {:else}
        <div
          class={`button-small ${eggsLayable > 0 ? "green" : ""}`}
          on:click={layEggs}
        >
          claim larvae
        </div>
        <div class="detail">-> to mint larva</div>
      {/if}
    </div>
    <div class="buttons">
      {#if upgrading}
        <p class="notification">Upgrading queen...</p>
      {:else}
        <div
          class={`button-small ${
            queens.length > 0 && feromonAmount > 100 ? "green" : ""
          }`}
          on:click={queenLevelUp}
        >
          upgrade queen
        </div>
        <div class="detail">-> to level her up</div>
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
