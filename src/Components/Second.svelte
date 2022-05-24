<script>
    import Line from "./Line.svelte";
</script>

<div class="container">
    <div class="header">
        <h3>COMMAND CENTER</h3>
    </div>
    <div style="height:8px"></div>
    <main class="card">
        <div class="header">
            <h3>Worker Ants</h3>
        </div>
        <Line title="Total worker ants:" value="50"></Line>
        <Line title="Available worker ants:" value="16"></Line>
        <Line title="Occupied worker ants:" value="34"></Line>
        <p class="detail">--------------------------------------------</p>
        <p class="detail">Gathering building parts occupy your worker ants for 7 days. Gathering food occupy your worker ants for 1 day. Each mission reduces worker health points by 2.<br/><br/>Soldier can be sent along with worker ants for protection which mitigates 50% of damage taken by worker ants. A soldier can protect up to 10 worker ants.</p>
        <div class="inputs-container">
            <input type='text' placeholder="Worker Amount" style="margin-top:8px; width:150px">
            <input type='text' placeholder="Soldier Amount" style="margin-top:8px; width:150px">
        </div>

        <div class="buttons" style="margin-top:8px">
            <div class="button-small">gather blocks</div>
            <div class="detail">-> and then -></div>
            <div class="button-small">claim blocks</div>
        </div>
        <div class="buttons">
            <div class="button-small">gather food</div>
            <div class="detail">--> and then --></div>
            <div class="button-small">claim $funghi</div>
        </div>
    </main>
    <div style="height:24px"></div>
    <main class="card">
        <div class="header">
            <h3>Soldier Ants</h3>
        </div>
        <Line title="Total soldier ants: " value="25"></Line>
        <Line title="Available soldier ants:" value="15"></Line>
        <Line title="Occupied soldier ants:" value="9"></Line>
        <Line title="Infected soldier ants:" value="3"></Line>
        <Line title="Zombie soldier ants:" value="1"></Line>

        <p class="detail">--------------------------------------------</p>
        <p class="detail">You can heal infected soldiers but if you ignore them more than 3 days, they will turn into zombie ants, only to be harvested as $FUNGHI.</p>
        <input type='text' placeholder="Amount of Soldier Ants" style="margin-top:8px">
        <div class="buttons" style="margin-top:8px">
            <div class="button-small">send to raid</div>
            <div class="detail">--> and then --></div>
            <div class="button-small">claim larva</div>
        </div>
        <div class="buttons">
            <div class="button-small">heal infected</div>
            <div class="detail">-/ or /-</div>
            <div class="button-small">harvest zombie</div>
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