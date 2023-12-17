<template>
    <v-card>
        <v-layout>
            <v-navigation-drawer expand-on-hover="true" permanent v-model="drawer" :rail="rail" color="teal">
                <v-list nav>
                    <v-list-item prepend-icon="mdi-cog" title="Video Management">
                    </v-list-item>
                    <v-divider></v-divider>
                    <div class="list-top">                        
                        <v-list-item :to="{ name: 'video' }" prepend-icon="mdi-download" title="Get SCORM" value="upload">
                        </v-list-item>
                    </div>
                    <v-list-item :to="{ name: 'preview' }" prepend-icon="mdi-movie" title="Prepare Broadcast" value="preview">
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <v-main class="main-content">
                <router-view></router-view>
            </v-main>
        </v-layout>
    </v-card>
</template>

<script setup>
import { ref } from "vue";
const drawer = ref(true)
const rail = ref(true)
</script>

<style scoped>
img.logo {
    width: 100px;
    height: 24px;
    margin-top: 8px;
}

.list-top {
    margin-top: 12px;
    margin-bottom: 12px;
}

.main-content {
    margin: 20px;
}
</style>
