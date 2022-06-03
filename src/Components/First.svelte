<script>
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

    let mateInput, queenInput,mintInput;
    let claimableQueens = "N/A";
    let claimableMerged = "N/A";

    let blocks= [];
    let blockCapacities = [];
    let blockCumCapacities = [];
    let homelessWorkers;
    let mergeable = false;

    const fetchUserData = async () => {
        if($userConnected) {
            const funghiContract = new ethers.Contract(addr.funghi, abiFunghi, $networkProvider);
            funghiBalance = ethers.utils.formatEther(await funghiContract.balanceOf($userAddress));
            const feromonContract = new ethers.Contract(addr.feromon, abiFeromon, $networkProvider);
            feromonBalance = ethers.utils.formatEther(await feromonContract.balanceOf($userAddress));
            const workerContract = new ethers.Contract(addr.worker, abiWorker, $networkProvider);
            workerBalance = (await workerContract.getWorkers($userAddress)).length;
            homelessWorkers = (await workerContract.getUnHousedWorkers($userAddress)).length;
            const soldierContract = new ethers.Contract(addr.soldier, abiSoldier, $networkProvider);
            soldierBalance = (await soldierContract.getSoldiers($userAddress)).length;
            const queenContract = new ethers.Contract(addr.queen, abiQueen, $networkProvider);
            queenBalance = (await queenContract.getQueens($userAddress)).length;
            const larvaContract = new ethers.Contract(addr.larva, abiLarva, $networkProvider);
            larvaBalance = (await larvaContract.getLarvae($userAddress)).length;
            const maleContract = new ethers.Contract(addr.male, abiMale, $networkProvider);
            maleBalance = (await maleContract.getMales($userAddress)).length;
            const princessContract = new ethers.Contract(addr.princess, abiPrincess, $networkProvider);
            princessBalance = (await princessContract.getPrincesses($userAddress)).length;
            totalPopulation = workerBalance + soldierBalance + queenBalance + larvaBalance + maleBalance;
            claimableQueens = await princessContract.getMatedPrincesses($userAddress);
            claimableQueens = claimableQueens.length > 0 ? parseInt(claimableQueens) : 0;
            
            const buildingContract = new ethers.Contract(addr.buildingblock, abiBB, $networkProvider);
            blocks = await buildingContract.getBuildingBlocks($userAddress)
            for (let i = 0; i < blocks.length; i++) {
                blockCapacities[i] = parseInt(await buildingContract.getResidentCount(blocks[i]))
                blockCumCapacities[i] = parseInt(await buildingContract.idToCumulativeCapacity(blocks[i]))
            }
            // claimableMerged = await buildingContract.getMergedBuildingBlockCount($userAddress);
            // console.log("claimableMerged: ", claimableMerged)
            // mergeable = await buildingContract.idToFull(blocks[0]);
        }
    }
    setInterval(() => {
        fetchUserData();
    }, 10000);
    $: $userConnected ? fetchUserData() : "";

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
        await antContract.houseWorkers()
    }
    const merge = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.mergeBBs()
    }
    const claimBuilding = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.claimUpgradedBuilding()
    }

    const genesisMint = async () => {
        const larvaContract = new ethers.Contract(addr.larva, abiLarva, $networkSigner);
        const _value = 0.0008 * parseFloat(mintInput);
        await larvaContract.genesisMint(mintInput, {
            value: ethers.utils.parseEther(_value.toString())
        })
    }

</script>

<div class="container">
    <div class="header">
        <h3>GENESIS ROUND</h3>
    </div>
    <div style="height:8px"></div>
    <main class="card">
        <Line title="Funghi" value={funghiBalance}></Line>
        <Line title="Feromons" value={feromonBalance}></Line>
        <Line title="Population" value={totalPopulation}></Line>
        <p class="detail">--------------------------------------------</p>
        <p class="detail">Welcome Fren. This game is alpha test mode. Feel free to mint some larvae and start multiplying.</p>
        <input type='text' placeholder="Amount of Larvae" style="margin-top:8px" bind:value={mintInput}>
        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={genesisMint}>genesis mint</div>
            <div class="detail">--> unlimited for fast test</div>
        </div>
    </main>
    <div style="height:24px"></div>
    <div class="header">
        <h3>UTILITIES</h3>
    </div>
    <div style="height:8px"></div>
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
            <div class="detail">--> to create a queen</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={claimQueen}>claim queen</div>
            <div class="detail">--> and start producing</div>
        </div>
    </main>
    <div style="height:24px"></div>
    <main class="card">
        <div class="header">
            <h3>Building Blocks</h3>
        </div>
        {#each blocks as block, index}
            <Line title={"Block #"+ parseInt(block)} value={"Available "+blockCapacities[index] + "/" + blockCumCapacities[index]}></Line>
        {/each}
        <p class="detail" style="margin-top:8px">--------------------------------------------</p>
        <p class="detail">Worker Ants need housing to hatch. 1 block houses 10 Worker Ants. </p>
        <div class="buttons" style="margin-top:8px">
            <div class={`button-small ${blockCapacities[0] > 0 && homelessWorkers > 0 ? "green" : ""}`} on:click={houseWorkers}>house workers</div>
            <div class="detail">-> to create space for more</div>
        </div>
        <div class="buttons">
            <div class={`button-small ${mergeable ? "green" : ""}`} on:click={merge}>start merge</div>
            <div class="detail">-> to construct bigger nest</div>
        </div>
        <div class="buttons">
            <div class={`button-small ${claimableMerged > 0 ? "green" : ""}`} on:click={claimBuilding}>claim merged</div>
            <div class="detail">-> {claimableMerged} claimable</div>
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
</style>