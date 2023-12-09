<template>
    <v-card>
        <v-img
        height="200"
        :src="props.video.thumbUrl"
        >
        </v-img>
    </v-card>


<!-- <el-container>

        </el-row>
        <el-row>
            <el-col :span="12" align="left">
            <el-form style="max-width: 460px">
                <el-form-item label="SCORM パッケージ名:">
                <el-input placeholder="Zip ファイル名" v-model="folderNameZip" />
                </el-form-item>
            </el-form>
            </el-col>
            <el-col :span="12">
            <el-tooltip content="選択されたSCORMパッケージがダウンロードされます" placement="top" effect="light">
                <el-button @click="scormDownload">ダウンロード</el-button>
            </el-tooltip>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="20" align="left">
            <div class="message">
                <p>*動画一覧から選択されたSCORMパッケージがダウンロードされます。そのパッケージをMoodleの 「活動」 → 「SCORMパッケージ」で追加することが可能です。 </p>

            </div>
            </el-col>
        </el-row>

    </el-row>
    <el-row style="padding-right: 10px" :gutter="10">
        <template v-for="video in videos">
        <el-col :span="6">
            <div @click="
            setVideo(video.videoUrl, video.uniqueName, video.videoName)
            ">
            <el-tooltip content="動画をクリックするとプレビュー画面に表示・次ダウンロード動画としてセットされます" placement="top" effect="light">
                <el-image style="height: 200px" :src="video.thumbUrl" class="videoDiv round-image" /><br />
            </el-tooltip>
            <span>{{ video.videoName }}</span><br /><br />
            </div>
        </el-col>
        </template>
    </el-row>
    </el-main>
</el-container>
props.vidoURl is here
<div class="fixed-button">
    <el-icon>
    <el-button @click="scrollUp" type="success" size="large" circle>
        <Top />
    </el-button>
    </el-icon>
</div> -->

</template>

<script setup>
import { ref, reactive, onMounted, onUpdated } from "vue";
import axios from "axios";
import { userAuthStore } from "../store/auth.store.js";
const props = defineProps({
    video: Object,
});

const BASE_URL = import.meta.env.SERVER_URL;
const sourceFolder = ref("");
const previewName = ref("Click a video");
let videos = ref([]);
let videoFullList = ref([]);

const previewUrl = ref("");
const folderNameZip = ref("");


const scormDownload = () => {
const options = {
    url: BASE_URL + "/scormProperty",
    method: "POST",
    data: {
    scormName: folderNameZip.value,
    sourceFolder: sourceFolder.value,
    },
};

axios(options).then((res) => {
    if (res.data.success) {
    axios
        .post(BASE_URL + "/scorm", {
        responseType: "arraybuffer",
        headers: { Accept: "application/zip" },
        })
        .then((res) => {
        var file = res;
        console.log(res);
        const blob = new Blob([file], { type: "application/zip" });
        const uri = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = folderNameZip.value;
        link.href = uri;
        link.click();
        });
    } else {
    console.log("Scorm property root has a problem");
    }
});
};

const setVideo = (videoUrl, uniqueName, videoName) => {
console.log(videoUrl);
console.log(videoName);
previewUrl.value = videoUrl;
sourceFolder.value = uniqueName;
folderNameZip.value = videoName;
previewName.value = videoName;

scrollUp()
};

const scrollUp = () => {
window.scrollTo({
    top: 0,
    behavior: "smooth",
});
}
</script>

<style>
.el-row {
margin-bottom: 20px;
}

.videoDiv {
cursor: pointer;
}

.round-image {
border-radius: 10%;
}

.bottom-line {
border-bottom: 2px dashed #dcdcdc;
}

.message {
color: #808080
}

.fixed-button {
position: fixed;
bottom: 60px;
right: 60px;
}
</style>
