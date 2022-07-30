<script>
  import Queen from "../Cards/Queen.svelte";
  import Larva from "../Cards/Larva.svelte";

  export let addr;
</script>

<main>
  <Queen {addr} />
  <Larva {addr} />
</main>
