<script>
  import Utility from "../Cards/Utility.svelte";
  import Mating from "../Cards/Mating.svelte";

  export let addr;
  export let tournament;
</script>

<main>
  <Utility {addr} {tournament} />
  <Mating {addr} />
</main>
