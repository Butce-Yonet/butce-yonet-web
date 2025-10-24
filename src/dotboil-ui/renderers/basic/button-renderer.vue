<template>
    <button :class="getButtonClass()" v-on="onHandle()">
        <i v-if="schema.Icon" :class="schema.Icon">
        </i>

        {{ $t(schema.Text) }}
    </button>
</template>

<script>
import DotBoil from '@/dotboil-ui/dotboil'

export default {
    props: {
        schema: {},
        renderers: {},
        gridResolver: Function
    },
    methods: {
        getButtonClass(){
            var className = 'btn ';
            className += `btn-${this.schema.Variant} `;

            if (this.schema.ButtonSize){
                className += `btn-${this.schema.ButtonSize}`;
            }

            return className;
        },
        onHandle() {
            const events = {};
            if (this.schema.EmitEvents) {
                for (const [eventName, globalEventName] of Object.entries(this.schema.EmitEvents)) {
                    events[eventName] = () => {
                        DotBoil.emit(this.schema, globalEventName)
                    }
                }
            }

            return events;
        }
    }
}
</script>
