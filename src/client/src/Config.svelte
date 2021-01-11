<script>
    import {onMount} from 'svelte';

    let downloaded = [];
    let config = {};
    onMount(async () => {
        const res = await fetch('/api/config');
        config = await res.json();

        const res2 = await fetch('/api/binary');
        downloaded = await res2.json();
    });

    async function updateConfig(prop, value) {
        await fetch(`/api/config?prop=${prop}&value=${value}`, {method: 'PUT'})
    }
</script>

<div>
    <label>Binary Selection</label>
    <select bind:value={config.bin} on:change={() => updateConfig('bin', config.bin)}>
        {#each downloaded as val}
            <option>{val}</option>
        {/each}
    </select>
    <label>Master Volume Size Limit</label>
    <input type="number" min="1" max="99999999999" bind:value={config.mVolumeSizeLimitMB}
           on:change={() => updateConfig('mVolumeSizeLimitMB', config.mVolumeSizeLimitMB)}>
    <label>Max Number of Volumes</label>
    <input type="number" min="1" max="10000" bind:value={config.vMax}
           on:change={() => updateConfig('vMax', config.vMax)}>
    <label>Operation Mode</label>
    <select bind:value={config.mode} on:change={() => updateConfig('mode', config.mode)}>
        <option>s3</option>
    </select>
    <label>Data Directory</label>
    <input style="width: 50%" type="text" bind:value={config.dir} on:change={() => updateConfig('dir', config.dir)}/>
</div>

<style>

</style>
