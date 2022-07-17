<script>
  import { networkSigner, userConnected, userAddress } from "../Stores/Network";
  import { Contract, ethers } from "ethers";
  import { abiTournamentFactory } from "../Stores/ABIs";
  import { onMount } from "svelte";

  let title;
  let participants = "";
  let entranceFee;
  let currencyToken;
  let epochDuration;
  let tournamentDuration;
  let userTournaments = [];
  let factoryAddress = "0xF1F2F7d3Bf9f25c5f7f35918630C6Fd571E99082";

  //   onMount(async () => {
  //     if ($userConnected) getUserTournaments();
  //   });

  $: if ($userConnected) {
    getUserTournaments();
  }

  const createTournament = async () => {
    const tournamentFactory = new Contract(
      factoryAddress,
      abiTournamentFactory,
      $networkSigner
    );
    await tournamentFactory.createTournament(
      title,
      participants.split("\n"),
      entranceFee,
      currencyToken,
      epochDuration,
      tournamentDuration
    );
  };

  const getUserTournaments = async () => {
    console.log("Aah I'm getting.");
    const tournamentFactory = new Contract(
      factoryAddress,
      abiTournamentFactory,
      $networkSigner
    );
    userTournaments = await tournamentFactory.getTournaments();
    console.log(userTournaments);
  };
</script>

<div class="container">
  <div class="header">
    <h3>GENESIS ROUND</h3>
  </div>
  <div style="height: 8px" />
  <main class="card">
    <p class="detail">Create a tournament with frens.</p>
    <input type="text" placeholder="Tournament Title" bind:value={title} />
    <textarea
      rows="5"
      cols="60"
      name="text"
      placeholder="Enter addresses (1 address each line)"
      bind:value={participants}
    />
    <input type="text" placeholder="Entrance Fee" bind:value={entranceFee} />
    <input
      type="text"
      placeholder="Currency Token"
      bind:value={currencyToken}
    />
    <input
      type="text"
      placeholder="Epoch Duration"
      bind:value={epochDuration}
    />
    <input
      type="text"
      placeholder="Tournament Duration"
      bind:value={tournamentDuration}
    />
    <div class="buttons" style="margin-top:8px">
      <div class="button-small" on:click={createTournament}>
        create tournament
      </div>
      <div class="detail">-> do it</div>
    </div>
  </main>
  <div style="height: 20px" />
  <main class="card">
    {#each userTournaments as t}
      <div class="tournaments">
        <p class="small">{t}</p>
        <a href="#/dashboard/{t}">
          <div class="button-small">enter tournament</div>
        </a>
      </div>
    {/each}
  </main>
</div>

<style>
  .container {
    width: 480px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }
  main {
    align-items: flex-start;
  }
  input,
  textarea {
    margin-top: 8px;
    font-family: inherit;
    border: 1px solid #666666;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0);
    color: #ffffff;
    width: 100%;
    padding: 4px 8px;
  }
  .card {
    width: 100%;
  }
  .tournaments {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
</style>
