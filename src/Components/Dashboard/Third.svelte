<script>
  import Queen from "../Cards/Queen.svelte";
  import Larva from "../Cards/Larva.svelte";

  export let addr;
  export let tournament;
</script>

<main>
  <Queen {addr} />
  <Larva {addr} {tournament} />
</main>
