<script>
    import Line from "./Line.svelte";
</script>

<div class="container">
    <div class="header">
        <h3>INCUBATION LAB</h3>
    </div>
    <div style="height:8px"></div>
    <main class="card">
        <div class="header">
            <h3>Larvae</h3>
        </div>
        <Line title="Total larvae:" value="16"></Line>
        <Line title="Ready to hatch::" value="3"></Line>
        <p class="detail">--------------------------------------------</p>
        <p class="detail">All larvae will be incubated for 3 days. User can feed the upcoming larvae to hatch to boost their chances to improve offspring rarity.</p>
        <div class="inputs-container">
            <input type='text' placeholder="Amount of Larvae" style="margin-top:8px;">
        </div>
        <div class="buttons" style="margin-top:8px">
            <div class="button-small">feed larva</div>
            <div class="detail">-> and then -></div>
            <div class="button-small">hatch</div>
        </div>
    </main>
    <div style="height:24px"></div>
    <main class="card">
        <div class="header">
            <h3>Queen Ants</h3>
        </div>
        <Line title="Queen #134" value="Level 1 - 56% Fertility"></Line>
        <Line title="Queen #235" value="Level 1 - 34% Fertility"></Line>
        <Line title="Queen #456" value="Level 1 - 99% Fertility"></Line>
        <Line title="Queen #765" value="Level 1 - 99% Fertility"></Line>
        <p class="detail">--------------------------------------------</p>
        <p class="detail">Boosting Queen Ant’s fertility costs $FUNGHI. For 1% increase it costs ~12 $FUNGHI.</p>
        <input type='text' placeholder="Id of Queen Ant" style="margin-top:8px">
        <div class="buttons" style="margin-top:8px">
            <div class="button-small">feed queen</div>
            <div class="detail">--> to increase her fertility</div>
        </div>
        <div class="buttons">
            <div class="button-small">claim larva</div>
            <div class="detail">--> to mint larva</div>
        </div>
        <p class="detail">Boosting Queen Ant’s fertility costs $FUNGHI. For 1% increase it costs ~12 $FUNGHI.</p>
        <input type='text' placeholder="Id of Queen Ant" style="margin-top:8px">
        <div class="buttons">
            <div class="button-small">upgrade queen</div>
            <div class="detail">--> to level her up</div>
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
    .inputs-container{
        width: 100%;
        display:flex;
        flex-direction: row;
        justify-content: space-between;
    }
</style>