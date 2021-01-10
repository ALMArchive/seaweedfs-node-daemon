<script>
    import {onMount} from 'svelte';

    let systemStatus = '';

    function checkSystemStatus() {
        setTimeout(async () => {
            const res = await fetch('/api/binary');
            if (res.ok) {
                systemStatus = 'On';
            } else {
                systemStatus = 'System Off';
            }
        }, 1000);
    }

    onMount(checkSystemStatus);

    async function shutdownHandler() {
        systemStatus = 'Shutdown Request Sent';
        const res = await fetch('/api/shut-down');
        const data = await res.json();
        if (data.shuttingDown === true) {
            systemStatus = 'Shutting down';
        }
        setTimeout(checkSystemStatus, 1000);
    }
</script>

<div class='container'>
    <button on:click={shutdownHandler}>Shut Down</button>
    <div>Status: <span id="system-status">{systemStatus}</span></div>
</div>

<style>
    .container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        flex-direction: column;
    }
</style>
