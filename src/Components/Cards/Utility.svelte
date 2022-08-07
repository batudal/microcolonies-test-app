<script>
  import Line from "../UI/Line.svelte";
  import { userConnected, userAddress, networkProvider, networkSigner } from "../../Stores/Network";
  import { ethers } from "ethers";
  import { abiFunghi, abiFeromon, abiANT, abiTournament, abiLollipop } from "../../Stores/ABIs";

  export let addr;
  export let tournament;

  let funghiBalance = "N/A";
  let lollipopBalance = "N/A";
  let feromonBalance = "N/A";
  let totalPopulation = "N/A";
  let nestCapacity;
  let nickname = "";
  let setNickname;
  let entering = false;
  let boosting = false;
  let startDate = 0;
  let speed = 1;
  let lollipopTimeleft;

  $: secondsUntilStart = startDate - now;

  let now;
  setInterval(() => {
    now = parseInt(Date.now() / 1000);
  }, 1000);

  const fetchUserData = async () => {
    if ($userConnected) {
      const funghiContract = new ethers.Contract(addr.contractFunghi, abiFunghi, $networkProvider);
      funghiBalance = ethers.utils.formatEther(await funghiContract.balanceOf($userAddress));
      const feromonContract = new ethers.Contract(addr.contractFeromon, abiFeromon, $networkProvider);
      feromonBalance = ethers.utils.formatEther(await feromonContract.balanceOf($userAddress));
      const antContract = new ethers.Contract(addr.contractAnt, abiANT, $networkSigner);
      const lollipopContract = new ethers.Contract(addr.contractLollipop, abiLollipop, $networkSigner);
      lollipopBalance = await lollipopContract.balanceOf($userAddress);
      totalPopulation = await antContract.getPopulation();
      nestCapacity = await antContract.playerToCapacity($userAddress);
      const tournamentContract = new ethers.Contract(tournament, abiTournament, $networkProvider);
      setNickname = await tournamentContract.getNickname($userAddress);
      startDate = parseInt(await tournamentContract.startDate());
      speed = parseInt(await antContract.getSpeed($userAddress));
      lollipopTimeleft = parseInt(await lollipopContract.getTimeLeft($userAddress));
      console.log("timeleft:", lollipopTimeleft);
      console.log("speed", speed);
    }
  };
  setInterval(() => {
    fetchUserData();
  }, 10000);
  $: $userConnected ? fetchUserData() : "";

  const enterTournament = async () => {
    entering = true;
    const tournamentContract = new ethers.Contract(tournament, abiTournament, $networkSigner);
    try {
      const entertx = await tournamentContract.enterTournament(nickname);
      await entertx.wait();
    } catch (e) {
      console.log(e);
      entering = false;
    }
    await fetchUserData();
    entering = false;
  };
  const activateLollipop = async () => {
    boosting = true;
    const lollipopContract = new ethers.Contract(addr.contractLollipop, abiLollipop, $networkSigner);
    try {
      const boosttx = await lollipopContract.activate($userAddress);
      await boosttx.wait();
    } catch (e) {
      console.log(e);
      boosting = false;
    }
    await fetchUserData();
    boosting = false;
  };
</script>

<div class="container">
  <div style="height:24px" />
  {#if setNickname != ""}
    <div class="header">
      <h3>WELCOME {setNickname?.toString().toUpperCase()}</h3>
      {#if speed == 2}
        <p class="detail">
          2x speed! ⚡⚡⚡ {`${parseInt(lollipopTimeleft / 3600)}h ${parseInt(lollipopTimeleft / 60) % 60}m left`}
        </p>
      {/if}
    </div>
  {:else}
    <div class="header">
      <h3>
        {`${
          secondsUntilStart > 0
            ? parseInt(secondsUntilStart / 3600) +
              "H " +
              (parseInt(secondsUntilStart / 60) % 60) +
              "M " +
              parseInt(secondsUntilStart % 60) +
              "S UNTIL START"
            : "YOU MAY ENTER ANON"
        }`}
      </h3>
    </div>
  {/if}
  <div style="height:8px" />
  <main class="card">
    <Line title="Funghi" value={funghiBalance} />
    <Line title="Feromons" value={feromonBalance} />
    <Line title="Population / Capacity" value={`${totalPopulation}/${nestCapacity}`} />
    <p class="detail">--------------------------------------------</p>
    <p class="detail">
      Welcome Fren. This game is in testing phase. Feel free to mint some larvae and start multiplying.
    </p>
    {#if setNickname == ""}
      <input type="text" placeholder="Nickname" style="margin-top:8px" bind:value={nickname} />
    {/if}
    {#if setNickname == "" || lollipopBalance > 0}
      <div class="buttons" style="margin-top:8px">
        {#if entering}
          <p class="notification">Entering tournament...</p>
        {:else if setNickname == ""}
          <div class={`button-small green`} on:click={enterTournament}>enter tournament</div>
          <div class="detail">-> let's go</div>
        {/if}
      </div>
      <div class="buttons">
        {#if boosting}
          <p class="notification">Using lollipop...</p>
        {:else if lollipopBalance > 0}
          <div class={`button-small green`} on:click={activateLollipop}>use lollipop</div>
          <div class="detail">-> to speed up missions</div>
        {/if}
      </div>
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
  .header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
</style>
