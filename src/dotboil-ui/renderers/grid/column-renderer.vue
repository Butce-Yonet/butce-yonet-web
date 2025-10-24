<template>
    <div :ref="schema.Name" :class="gridResolver(schema)" :style="schema.getDefaultStyles()">
        <renderer v-for="item in schema.Content" :schema="item" :renderers="renderers"
            :gridResolver="gridResolver" />
    </div>
</template>

<script>

import Renderer from '@/dotboil-ui/renderers/renderer.vue';

export default {
    components: {
        'renderer': Renderer
    },
    props: {
        schema: {},
        renderers: {},
        gridResolver: Function
    }
}

</script>