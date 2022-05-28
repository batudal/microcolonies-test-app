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

    let funghiBalance = "N/A";
    let feromonBalance = "N/A";
    let workerBalance = "N/A";
    let soldierBalance= "N/A";
    let queenBalance = "N/A";
    let larvaBalance= "N/A";
    let maleBalance = "N/A";
    let princessBalance = "N/A";
    let totalPopulation = "N/A";

    let mateInput, queenInput, buildingInput;
    let claimableQueens = "N/A";

    let blocks= [];
    let blockCapacities = [];

    const fetchUserData = async () => {
        if($userConnected) {
            const funghiContract = new ethers.Contract(addr.funghi, abiFunghi, $networkProvider);
            funghiBalance = ethers.utils.formatEther(await funghiContract.balanceOf($userAddress));
            const feromonContract = new ethers.Contract(addr.feromon, abiFeromon, $networkProvider);
            feromonBalance = ethers.utils.formatEther(await feromonContract.balanceOf($userAddress));
            const workerContract = new ethers.Contract(addr.worker, abiWorker, $networkProvider);
            workerBalance = parseInt(await workerContract.balanceOf($userAddress));
            const soldierContract = new ethers.Contract(addr.soldier, abiSoldier, $networkProvider);
            soldierBalance = parseInt(await soldierContract.balanceOf($userAddress));
            const queenContract = new ethers.Contract(addr.queen, abiQueen, $networkProvider);
            queenBalance = parseInt(await queenContract.balanceOf($userAddress));
            const larvaContract = new ethers.Contract(addr.larva, abiLarva, $networkProvider);
            larvaBalance = parseInt(await larvaContract.balanceOf($userAddress));
            const maleContract = new ethers.Contract(addr.male, abiMale, $networkProvider);
            maleBalance = parseInt(await maleContract.balanceOf($userAddress));
            const princessContract = new ethers.Contract(addr.princess, abiPrincess, $networkProvider);
            princessBalance = parseInt(await princessContract.balanceOf($userAddress));
            totalPopulation = workerBalance + soldierBalance + queenBalance + larvaBalance + maleBalance;
            claimableQueens = await princessContract.getMatedPrincesses($userAddress);
            claimableQueens = claimableQueens.length > 0 ? parseInt(claimableQueens) : 0;
            
            const buildingContract = new ethers.Contract(addr.buildingblock, abiBB, $networkProvider);
            blocks = await buildingContract.getBuildingBlocks($userAddress)
            for (let i; i < blocks.length; i++) {
                blockCapacities[i] = await buildingContract.idToCapacity(blocks[i])
            }
        }
    }
    setInterval(() => {
        fetchUserData();
    }, 10000);
    onMount(async () => {
        await fetchUserData();
    })

    const mate = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.mateMalePrincess(mateInput)
    }
    const claimQueen = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.claimQueen(queenInput)
    }
    const houseWorkers = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.houseWorkers(buildingInput)
    }
</script>

<div class="container">
    <div class="header">
        <h3>STATS / UTILITIES</h3>
    </div>
    <div style="height:8px"></div>
    <main class="card">
        <Line title="Funghi" value={funghiBalance}></Line>
        <Line title="Feromons" value={feromonBalance}></Line>
        <Line title="Population" value={totalPopulation}></Line>
    </main>
    <div style="height:24px"></div>

    <main class="card">
        <div class="header">
            <h3>Mating</h3>
        </div>
        <Line title="Total males" value={maleBalance}></Line>
        <Line title="Total princesses" value={princessBalance}></Line>
        <Line title="Claimable queens" value={claimableQueens}></Line>
        <p class="detail">--------------------------------------------</p>
        <p class="detail">Burn a pair of male & princess to mate them. Mating takes 1 day and mints a Queen Ant.</p>
        <input type='text' placeholder="Amount of Ant Pairs / Queens" style="margin-top:8px" bind:value={mateInput}>
        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={mate}>mate pair</div>
            <div class="detail">--> and then --></div>
            <div class="button-small" on:click={claimQueen}>claim queen</div>
        </div>
    </main>
    <div style="height:24px"></div>
    <main class="card">
        <div class="header">
            <h3>Building Blocks</h3>
        </div>
        {#each blocks as block }
            <Line title={"Block #"+{block}} value="7/20"></Line>
        {/each}
        <p class="detail" style="margin-top:8px">--------------------------------------------</p>
        <p class="detail">Worker Ants need housing to hatch. 1 block houses 10 Worker Ants. </p>
        <input type='text' placeholder="Id of Building Block" bind:value={buildingInput} style="margin-top:8px">
        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={houseWorkers}>start building</div>
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