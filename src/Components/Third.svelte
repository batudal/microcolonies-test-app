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
    abiFunghi,
    abiQueen,
    abiLarva,
    abiANT,
    abiFeromon,
  } from "../Stores/ABIs";

  export let addr;

  let totalLarva;
  let larvaToHatch;
  let maxHatch;
  let larvaInput, queenInput;
  let queens = [];
  let queenLevels = [];
  let queenEggs = [];
  let funghiAmount;
  let feromonAmount;
  let eggsLayable = 0;
  let homelessWorkers = 0;
  let homelessCount;

  $: $userConnected ? fetchUserData() : "";

  const fetchUserData = async () => {
    if ($userConnected) {
      const larvaContract = new ethers.Contract(
        addr.contractLarva,
        abiLarva,
        $networkProvider
      );
      totalLarva = (await larvaContract.getLarvae($userAddress)).length;
      larvaToHatch = parseInt(
        await larvaContract.getHatchersLength($userAddress)
      );
      const queenContract = new ethers.Contract(
        addr.contractQueen,
        abiQueen,
        $networkProvider
      );
      queens = await queenContract.getQueens($userAddress);
      const funghiContract = new ethers.Contract(
        addr.contractFunghi,
        abiFunghi,
        $networkProvider
      );
      funghiAmount = await funghiContract.balanceOf($userAddress);
      const feromonContract = new ethers.Contract(
        addr.contractFeromon,
        abiFeromon,
        $networkProvider
      );
      feromonAmount = await feromonContract.balanceOf($userAddress);
      feromonAmount = parseInt(ethers.utils.formatEther(feromonAmount));
      const workerContract = new ethers.Contract(
        addr.contractWorker,
        abiWorker,
        $networkProvider
      );

      for (let i = 0; i < queens.length; i++) {
        queenLevels[i] = await queenContract.idToLevel(queens[i]);
        queenEggs[i] = await queenContract.layingEggs($userAddress, queens[i]);
      }

      const antContract = new ethers.Contract(
        addr.contractAnt,
        abiANT,
        $networkSigner
      );
      maxHatch = await antContract.playerToAvailableSpace($userAddress);
      homelessCount = await antContract.getHomelessAntCount($userAddress);

      await isEggsLayable();
    }
  };
  setInterval(() => {
    fetchUserData();
  }, 10000);

  const isEggsLayable = async () => {
    if ($userConnected) {
      eggsLayable = 0;
      for (let i = 0; i < queenEggs.length; i++) {
        if (queenEggs[i] > 0) {
          eggsLayable = eggsLayable + parseInt(queenEggs[i]);
        }
      }
    }
  };

  const feedLarva = async () => {
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
    if (approved < larvaInput * 80) {
      const approval = await funghiContract.approve(
        addr.contractAnt,
        ethers.constants.MaxUint256
      );
      await approval.wait();
    }
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.feedLarva(larvaInput);
  };
  const hatch = async () => {
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.hatch(parseInt(larvaInput));
  };
  const feedQueen = async () => {
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
      const approval = await funghiContract.approve(
        addr.contractAnt,
        ethers.constants.MaxUint256
      );
      await approval.wait();
    }
    if (eggsLayable > 0) {
      await layEggs();
    }
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.feedQueen(queenInput);
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
    const feromonContract = new ethers.Contract(
      addr.contractFeromon,
      abiFeromon,
      $networkSigner
    );
    const approved = parseFloat(
      ethers.utils.formatEther(
        await feromonContract.allowance($userAddress, addr.contractAnt)
      )
    );
    if (approved < 100) {
      const approval = await feromonContract.approve(
        addr.contractAnt,
        ethers.constants.MaxUint256
      );
      await approval.wait();
    }
    const antContract = new ethers.Contract(
      addr.contractAnt,
      abiANT,
      $networkSigner
    );
    await antContract.queenLevelUp(queenInput);
  };
</script>

<div class="container">
  <!-- <Scoreboard type="population" /> -->
  <div style="height:24px" />
  <!-- <Scoreboard type="male population" />
  <div style="height:24px" />
  <Scoreboard type="princess population" />
  <div style="height:24px" /> -->

  <div class="header">
    <h3>INCUBATION LAB</h3>
  </div>
  <div style="height:8px" />
  <main class="card">
    <div class="header">
      <h3>Larvae</h3>
    </div>
    <Line title="Total larvae:" value={totalLarva} />
    <Line title="Ready to hatch:" value={larvaToHatch} />
    <Line title="Max larvae to hatch:" value={maxHatch} />
    <Line title="Homeless ants:" value={homelessCount} />

    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      All larvae will be incubated for 3 days. User can feed the upcoming larvae
      to hatch to boost their chances to improve offspring rarity.
    </p>
    <div class="inputs-container">
      <input
        type="text"
        placeholder="Amount of Larvae"
        bind:value={larvaInput}
        style="margin-top:8px;"
      />
    </div>
    <div class="buttons" style="margin-top:8px">
      <div
        class={`button-small ${
          funghiAmount > 0 && totalLarva > 0 ? "green" : ""
        }`}
        on:click={feedLarva}
      >
        feed larva
      </div>
      <div class="detail">-> for better ants</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${
          maxHatch > 0 && larvaToHatch > 0 ? "green" : ""
        }`}
        on:click={hatch}
      >
        hatch
      </div>
      <div class="detail">-> to get new ants</div>
    </div>
  </main>
  <div style="height:24px" />
  <main class="card">
    <div class="header">
      <h3>Queen Ants</h3>
    </div>
    {#each queens as queen, index}
      <Line
        title={`Queen #${queen}`}
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
      <div
        class={`button-small ${
          eggsLayable > 0 && queenEggs.length > 0 ? "green" : ""
        }`}
        on:click={feedQueen}
      >
        feed queen
      </div>
      <div class="detail">-> to increase her fertility</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${eggsLayable > 0 ? "green" : ""}`}
        on:click={layEggs}
      >
        claim larvae
      </div>
      <div class="detail">-> to mint larva</div>
    </div>
    <div class="buttons">
      <div
        class={`button-small ${
          queens.length > 0 && feromonAmount > 100 ? "green" : ""
        }`}
        on:click={queenLevelUp}
      >
        upgrade queen
      </div>
      <div class="detail">-> to level her up</div>
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
