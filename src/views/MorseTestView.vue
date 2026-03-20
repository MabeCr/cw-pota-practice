<script setup lang="ts">
import { ref } from 'vue';
import { useMorse } from '@/composables/useMorse';

const textInput = ref('');

</script>

<template>
  <h1>Morse Test View</h1>
  <div>
    <input id="textInput" v-model="textInput" type="text" @keydown.enter="useMorse().playMorse(textInput)" />
  </div>
</template>

<style scoped></style>
