<template>
  <div>
      <br />
      <input
        v-model="url"
        class="input"
        type="text"
        placeholder="Video url..."
      />
      <button v-on:click="importVideo(url)" class="button is-success">
        Upload
      </button>
      <br><br>
        <center>
        {{uploading}}
        </center>
      <video :src="url" controls></video>
      <br><br>
      <div class="left">Original Urls</div>
       <div class = "left" v-for="tag in tags" :key="tag">
         <a :href = "tag"> {{tag}} </a> <br>
       </div>
       <br>
      <div>
        <a id="flip" v-on:click="Latest()" class="is-success">
          {{ show }} latest Uploads
        </a>
      </div>
      <br><br>
      <div :class="hide">
        <ul class="wrapper" id="User List">
          <div v-for="video in videos" :key="video">
            <div id="videos">
              <video
                id="videos"
                controls
                :src="'https://arweave.net/' + video.node.id"
              ></video>
              <br /><br />
              <a :href="'/?url=https://arweave.net/' + video.node.id+'&view='+video.node.id">Watch full</a>
            </div>
          </div>
        </ul>
        <br><br><br>
      </div>
  </div>
</template>

<script>
import Arweave from "arweave";
import * as arvid from "@/lib/arvid-api";
const arweave = Arweave.init({
  host: "arweave.net", // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: "https", // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false, // Enable network request logging
});

export default {
  name: "uploader",
  data: () => ({
    url: "hey",
    host: "",
    videos: [],
    show: "Show",
    tags: [],
    uploading: ""
  }),
  mounted: async function () {
    const queryString = window.location.search;         // Grab parameters
    const urlParams = new URLSearchParams(queryString);
    this.url = urlParams.get("url");
    this.host = urlParams.get("host");
    if(urlParams.get("view")!=undefined){
      const transaction = arweave.transactions.get(urlParams.get('view')).then(transaction => {
      transaction.get('tags').forEach(tag => {
        let key = tag.get('name', {decode: true, string: true});
        let value = tag.get('value', {decode: true, string: true});
        if(key === 'Url'){
          this.tags.push(value);  // Show the original urls of the videos
        }
      });
      // Content-Type : text/html
      // User-Agent : ArweaveDeploy/1.1.0
    });
    }
  },
  methods: {
    Latest: async function () {
      if (this.videos.length === 0) {
        this.videos = await arvid.latestVideos();
        this.show = "Hide";
      } else {
        this.videos = [];
        this.show = "Show";
      }
    },
    importVideo: async function (url) {
      this.uploading = "Fetchng video...";
      var video = await fetch(url);
      video = await video.arrayBuffer();
      let transaction = await arweave.createTransaction({
        data: video,
      });
      this.uploading = "Making transaction...";
      console.log(transaction);
      var amount = await arweave.ar.winstonToAr(transaction.reward);
      console.log(amount);
      transaction.addTag("Content-Type", "video/mp4");
      transaction.addTag("App-Name", "Arvideo");
      transaction.addTag("Url", this.url);
      this.uploading= "Adding tags..."
      if (this.host) {
        transaction.addTag("Url", this.host);
        console.log(this.host);
      }
      await arweave.transactions.sign(transaction);
      if (
        confirm(
          "Are you sure it you want to upload this video to the Arweave network? It will cost you " +
            amount +
            " AR"
        )
      ) {
        let uploader = await arweave.transactions.getUploader(transaction);
        while (!uploader.isComplete) {
          await uploader.uploadChunk();
          
          this.uploading =  `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
          
        }
        this.uploading=""
        this.url = "https://arweave.net/" + transaction.id;
      }else{
        this.uploading = "";
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
  background-color: #41B883 !important;
}
.left{
  text-align: left;
  width:80%;
  margin: auto;
  max-width: 830px;
}
video {
  max-height: 400px;
  width:80%;
  max-width: 830px;
}
#flip {
  width: 80%;
  max-width: 830px;
  color: #34495E;
}
input {
  width: 70%;
  max-width: 750px;
}
a {
  color: #41B883;
}


.wrapper {
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  display: grid;
  background-color: #fff;
  color: #2c3e50;
  grid-gap: 5px;
  max-width: 830px;
}
@media only screen and (max-width: 600px) {
  .wrapper {
    grid-template-columns: 100%;
  }
}
@media only screen and (max-width: 900px) and (min-width: 600px) {
  .wrapper {
    grid-template-columns: 50% 50%;
  }
}
@media only screen and (min-width: 900px) {
  .wrapper {
    margin-top: 5px;
    grid-template-columns: 33% 33% 33%;
  }
}
</style>
