<template>
    <div>
        <EasyDataTable :headers="Context.State[schema.Name].Headers" :items="Context.State[schema.Name].Items"
            :loading="Context.State[schema.Name].Loading">
            <template #item="{ item, column }">
                <table-column v-if="schema.Columns.filter(col => col.Field == column)[0].Type == 'TableColumn'"
                    :schema="schema.Columns.filter(col => col.Field == column)[0]" :renderers="renderers"
                    :gridResolver="gridResolver" :column="schema.Columns.filter(col => col.Field == column)[0]"
                    :current-item="item" />

                <formatted-table-column
                    v-else-if="schema.Columns.filter(col => col.Field == column)[0].Type == 'FormattedTableColumn'"
                    :schema="schema.Columns.filter(col => col.Field == column)[0]" :renderers="renderers"
                    :gridResolver="gridResolver" :column="schema.Columns.filter(col => col.Field == column)[0]"
                    :current-item="item" />

                <renderer v-else :schema="schema.Columns.filter(col => col.Field == column)[0]" :renderers="renderers"
                    :gridResolver="gridResolver" :column="schema.Columns.filter(col => col.Field == column)[0]"
                    :currentItem="item" />
            </template>

            <template #loading v-if="schema.Loading.length > 0">
                <renderer v-for="loader in schema.Loading" :schema="loader" :renderers="renderers" :gridResolver="gridResolver" />
            </template>

            <template #empty-messag v-if="schema.Empty.length > 0">
                <renderer v-for="empty in schema.Empty" :schema="empty" :renderers="renderers" :gridResolver="gridResolver"/>
            </template>

        </EasyDataTable>
    </div>
</template>

<script>
import DotBoil from '@/dotboil-ui/dotboil'

import TableColumnRenderer from './table-column-renderer.vue';
import FormattedTableColumnRenderer from './formatted-table-column-renderer.vue';
import Renderer from '@/dotboil-ui/renderers/renderer.vue'

export default {
    props: {
        schema: {},
        renderers: {},
        gridResolver: Function
    },
    components: {
        'table-column': TableColumnRenderer,
        'formatted-table-column': FormattedTableColumnRenderer,
        'renderer': Renderer
    },
    data() {
        return {
            Context: DotBoil
        }
    },
    methods: {
        resolveHeaders() {
            this.schema.Columns.map((column) => {
                this.Context.State[this.schema.Name].Headers.push({ text: this.$t(column.Name), value: column.Field, sortable: column.Sortable });
            });
        }
    },
    created() {
        DotBoil.set(this.schema.Name, {
            Headers: [],
            Items: [],
            Loading: false
        });

        this.resolveHeaders();

        DotBoil.emit(this.schema, `${this.schema.Name}OnLoad`);
    }
}
</script>