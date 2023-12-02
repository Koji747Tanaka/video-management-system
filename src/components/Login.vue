<template>
  <LoginTemp
  :isLogin="isLogin"
  />
</template>

<script setup>
import LoginTemp from './LoginTemp.vue'
import {ref} from 'vue'

const isLogin = ref(true)

</script>
<style>

</style>
