<template>
    <component :is="resolveComponent(schema)" 
        :schema="schema"
        :renderers="renderers" 
        :gridResolver="gridResolver"></component>
</template>

<script>
export default{
    props:{
        schema: {},
        renderers : {},
        gridResolver: Function
    },
    methods:{
        resolveComponent(schema){
            return this.renderers[schema.Type];
        }
    }
}

</script>