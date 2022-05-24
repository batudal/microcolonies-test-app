<script>
    import { connectWallet, disconnectWallet, userConnected, userAddress} from '../Stores/Network'
</script>

<main>
    <div style="height: 24px"></div>
    <div class="bar">
        <a href="#/dashboard"><img src="/images/logo.svg" alt=""></a>
        <div class="filler"></div>
        <a href="#/marketplace"><p class="nav">token</p></a>
        <a href="#/createlisting"><p class="nav">marketplace</p></a>
        <p>|</p>
        <p class="nav" on:click={$userConnected ? disconnectWallet : connectWallet}>
            {#if $userConnected}
                {$userAddress.substring(0,4)}
            {:else}
                connect
            {/if}
        </p>
    </div>
</main>


<style>
    main{
        display:flex;
        flex-direction: column;
        z-index: 1;
    }
    .bar{
        height: 28px;
        display: flex;
        flex-direction: row;
        align-items: center;
        width:1240px;
        justify-content: space-between;
        gap:16px
    }
    .filler{
        flex:1
    }
    .nav:hover{
        background-color: #dedede;
        color: #070707;
        cursor: pointer;
        font-weight: 700;
    }
</style>