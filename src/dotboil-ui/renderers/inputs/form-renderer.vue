<template>
    <renderer v-for="(item, index) in schema.Content" :key="index" :schema="item" :renderers="renderers"
        :gridResolver="gridResolver"></renderer>
</template>

<script>
import Renderer from '@/dotboil-ui/renderers/renderer.vue';

import DotBoil from '@/dotboil-ui/dotboil'

export default {
    components: {
        'renderer': Renderer
    },
    props: {
        schema: {},
        renderers: {},
        gridResolver: Function
    },
    created() {
        DotBoil.set(this.schema.Name, {
            Context: {},
            Errors: {},
            OnValidate: function () {
                return true;
            },
            OnResetForm: function () {
                DotBoil.State[this.schema.Name].Context = {};
                DotBoil.State[this.schema.Name].Errors = {};
            }
        });

        DotBoil.emit(`${this.schema.Name}Initialized`, this.schema)
    }
}
</script>