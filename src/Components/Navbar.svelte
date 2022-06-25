<script>
  import {
    connectWallet,
    disconnectWallet,
    userConnected,
    userAddress,
  } from "../Stores/Network";
</script>

<main>
  <div style="height: 24px" />
  <div class="bar">
    <a href="#/"><img src="/images/logo.svg" alt="" /></a>
    <div class="filler" />
    <a
      href="https://degen-fyi.notion.site/A-N-T-f55111a055c24c69af3b920d129d1d87"
      target="_blank"><p class="nav">notion page</p></a
    >
    <!-- <a href="#/createlisting"><p class="nav">marketplace</p></a> -->
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
