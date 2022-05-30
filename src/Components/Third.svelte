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
    let larvaToHatch;

    let larvaInput;
    let queens = [];
    let queenLevels = [];
    let queenEggs = [];

    let queenInput;

    const fetchUserData = async () => {
        if($userConnected) {
            const larvaContract = new ethers.Contract(addr.larva, abiLarva, $networkProvider);
            totalLarva = (await larvaContract.getLarvae($userAddress)).length;
            larvaToHatch = parseInt(await larvaContract.getHatchersLength($userAddress));
            const queenContract = new ethers.Contract(addr.queen, abiQueen, $networkProvider);
            queens = await queenContract.getQueens($userAddress);

            for (let i = 0; i < queens.length; i++) {
                queenLevels[i] = await queenContract.idToLevel(queens[i]);
                queenEggs[i] = await queenContract.idToEggs(queens[i]);
                console.log(queenLevels[i])

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
        const funghiContract = new ethers.Contract(addr.funghi, abiFunghi, $networkSigner);
        const approved = parseFloat(ethers.utils.formatEther(await funghiContract.allowance($userAddress, addr.ant)));
        console.log(approved)
        if (approved < larvaInput * 80) {
            const approval = await funghiContract.approve(addr.ant,ethers.constants.MaxUint256);
            await approval.wait();
        }
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.feedLarva(larvaInput)
    }
    const hatch = async () => {
        const antContract = new ethers.Contract(addr.ant, abiANT, $networkSigner);
        await antContract.hatch(larvaInput)
    }
    const feedQueen = async () => {
        const funghiContract = new ethers.Contract(addr.funghi, abiFunghi, $networkSigner);
        const approved = parseFloat(ethers.utils.formatEther(await funghiContract.allowance($userAddress, addr.ant)));
        if (approved < larvaInput * 240) {
            const approval = await funghiContract.approve(addr.ant,ethers.constants.MaxUint256);
            await approval.wait();
        }
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
        <Line title="Ready to hatch:" value={larvaToHatch}></Line>
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
            <Line title={`Queen #${queen}`} value={`Level ${queenLevels[index]} - ${queenEggs[index]} Eggs`}></Line>
        {/each}
        <p class="detail">--------------------------------------------</p>
        <p class="detail">Boosting Queen Ant’s fertility costs $FUNGHI. For 1% increase it costs ~12 $FUNGHI.</p>
        <input type='text' placeholder="Id of Queen" bind:value={queenInput} style="margin-top:8px">
        <div class="buttons" style="margin-top:8px">
            <div class="button-small" on:click={feedQueen}>feed queen</div>
            <div class="detail">--> to increase her fertility</div>
        </div>
        <div class="buttons">
            <div class="button-small" on:click={layEggs}>lay eggs</div>
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
    }
    .inputs-container{
        width: 100%;
        display:flex;
        flex-direction: row;
        justify-content: space-between;
    }
</style>