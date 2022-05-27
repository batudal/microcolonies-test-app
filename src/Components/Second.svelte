<script>
    import { onMount } from "svelte"
    import Line from "./Line.svelte";
    import { userConnected, userAddress, networkProvider, networkSigner} from '../Stores/Network'
    import { ethers } from 'ethers'
    import { addr } from "../Stores/Addresses"
    import { 
        abiFunghi, 
        abiFeromon, 
        abiWorker, 
        abiSoldier,
        abiMale,
        abiPrincess,
        abiQueen,
        abiLarva,
        abiANT,
        abiBB } from "../Stores/ABIs"

    let totalWorkers;
    let availableWorkers = [];
    $: occupiedWorkers = totalWorkers - availableWorkers
    
    let workerInput;
    let soldierInput;

    let totalSoldiers;
    let availableSoldiers;
    let zombieSoldiers;

    const fetchUserData = async () => {
        if($userConnected) {
            const workerContract = new ethers.Contract(addr.worker, abiWorker, $networkProvider);
            totalWorkers = parseInt(await workerContract.balanceOf($userAddress));
            availableWorkers = parseInt(await workerContract.getAvailableWorkers());
            availableWorkers = availableWorkers > 0 ? availableWorkers.length : 0;

            const soldierContract = new ethers.Contract(addr.soldier, abiSoldier, $networkProvider);
            totalSoldiers = (await soldierContract.getSoldiers()).length;
            availableSoldiers = (await soldierContract.getAvailableSoldiers()).length;
            zombieSoldiers = (await soldierContract.getZombieSoldiers()).length;
        }
    }
    setInterval(() => {
        fetchUserData();
    }, 10000);
    onMount(async () => {
        await fetchUserData();
    })

    const gatherBlocks = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.sendWorkerToBuild(workerInput);
    }

    const claimBlocks = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.claimBuildingBlock();
    }

    const gatherFood = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.stakeWorker(workerInput);
    }
    const claimFunghi = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.claimFunghi();
    }

    const sendToRaid = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.sendSoldierToRaid(soldierInput);
    }
    const claimLarva = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.claimStolenLarvae();
    }
    const healInfected = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.healSoldier(soldierInput);
    }
    const harvestZombie = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.claimPassiveSoldierReward();
    }
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
        <Line title="Total worker ants:" value={totalWorkers}></Line>
        <Line title="Available worker ants:" value={availableWorkers}></Line>
        <Line title="Occupied worker ants:" value={occupiedWorkers}></Line>
        <p class="detail">--------------------------------------------</p>
        <p class="detail">Gathering building parts occupy your worker ants for 7 days. Gathering food occupy your worker ants for 1 day. Each mission reduces worker health points by 2.<br/><br/>Soldier can be sent along with worker ants for protection which mitigates 50% of damage taken by worker ants. A soldier can protect up to 10 worker ants.</p>
        <div class="inputs-container">
            <input type='text' placeholder="Worker Amount" bind:value={workerInput} style="margin-top:8px; width:320px">
        </div>

        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={gatherBlocks}>gather blocks</div>
            <div class="detail">-> and then -></div>
            <div class="button-small" on:click={claimBlocks}>claim blocks</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={gatherFood}>gather food</div>
            <div class="detail">--> and then --></div>
            <div class="button-small" on:click={claimFunghi}>claim $funghi</div>
        </div>
    </main>
    <div style="height:24px"></div>
    <main class="card">
        <div class="header">
            <h3>Soldier Ants</h3>
        </div>
        <Line title="Total soldier ants: " value={totalSoldiers}></Line>
        <Line title="Available soldier ants:" value={availableSoldiers}></Line>
        <!-- <Line title="Occupied soldier ants:" value="9"></Line>
        <Line title="Infected soldier ants:" value="3"></Line> -->
        <Line title="Zombie soldier ants:" value={zombieSoldiers}></Line>

        <p class="detail">--------------------------------------------</p>
        <p class="detail">You can heal infected soldiers but if you ignore them more than 3 days, they will turn into zombie ants, only to be harvested as $FUNGHI.</p>
        <input type='text' placeholder="Amount of Soldier Ants" bind:value={soldierInput} style="margin-top:8px">
        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={sendToRaid}>send to raid</div>
            <div class="detail">--> and then --></div>
            <div class="button-small" on:click={claimLarva}>claim larva</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={healInfected}>heal infected</div>
            <div class="detail">-/ or /-</div>
            <div class="button-small" on:click={harvestZombie}>harvest zombie</div>
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