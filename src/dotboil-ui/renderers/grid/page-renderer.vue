<template>
    <layout-renderer :ref="schema.Name" :schema="schema" :renderers="renderers" :gridResolver="gridResolver"/>
</template>

<script>

import LayoutRenderer from './layout-renderer.vue';

export default{
    props:{
        schema: {},
        renderers: {},
        gridResolver: Function
    },
    components:{
        'layout-renderer': LayoutRenderer
    },
}

</script>