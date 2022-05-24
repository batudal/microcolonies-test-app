<script>
	import Router from 'svelte-spa-router'
	import Dashboard from "./Components/Dashboard.svelte"
	import Navbar from './Components/Navbar.svelte'
	const routes = {
		'/': Dashboard,
	}
</script>

<main>
	<Navbar/>
	<div style="height: 24px"></div>
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

