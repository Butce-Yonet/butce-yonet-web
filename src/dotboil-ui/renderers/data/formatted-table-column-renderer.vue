<template>
    <div v-if="content.length > 0">
        <renderer v-for="schema in content" :schema="schema" :renderers="renderers" :gridResolver="gridResolver" :class="gridResolver(schema)"/>
    </div>
    <span v-else></span>
</template>

<script>
import DotBoil from '@/dotboil-ui/dotboil'

import Renderer from '@/dotboil-ui/renderers/renderer.vue'

export default {
    props: {
        schema: {},
        renderers: {},
        gridResolver: Function,
        column: {},
        currentItem: {}
    },
    components: {
        "renderer": Renderer
    },
    data() {
        return {
            content: []
        }
    },
    methods: {
        randomText(length = 8) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            let result = ''
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return result
        }
    },
    beforeMount() {
        var currentItemKeys = Object.keys(this.currentItem);

        if (currentItemKeys.length > 0) {
            this.schema.Content.map((m => {
                var newContent = { ...m };
                newContent.Name = this.randomText();
                DotBoil.set(newContent.Name, {});
                DotBoil.State[newContent.Name].EventArgs = this.currentItem;

                Object.keys(this.schema.MapProperties).map((y) => {
                    newContent[y] = this.currentItem[this.schema.MapProperties[y]];
                })

                this.content.push(newContent);
            }));
        }
    }
}
</script>