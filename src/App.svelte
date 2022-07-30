<script>
  import Router from "svelte-spa-router";
  import Dashboard from "./Components/Dashboard/Dashboard.svelte";
  import Navbar from "./Components/UI/Navbar.svelte";
  import Warning from "./Components/Warning.svelte";
  import { userConnected, chainID } from "./Stores/Network";
  import Tournament from "./Components/Tournament.svelte";

  const routes = {
    "/dashboard/:tournament": Dashboard,
    "/": Tournament,
  };
</script>

<main>
  <Navbar />
  <!-- <Warning /> -->
  <!-- {#if !$userConnected || $chainID == 137} -->
  <Router {routes} />
  <!-- {/if} -->
</main>

<style>
  main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
