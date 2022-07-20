<script>
  import { ethers } from "ethers";
  import { networkProvider } from "../Stores/Network";
  import { abiTournament } from "../Stores/ABIs";
  import First from "./First.svelte";
  import Second from "./Second.svelte";
  import Third from "./Third.svelte";

  export let params = {};
  let addr = {};
  const getContracts = async () => {
    const tournamentContract = new ethers.Contract(
      params.tournament,
      abiTournament,
      $networkProvider
    );
    addr = await tournamentContract.contracts();
    return addr;
  };
  let promise = getContracts();
</script>

<main>
  {#await promise}
    <p>...waiting</p>
  {:then addr}
    <div class="container">
      <First {addr} tournament={params.tournament} />
      <Second {addr} />
      <Third {addr} />
      <div style="height: 120px; width:100%" />
    </div>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    max-width: 95%;
  }
  .container {
    display: flex;
    flex-direction: row;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
