<script>
    import Router from 'svelte-spa-router';
    import Home from './Home.svelte';
    import Binary from './Binary.svelte';
    import Config from './Config.svelte';

    import {onMount} from 'svelte';

    let weedStatus = false;

    async function checkWeedStatus() {
        const res = await fetch('/api/system');
        const {seaweedOn} = await res.json();
        weedStatus = seaweedOn;
    }

    onMount(async () => {
        await checkWeedStatus();
    });

    const routes = {
        // Exact path
        '/': Home,
        '/binary': Binary,
        '/config': Config,

        // Using named parameters, with last being optional
        // '/author/:first/:last?': Author,

        // Wildcard parameter
        // '/book/*': Book,

        // Catch-all
        // This is optional, but if present it must be the last
        '*': Home
    }

    async function startHandler() {
        let headers = {'Content-Type': 'application/json', 'Accept': 'application/json'};
        const res = await fetch('/api/config');
        const config = await res.json();
        await fetch('/api/system', {
            headers,
            method: 'POST',
            body: JSON.stringify({config})
        });
        setTimeout(checkWeedStatus, 2000);
    }

    async function stopHandler() {
        await fetch('api/system', {method: 'DELETE'});
        setTimeout(checkWeedStatus, 2000);
    }
</script>

<div class="top-bar">
    <div class="link"><a href="/">System</a></div>
    <div class="link"><a href="#/binary">Binaries</a></div>
    <div class="link"><a href="#/config">Config</a></div>
    {#if weedStatus}
        <span style="color: red; font-size: 24px;" on:click={stopHandler}>Stop</span>
    {:else}
        <span style="color: green; font-size: 24px;" on:click={startHandler}>Start</span>
    {/if}
    <!--    <div class="link">asd</div>-->
</div>
<Router {routes}/>

<style>
    .top-bar {
        width: 100vw;
        height: 100px;
        border-bottom: 1px solid black;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }

    .link {
        font-size: 36px;
    }

</style>
