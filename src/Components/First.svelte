<script>
    import Line from "./Line.svelte";
</script>

<div class="container">
    <div class="header">
        <h3>STATS / UTILITIES</h3>
    </div>
    <div style="height:8px"></div>
    <main class="card">
        <Line title="Funghi" value="432423"></Line>
        <Line title="Feromons" value="42"></Line>
        <Line title="Population" value="1423"></Line>
        <Line title="Fertility rate" value="1.2/day"></Line>
        <Line title="Production rate" value="2.1/day"></Line>
        <Line title="Building rate" value="0.3day"></Line>
    </main>
    <div style="height:24px"></div>
    <main class="card">
        <div class="header">
            <h3>Mating</h3>
        </div>
        <Line title="Total males" value="7"></Line>
        <Line title="Total princesses" value="5"></Line>
        <Line title="Claimable queens" value="3"></Line>
        <p class="detail">--------------------------------------------</p>
        <p class="detail">Burn a pair of male & princess to mate them. Mating takes 1 day and mints a Queen Ant.</p>
        <input type='text' placeholder="Amount of Ant Pairs" style="margin-top:8px">
        <div class="buttons" style="margin-top:8px">
            <div class="button-small">mate pair</div>
            <div class="detail">--> and then --></div>
            <div class="button-small">claim queen</div>
        </div>
    </main>
    <div style="height:24px"></div>
    <main class="card">
        <div class="header">
            <h3>Building Blocks</h3>
        </div>
        <Line title="Block #135" value="7/20"></Line>
        <Line title="Block #245" value="0/10"></Line>
        <Line title="Block #523" value="0/10"></Line>
        <p class="detail" style="margin-top:8px">--------------------------------------------</p>
        <p class="detail">Worker Ants need housing to hatch. 1 block houses 10 Worker Ants. </p>
        <input type='text' placeholder="Id of Building Block" style="margin-top:8px">
        <div class="buttons" style="margin-top:8px">
            <div class="button-small">start building</div>
            <div class="detail">--> and then --></div>
            <div class="button-small">merge</div>
        </div>
    </main>
</div>

<style>
    main{
        display:flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        width: 320px;
        z-index: 11;
    }
</style>