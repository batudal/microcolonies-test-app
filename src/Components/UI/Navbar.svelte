<script>
  import {
    connectWallet,
    disconnectWallet,
    userConnected,
    userAddress,
  } from "../../Stores/Network";
  import { onMount, onDestroy } from "svelte";

  onMount(() => {
    setTime();
  });

  const interval = setInterval(() => {
    setTime();
  }, 1000);
  onDestroy(() => {
    clearInterval(interval);
  });

  let distance;
  let now;
  let days;
  let hours;
  let minutes;
  let seconds;
  let raceFinished;
  const setTime = () => {
    now = new Date().getTime();
    distance = parseInt(1657393225 * 1000 - now) / 1000;
    if (distance > 0) {
      hours = Math.floor(distance / 3600) % 24;
      days = Math.floor(distance / (3600 * 24));
      minutes = Math.floor(distance / 60) % 60;
      seconds = Math.floor(distance) % 60;
    } else {
      raceFinished = true;
    }
  };
</script>

<main>
  <div style="height: 24px" />
  <div class="bar">
    <a href="#/"><img src="/images/logo.svg" alt="" /></a>
    <!-- <p>
      Tournament ends in: <span>{days}d {hours}h {minutes}m {seconds}s</span>
    </p> -->
    <div class="filler" />
    <a
      href="https://degen-fyi.notion.site/A-N-T-f55111a055c24c69af3b920d129d1d87"
      target="_blank"><p class="nav">notion page</p></a
    >
    <p>|</p>
    <p class="nav" on:click={$userConnected ? disconnectWallet : connectWallet}>
      {#if $userConnected}
        {$userAddress.substring(0, 4)}
      {:else}
        connect
      {/if}
    </p>
  </div>
  <div style="height:24px; width: 100%" />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
  }
  .bar {
    width: 1240px;
    max-width: 90%;
    height: 28px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .filler {
    flex: 1;
  }
  .nav:hover {
    background-color: #dedede;
    color: #070707;
    cursor: pointer;
    font-weight: 700;
  }
</style>
