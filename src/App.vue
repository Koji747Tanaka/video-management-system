<script setup>
import Login from './components/Login.vue'
import Register from './components/Register.vue'

</script>

<template>
  <el-container id="firstContainer">
    <el-header class="logo">
      <img src="./img/chibalogoside.jpeg" alt="Chiba University Logo" class="logo" width="200" height="60">
    </el-header>
  </el-container>

  <main>
    <Login />
  </main>


</template>

<style scoped>
header {
  line-height: 1.5;
}

main {
  justify-content: center;
  align-items: center;
  display: flex;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
  margin: 30px;
}

#firstContainer {
  border: 1px solid #eee;
  margin: 0%;
}
</style>
