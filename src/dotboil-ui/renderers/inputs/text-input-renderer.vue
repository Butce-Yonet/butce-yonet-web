<template>
    <div v-if="Context.State[schema.FormName].Context[schema.FieldName] != undefined">
        <input v-model="Context.State[schema.FormName].Context[schema.FieldName]" type="text" class="form-control"></input>
        <span v-if="Context.State[schema.FormName].Errors[schema.FieldName]" class="text-danger">{{ Context.State[schema.FormName].Errors[schema.FieldName] }}</span>
    </div>
</template>

<script>
import DotBoil from '@/dotboil-ui/dotboil'

export default {
    props:{
        schema: {},
        renderers: {},
        gridResolver: Function
    },
    data(){
        return{
            Context: DotBoil
        }
    }
}

</script>