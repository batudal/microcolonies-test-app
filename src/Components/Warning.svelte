<script>
  import { chainID, userConnected, networkInstance } from "../Stores/Network";
  import polygon from "../Stores/Chains";

  const switchNetwork = async () => {
    try {
      const RequestArguments = {
        method: "wallet_switchEthereumChain",
        params: [{ chainId: polygon.options.params[0].chainId }],
      };
      await $networkInstance.request(RequestArguments);
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request(polygon.options);
        } catch (addError) {}
      }
      if (switchError.code === 4001) {
        chainID.set(0); // lame trigger
        chainID.set(await ethereum.request({ method: "eth_chainId" }));
      }
      // handle other "switch" errors
    }
    window.location.reload();
  };
</script>

{#if $userConnected && $chainID != 137}
  <div class="container">
    <main class="card">
      <p class="detail">You're not on the correct network.</p>
      <div class="buttons" style="margin-top:8px">
        <div class="button-small" on:click={switchNetwork}>
          connect to polygon
        </div>
        <div class="detail">--> do it</div>
      </div>
    </main>
  </div>
{/if}

<style>
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
