<script>
  import { networkSigner, networkProvider, userConnected } from "../Stores/Network";
  import { Contract } from "ethers";
  import { abiTournament, abiTournamentFactory } from "../Stores/ABIs";

  let title;
  let participants = "";
  let entranceFee;
  let currencyToken;
  let epochDuration;
  let tournamentDuration;
  let userTournaments = [];
  let titles = [];
  let creating = false;
  let factoryAddress = "0xC5793f32BE606A58E6431729Abb0fd3abfDbb4D6";
  let startDate = "";

  $: if ($userConnected) {
    getUserTournaments();
  }

  setInterval(() => {
    if ($userConnected) getUserTournaments();
  }, 10000);

  const createTournament = async () => {
    creating = true;
    const tournamentFactory = new Contract(factoryAddress, abiTournamentFactory, $networkSigner);
    try {
      const createtx = await tournamentFactory.createTournament(
        title,
        participants.split("\n"),
        entranceFee,
        currencyToken,
        epochDuration,
        tournamentDuration,
        startDate
      );
      await createtx.wait();
    } catch (e) {
      console.log(e);
      creating = false;
    }
    creating = false;
  };

  const getUserTournaments = async () => {
    let _titles = [];
    const tournamentFactory = new Contract(factoryAddress, abiTournamentFactory, $networkSigner);
    userTournaments = await tournamentFactory.getUserTournaments();
    for (let i = 0; i < userTournaments.length; i++) {
      const tournamentContract = new Contract(userTournaments[i], abiTournament, $networkProvider);
      let _title;
      try {
        _title = await tournamentContract.tournamentTitle();
      } catch (e) {
        console.log(e);
        _title = "";
      }
      _titles = [..._titles, _title];
      titles = _titles;
    }
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
    <input type="text" placeholder="Currency Token" bind:value={currencyToken} />
    <input type="text" placeholder="Epoch Duration" bind:value={epochDuration} />
    <input type="text" placeholder="Tournament Duration" bind:value={tournamentDuration} />
    <input type="text" placeholder="Starting Date (unix seconds)" bind:value={startDate} />
    <div class="buttons" style="margin-top:8px">
      {#if creating}
        <p class="notification">Creating new tournament...</p>
      {:else}
        <div class="button-small" on:click={createTournament}>create tournament</div>
        <div class="detail">-> do it</div>
      {/if}
    </div>
  </main>
  <div style="height: 20px" />
  <main class="card">
    {#each userTournaments as t, i}
      <div style="height:8px" />
      <div class="tournaments">
        <p class="small">{titles[i]}</p>
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
