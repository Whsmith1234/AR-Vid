<template>
  <div>
    <br/>
     <input v-model="url" class="input" type="text" placeholder="Image url...">
     <button  v-on:click="importVideo(url)" class="button is-success">
      Upload
    </button>
    <br/><br/>
    <video :src="url" controls></video>
  </div>
</template>

<script>
import Arweave from 'arweave';

const arweave = Arweave.init({
    host: 'arweave.net',// Hostname or IP address for a Arweave host
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
});

export default {
  name: 'uploader',
  data: () => ({
    url: "hey",
    host: ""
  }),
  mounted: async function(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    this.url = urlParams.get("url");
    this.host = urlParams.get("host");
  },
  methods:{
    importVideo: async function(url){
      var video = await fetch(url);
      video = await video.arrayBuffer();
      let transaction = await arweave.createTransaction({
        data: video
      }); 
      console.log(transaction);
      var amount = await arweave.ar.winstonToAr(transaction.reward);
      console.log(amount);
      transaction.addTag("Content-Type", "video/mp4");
      transaction.addTag("App-Name", "Arvideo")
      transaction.addTag("Url", this.url);
      if(this.host){
        transaction.addTag("Url", this.host);
        console.log(this.host);
      }
      await arweave.transactions.sign(transaction);
      if(confirm("Are you sure it you want to upload this video to the Arweave network? It will cost you "+amount+" AR")){
        let uploader = await arweave.transactions.getUploader(transaction);
        while (!uploader.isComplete) {
          await uploader.uploadChunk();
          console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
         }
        this.url = ("https://arweave.net/"+transaction.id);
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button{
  background-color: #64ee85 !important;
}
video{
  width:80%;
  max-width: 830px;
}
input{
  width:70%;
  max-width: 750px;
}
a {
  color: #64ee85;
}
</style>
