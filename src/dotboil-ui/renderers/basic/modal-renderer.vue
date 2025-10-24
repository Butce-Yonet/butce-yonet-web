<template>
    <div :class="[`modal fade ${getSize()}`]" :id="schema.Name" tabindex="-1" role="dialog" :aria-labelledby="[`${schema.Name}Label`]"
        aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 v-if="schema.Header.length < 1" class="modal-title">{{ schema.Title }}</h3>
                    <div v-else class="modal-title">
                        <renderer :schema="schema.Header" :renderers="renderers" :gridResolver="gridResolver" />
                    </div>
                    <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <renderer v-for="item in schema.Content" :schema="item" :renderers="renderers" :gridResolver="gridResolver"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Renderer from '@/dotboil-ui/renderers/renderer.vue'
export default {
    props: {
        schema: {},
        renderers: {},
        gridResolver: Function
    },
    components: {
        'renderer': Renderer
    },
    methods:{
        getSize(){
            if (this.schema.ModalSize != ''){
                return `modal-${this.schema.ModalSize}`;
            }

            return '';
        }
    }
}
</script>