const setDOMInfo = info => {
  console.log(info);
  var packet = info.videos.split(" | ");
  start(packet);
};

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', () => {
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'videos'},
        setDOMInfo);
  });
});
async function start(packet){
  document.getElementById('url').value = packet[0];
  document.getElementsByTagName('video')[0].src = packet[0];
  document.getElementsByTagName('a')[0].href=("http://localhost:8080/?url="+packet[0]+'&host='+packet[packet.length-1]);
  var host = packet[packet.length-1];
  var transactions = await fetch("https://arweave.net/graphql", {
        method: "POST",
        body: JSON.stringify({
          query: `{
            transactions(
              tags: [
                  {
                      name: "Content-Type",
                      values: ["video/mp4"]
                  },{
                    name: "Url",
                    values: ["${host}"]
                  },{
                     name: "App-Name",
                     values: ["Arvideo"]
                  },
              ]
            ){
                edges {
                    node {
                        id
                    }
                }
            }
          }`,
        }),
        headers: {
          "content-type": "application/json",
        },
      });
      transactions = await transactions.json();
      transactions = await (transactions.data.transactions.edges);
      console.log(transactions);
      document.getElementById("loader").className = "hide";
      document.getElementById("content").className = "";
      if(transactions.length>0){
        var video = "https://arweave.net/"+transactions[0].node.id;
        document.getElementById('url').value=video;
        document.getElementsByTagName('video')[0].src = video;
        var btn = document.getElementsByTagName('a')[0];
        btn.href=(video);
        btn.className = "button is-warning";
        btn.innerText = "View";
      }else{
      }

}