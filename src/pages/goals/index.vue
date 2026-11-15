<template>
  <div class="page">
    <goal-list />
  </div>
</template>

<script>
import GoalList from '@/components/goal/goalList.vue';

export default {
  name: 'GoalsPage',
  components: { GoalList },
};
</script>
