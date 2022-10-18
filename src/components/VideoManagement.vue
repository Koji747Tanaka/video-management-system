<template>
    <el-header>
        <h2>ビデオ変換</h2>
    </el-header>
    <el-main>
        <el-row>
            <el-col :span="24">
                <el-form ref="uploadForm" id="uploadForm" enctype="multipart/form-data">
                    <el-input type="file" name="mp4" v-model="file">Choose File</el-input>
                    <el-button id="uploadForm" type="primary" plain @click="sendMP4()">
                        Convert
                    </el-button>
                </el-form>
            </el-col>
        </el-row>
    </el-main>

</template>

<script setup>
import { ref } from 'vue'
import axios from "axios"

const API_URL = "http://localhost:3000/";
const file = ref('')
// const password = ref('')

const sendMP4 = () => {
    console.log("file", file.value);
}



</script>

<style>

</style>