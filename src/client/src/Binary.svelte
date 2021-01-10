<script>
    import {onMount} from 'svelte';

    let data = [];
    let downloaded = [];

    async function checkDownloaded() {
        const res2 = await fetch('/api/binary');
        downloaded = await res2.json();
    }

    onMount(async () => {
        const res = await fetch('/api/binary/versions');
        data = await res.json();

        await checkDownloaded();
    });

    async function downloadClickHandler(id) {
        await fetch('/api/binary?id=' + id, {method: 'POST'});
        setTimeout(async () => await checkDownloaded(), 10000);
    }

</script>

<div class="split-flex">
    <div>
        <h1>Versions</h1>
        {#each data as version}
            <div class="version">
                <h2>Name: {version.name}</h2>
                <h4>Version: {version.version}</h4>
                <button on:click={() => downloadClickHandler(version.id)}>Download</button>
            </div>
        {/each}
    </div>

    <div>
        <h1>Downloaded</h1>
        {#each downloaded as download}
            <div class="version">
                <h2>Name: {download}</h2>
            </div>
        {/each}
    </div>
</div>

<style>
    .split-flex {
        display: flex;
    }

    .split-flex > div {
        padding: 24px;
    }

    .version {
        margin-bottom: 24px;
        margin-left: 12px;
    }

    h4 {
        margin-left: 12px;
    }

    h1 {
        color: purple;
    }
</style>
