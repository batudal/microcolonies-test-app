<script>
  import Worker from "../Cards/Worker.svelte";
  import Soldier from "../Cards/Soldier.svelte";

  export let addr;
  export let tournament;
</script>

<main>
  <Worker {addr} />
  <Soldier {addr} {tournament} />
</main>
