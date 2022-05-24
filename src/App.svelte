<script>
	import Router from 'svelte-spa-router'
	import Dashboard from "./Components/Dashboard.svelte"
	import Navbar from './Components/Navbar.svelte'
	import { location } from 'svelte-spa-router';
	const routes = {
		'/': Dashboard,
	}
</script>

<main>
	{#if $location != "/"}
		<Navbar/>
	{/if}
	<Router {routes}/>
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

