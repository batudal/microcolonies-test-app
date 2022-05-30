<script>
	import Router from 'svelte-spa-router'
	import Dashboard from "./Components/Dashboard.svelte"
	import Navbar from './Components/Navbar.svelte'
	import Warning from './Components/Warning.svelte'
	import { userConnected, chainID } from './Stores/Network'
	const routes = {
		'/': Dashboard,
	}
</script>

<main>
	<Navbar/>
	<Warning/>
	{#if !$userConnected || $chainID == 250}
		<Router {routes}/>
	{/if}
</main>

<style>
	main{
		width: 100%;
		height: 100%;
		display:flex;
		flex-direction: column;
		align-items: center;
	}
</style>

