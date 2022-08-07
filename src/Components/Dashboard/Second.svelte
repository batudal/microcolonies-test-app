<script>
  import Worker from "../Cards/Worker.svelte";
  import Soldier from "../Cards/Soldier.svelte";
  import Scoreboard from "../Cards/Scoreboard.svelte";

  export let addr;
  export let tournament;
  let type = "feromon";
</script>

<main>
  <Scoreboard {addr} {type} />
  <Worker {addr} />
  <Soldier {addr} {tournament} />
</main>
