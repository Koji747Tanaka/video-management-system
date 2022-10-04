<script setup>

</script>

<template>

  <el-container id="firstContainer">
    <el-menu id="top-menu">
      <img src="./img/chibalogoside.jpeg" alt="Chiba University Logo" class="logo" width="200" height="50">

    </el-menu>

    <!-- <el-switch v-model="value" size="middle" active-text="English" inactive-text=" 日本語" /> -->

  </el-container>

  <main>
    <router-view />
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

#top-menu {
  display: flex;
  border: none;
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



.logo {
  float: left;

}
</style>
