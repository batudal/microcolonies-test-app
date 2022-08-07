<script>
  import Queen from "../Cards/Queen.svelte";
  import Larva from "../Cards/Larva.svelte";
  import Scoreboard from "../Cards/Scoreboard.svelte";

  export let addr;
  export let tournament;
  let type = "population";
</script>

<main>
  <Scoreboard {addr} {type} />
  <Queen {addr} />
  <Larva {addr} {tournament} />
</main>
