<script>
    import First from './First.svelte'
    import Second from './Second.svelte';
    import Third from './Third.svelte'
</script>

<main>
    <First />
    <Second />
    <Third />
</main>


<style>
    main{
        display:flex;
        flex-direction: row;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
        max-width: 95%;
    }
</style>
