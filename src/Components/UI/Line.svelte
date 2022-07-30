<script>
  export let title;
  export let value = 0;
  export let winner = false;
</script>

<div class="line">
  <p class={`small ${winner ? "winner" : ""}`}>{title}</p>
  <p class={`small ${winner ? "winner" : ""}`}>{value}</p>
</div>

<style>
  .winner {
    color: #00ff6a;
    font-weight: 700;
  }
</style>
