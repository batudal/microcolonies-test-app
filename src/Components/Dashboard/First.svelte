<script>
  import Utility from "../Cards/Utility.svelte";
  import Mating from "../Cards/Mating.svelte";
  import Scoreboard from "../Cards/Scoreboard.svelte";

  export let addr;
  export let tournament;
  let type = "funghi";
</script>

<main>
  <Scoreboard {addr} {type} />
  <Utility {addr} {tournament} />
  <Mating {addr} />
</main>
