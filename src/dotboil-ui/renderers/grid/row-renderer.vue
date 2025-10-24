<template>
    <div class="row" :ref="schema.Name" :style="schema.getDefaultStyles()">
        <renderer v-for="item in schema.Content" :schema="item" :renderers="renderers"
            :gridResolver="gridResolver" />
    </div>
</template>

<script>
import Renderer from '@/dotboil-ui/renderers/renderer.vue';

export default {
    props: {
        schema: {},
        renderers: {},
        gridResolver: Function
    },
    components:{
        'renderer': Renderer
    }
}
</script>