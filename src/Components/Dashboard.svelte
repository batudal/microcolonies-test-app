<script>
    import First from './First.svelte'
    import Second from './Second.svelte';
    import Third from './Third.svelte'
</script>

<main>
    <div class="container">
        <First />
        <Second />
        <Third />
    </div>
    <div style="height: 120px; width:100%"></div>
</main>


<style>
    main{
        display:flex;
        flex-direction: column;
        max-width: 95%;
    }
    .container{
        display:flex;
        flex-direction: row;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
    }
</style>
