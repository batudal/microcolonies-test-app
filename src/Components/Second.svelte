<script>
    import Line from "./Line.svelte";
    import { userConnected, userAddress, networkProvider, networkSigner} from '../Stores/Network'
    import { ethers } from 'ethers'
    import { addr } from "../Stores/Addresses"
    import { 
        abiWorker, 
        abiSoldier,
        abiANT} from "../Stores/ABIs"
    
    let workerInput;
    let soldierInput;
    let availableWorkers = "N/A";
    let homelessWorkers = "N/A"
    let totalWorkers = "N/A";
    let totalSoldiers  = "N/A";
    let availableSoldiers  = "N/A";

    let zombieSoldiers  = "N/A";
    let infectedSoldiers = "N/A"

    $: $userConnected ? fetchUserData() : "";
    $: occupiedWorkers = totalWorkers - availableWorkers
    $: occupiedSoldiers = totalSoldiers - availableSoldiers - zombieSoldiers

    const fetchUserData = async () => {
        if($userConnected) {
            const workerContract = new ethers.Contract(addr.worker, abiWorker, $networkProvider);
            totalWorkers = (await workerContract.getWorkers($userAddress)).length;
            availableWorkers = (await workerContract.getAvailableWorkers($userAddress)).length;
            homelessWorkers = (await workerContract.getUnHousedWorkers($userAddress)).length;

            const soldierContract = new ethers.Contract(addr.soldier, abiSoldier, $networkProvider);
            totalSoldiers = (await soldierContract.getSoldiers($userAddress)).length;
            console.log("Total soldiers: ", totalSoldiers)
            availableSoldiers = (await soldierContract.getAvailableSoldiers($userAddress)).length;
            console.log("Available soldiers: ", availableSoldiers)
            zombieSoldiers = (await soldierContract.getZombieSoldiers($userAddress)).length;
            console.log("Zombie soldiers: ", zombieSoldiers)
            infectedSoldiers = (await soldierContract.getInfectedSoldiers($userAddress)).length;
            console.log("Infected soldiers: ", infectedSoldiers)

        }
    }
    setInterval(() => {
        fetchUserData();
    }, 10000);

    const gatherBlocks = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.sendWorkerToBuild(workerInput);
    }

    const claimBlocks = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.claimBuildingBlock();
    }

    const gatherFood = async () => {
        const workerContract = new ethers.Contract(addr.worker, abiWorker, $networkSigner);
        const approved = await workerContract.isApprovedForAll($userAddress, addr.ant);
        if (!approved) {
            const approval = await workerContract.setApprovalForAll(addr.ant,true);
            await approval.wait();
        }
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.stakeWorker(workerInput);
    }
    const gatherProtectedFood = async () => {
        const workerContract = new ethers.Contract(addr.worker, abiWorker, $networkSigner);
        const approved = await workerContract.isApprovedForAll($userAddress, addr.ant);
        if (!approved) {
            const approval = await workerContract.setApprovalForAll(addr.ant,true);
            await approval.wait();
        }
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.stakeProtectedWorker(workerInput);
    }
    const claimFunghi = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.claimFunghi();
    }

    const sendToRaid = async () => {
        const soldierContract = new ethers.Contract(addr.soldier, abiSoldier, $networkSigner);
        const approved = await soldierContract.isApprovedForAll($userAddress, addr.ant);
        if (!approved) {
            const approval = await soldierContract.setApprovalForAll(addr.ant,true);
            await approval.wait();
        }
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
        <Line title="Homeless worker ants:" value={homelessWorkers}></Line>

        <p class="detail">--------------------------------------------</p>
        <p class="detail">Gathering building parts occupy your worker ants for 7 days. Gathering food occupy your worker ants for 1 day. Each mission reduces worker health points by 2.<br/><br/>Soldier can be sent along with worker ants for protection which mitigates 50% of damage taken by worker ants. A soldier can protect up to 10 worker ants.</p>
        <div class="inputs-container">
            <input type='text' placeholder="Amount of Workers" bind:value={workerInput} style="margin-top:8px; max-width:320px">
        </div>

        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={gatherBlocks}>gather blocks</div>
            <div class="detail">--> to have more workers</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={gatherProtectedFood}>gather food</div>
            <div class="detail">--> with soldier protection</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={gatherFood}>gather food</div>
            <div class="detail">--> without soldier protection</div>
        </div>
        <p class="detail">--------------------------------------------</p>
        <div class="buttons">
            <div class="button-small" on:click={claimBlocks}>claim blocks</div>
            <div class="detail">--> 0 claimable</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={claimFunghi}>claim $funghi</div>
            <div class="detail">--> 0 claimable</div>
        </div>

    </main>
    <div style="height:24px"></div>
    <main class="card">
        <div class="header">
            <h3>Soldier Ants</h3>
        </div>
        <Line title="Total soldier ants: " value={totalSoldiers}></Line>
        <Line title="Available soldier ants:" value={availableSoldiers}></Line>
        <Line title="Occupied soldier ants:" value={occupiedSoldiers}></Line>
        <Line title="Infected soldier ants:" value={infectedSoldiers}></Line>
        <Line title="Zombie soldier ants:" value={zombieSoldiers}></Line>

        <p class="detail">--------------------------------------------</p>
        <p class="detail">You can heal infected soldiers but if you ignore them more than 3 days, they will turn into zombie ants, only to be harvested as $FUNGHI.</p>
        <input type='text' placeholder="Amount of Soldiers" bind:value={soldierInput} style="margin-top:8px">
        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={sendToRaid}>send to raid</div>
            <div class="detail">-> to steal larva</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={claimLarva}>claim larva</div>
            <div class="detail">-> 0 claimable</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={healInfected}>heal infected</div>
            <div class="detail">-> to stop spread</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={harvestZombie}>harvest zombie</div>
            <div class="detail">-> to get $funghi rewards</div>
        </div>
    </main>
</div>

<style>
    main{
        display:flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        max-width: 320px;
        
    }
    .inputs-container{
        width: 100%;
        display:flex;
        flex-direction: row;
        justify-content: space-between;
    }
</style>