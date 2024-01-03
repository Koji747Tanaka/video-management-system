<template>
    <v-container class="mt-5" style="min-height: 100vh;">
        <v-row justify="center">
        <v-col cols="8">
            <v-file-input
            label="動画ファイル選択"
            accept="video/*"
            ref="videoFile"
            type="file"
            ></v-file-input>
        </v-col>
        <v-col cols="2">
            <v-btn @click="uploadFile()" icon>
            <v-tooltip activator="parent" location="top"
                >動画をアップロードし、配信用動画を作成します</v-tooltip
            >
            <v-icon>mdi-upload</v-icon>
            </v-btn>
        </v-col>
        <v-col cols="2">
            <div v-if="load">
            <v-progress-circular
                :indeterminate="uploadCircle"
                :size="55"
                :width="8"
                :model-value="uploadProgress"
                color="teal"
            >
                {{ uploadProgress }}%
            </v-progress-circular>
            </div>
        </v-col>
        </v-row>
        <div class="pl-10 text--success">
        <p style="color: #808080">
            動画を選択し、右のアップロードボタンをクリックしてください。<br />動画をアップロードし、配信用動画に変換します。
        </p>
        </div>

        <v-dialog v-model="dialog" width="auto">
            <v-card>
                <v-card-title class="d-flex justify-center pa-4">
                動画ストリーミングURL
                </v-card-title>
                <v-divider></v-divider>
                <v-card-subtitle class="ml-2 pt-4"> 使用方法 </v-card-subtitle>
                <v-card-text>
                下のURLで動画を視聴することができます。<br />
                動画ストリーミングの準備にはアップロードした動画の長さと同等の時間を<br />
                要します。しばらく待ってから視聴してください。
                </v-card-text>
                <div class="d-flex align-center justify-center">
                <v-card class="d-inline-flex pa-1 ma-2">
                    <div>
                    <v-chip color="blue-grey-darken-3" class="mr-2" label>
                        {{ streamURL }}
                    </v-chip>
                    <v-btn @click="copyToClipboard" size="small" variant="flat">
                        <v-tooltip activator="parent" location="top">copy</v-tooltip>
                        <v-icon>
                        {{ copied ? "mdi-check" : "mdi-content-copy" }}
                        </v-icon>
                    </v-btn>
                    </div>
                </v-card>
                </div>

                <v-card-actions>
                    <v-btn color="teal" block @click="dialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";

const BASE_UNICORE_URL = import.meta.env.VITE_UNICORE_API_BASE;
const videoFile = ref(0);
const uploadProgress = ref(0);
const load = ref(false);
const uploadCircle = ref(true);
const dialog = ref(false);
const streamURL = ref(null);
const copied = ref(false);

const uploadFile = async() => {
    const file = videoFile.value.files[0];
    if (file) {
      directUploadStart({
        fileName: file.name,
        fileType: file.type
      })
        .then((response) =>
          directUploadDo({ data: response.data, file })
            .then(() => directUploadFinish({ data: response.data }))
            .then(() => {
              setMessage('File upload completed!');
            })
        )
        .catch((error) => {
          setMessage('File upload failed!');
        });
    }
}

const directUploadStart = ({ fileName, fileType }) => {
  return axios.post(
    `${BASE_UNICORE_URL}api/files/upload/direct/start/`,
    { file_name: fileName, file_type: fileType }
  );
};

const directUploadDo = ({ data, file }) => {
  const postData = new FormData();

  for (const key in data?.fields) {
    postData.append(key, data.fields[key]);
  }

  postData.append('file', file);

//   let postParams = getConfig();
//   if (data?.fields) {
//     postParams = {};
//   }

  return axios
    .post(data.url, postData)
    .then(() => Promise.resolve({ fileId: data.id }));
};

const directUploadFinish = ({ data }) => {
  return axios.post(
    `${BASE_UNICORE_URL}/api/files/upload/direct/finish/`,
    { file_id: data.id }
  );
};

const copyToClipboard = async () => {
try {
    await navigator.clipboard.writeText(streamURL.value);
    copied.value = true;
    setTimeout(() => {
    copied.value = false;
    }, 5000);
} catch (err) {
    console.error("Failed to copy text: ", err);
}
};
</script>

<style scoped></style>
