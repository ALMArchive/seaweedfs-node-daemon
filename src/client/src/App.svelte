<script>
    import Router from 'svelte-spa-router';
    import Home from './Home.svelte';
    import Binary from './Binary.svelte';

    const routes = {
        // Exact path
        '/': Home,
        '/binary': Binary,

        // Using named parameters, with last being optional
        // '/author/:first/:last?': Author,

        // Wildcard parameter
        // '/book/*': Book,

        // Catch-all
        // This is optional, but if present it must be the last
        '*': Home
    }
</script>

<div class="top-bar">
    <div class="link"><a href="/">System</a></div>
    <div class="link"><a href="#/binary">Binaries</a></div>
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
