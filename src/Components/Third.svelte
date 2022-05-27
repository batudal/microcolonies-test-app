<script>
    import Line from "./Line.svelte";
    import { onMount } from "svelte"
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

    let totalLarva;

    let larvaInput;
    let queens = [];
    let queenLevels = [];

    let queenInput;

    const fetchUserData = async () => {
        if($userConnected) {
            const larvaContract = new ethers.Contract(addr.larva, abiLarva, $networkProvider);
            totalLarva = (await larvaContract.getLarvae()).length;
            totalLarva = totalLarva > 0 ? totalLarva : 0;

            const queenContract = new ethers.Contract(addr.queen, abiQueen, $networkProvider);
            queens = await queenContract.getQueens();

            for (let i; i < queens.length; i++) {
                queenLevels[i] = await queenContract.idToLevel(queens[i]);
            }

        }
    }
    setInterval(() => {
        fetchUserData();
    }, 10000);
    onMount(async () => {
        await fetchUserData();
    })

    const feedLarva = async () => {
        const larvaContract = new ethers.Contract(addr.larva, abiLarva, $networkSigner);
        await larvaContract.feedLarva(larvaInput)
    }
    const hatch = async () => {
        const larvaContract = new ethers.Contract(addr.larva, abiLarva, $networkSigner);
        await larvaContract.hatch(larvaInput)
    }
    const feedQueen = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.feedQueen(queenInput)
    }
    const layEggs = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.layEggs(queenInput)
    }
    const queenLevelUp = async () => {
        const queenContract = new ethers.Contract(addr.queen, abiQueen, $networkSigner);
        await queenContract.queenLevelup(queenInput)
    }
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
        <Line title="Total larvae:" value={totalLarva}></Line>
        <!-- <Line title="Ready to hatch::" value="3"></Line> -->
        <p class="detail">--------------------------------------------</p>
        <p class="detail">All larvae will be incubated for 3 days. User can feed the upcoming larvae to hatch to boost their chances to improve offspring rarity.</p>
        <div class="inputs-container">
            <input type='text' placeholder="Amount of Larvae" bind:value={larvaInput} style="margin-top:8px;">
        </div>
        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={feedLarva}>feed larva</div>
            <div class="detail">-> and then -></div>
            <div class="button-small" on:click={hatch}>hatch</div>
        </div>
    </main>
    <div style="height:24px"></div>
    <main class="card">
        <div class="header">
            <h3>Queen Ants</h3>
        </div>
        {#each queens as queen, index}
            <Line title={`Queen #${queen}`} value={`Level ${queenLevels[index]}- Eggs`}></Line>
        {/each}
        <p class="detail">--------------------------------------------</p>
        <p class="detail">Boosting Queen Ant’s fertility costs $FUNGHI. For 1% increase it costs ~12 $FUNGHI.</p>
        <input type='text' placeholder="Id of Queen Ant" bind:value={queenInput} style="margin-top:8px">
        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={feedQueen}>feed queen</div>
            <div class="detail">--> to increase her fertility</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={layEggs}>claim larva</div>
            <div class="detail">--> to mint larva</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={queenLevelUp}>upgrade queen</div>
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