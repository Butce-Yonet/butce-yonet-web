<template>
  <div :ref="schema.Name" class="card" :style="schema.getDefaultStyles()">
    <div class="card-header">
      <h5 v-if="schema.Title">{{ $t(schema.Title) }}</h5>
      <span v-if="schema.SubTitle">{{ $t(schema.SubTitle) }}</span>
      <div v-if="schema.Header.length > 0">
        <renderer v-for="item in schema.Header" :schema="item" :renderers="renderers" :grid-resolver="gridResolver"/>
      </div>
    </div>
    <div class="card-body">
      <renderer v-for="item in schema.Content" :schema="item" :renderers="renderers" :grid-resolver="gridResolver"/>
    </div>
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
    'renderer' : Renderer
  }
}

</script>