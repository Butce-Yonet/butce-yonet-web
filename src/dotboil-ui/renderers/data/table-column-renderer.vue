<template>
    <span>{{ currentItem[column.Field] }}</span>
</template>

<script>
    export default{
        props:{
            schema: {},
            renderers: {},
            gridResolver: Function,
            column: {},
            currentItem: {}
        }
    }
</script>