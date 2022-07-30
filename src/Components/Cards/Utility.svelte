<script>
  import Line from "../UI/Line.svelte";
  import {
    userConnected,
    userAddress,
    networkProvider,
    networkSigner,
  } from "../../Stores/Network";
  import { ethers } from "ethers";
  import {
    abiFunghi,
    abiFeromon,
    abiANT,
    abiTournament,
    abiLollipop,
  } from "../../Stores/ABIs";

  export let addr;
  export let tournament;

  let funghiBalance = "N/A";
  let lollipopBalance = "N/A";
  let feromonBalance = "N/A";
  let totalPopulation = "N/A";
  let nestCapacity;
  let nickname = "";

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
      totalPopulation = await antContract.getPopulation();
      nestCapacity = await antContract.playerToCapacity($userAddress);
    }
  };
  setInterval(() => {
    fetchUserData();
  }, 10000);
  $: $userConnected ? fetchUserData() : "";

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
  <div style="height:24px" />
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
      Welcome Fren. This game is in testing phase. Feel free to mint some larvae
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
