function start(){
    var videos = document.getElementsByTagName("video");
    console.log(videos);

}
//Wait for browser to finish loading until js is run
window.addEventListener("load", function () {
    start();
});
// Inform the background page that 
// this tab should have a page-action.
chrome.runtime.sendMessage({
    from: 'content',
    subject: 'videos',
  });
  
  // Listen for messages from the popup.
  chrome.runtime.onMessage.addListener((msg, sender, response) => {
    // First, validate the message's structure.
    if ((msg.from === 'popup') && (msg.subject === 'videos')) {
      // Collect the necessary data. 
      // (For your specific requirements `document.querySelectorAll(...)`
      //  should be equivalent to jquery's `$(...)`.)
      var videos = document.getElementsByTagName('video');
      var f = "";
      for(var i =0; i <videos.length; i++){
        f += document.getElementsByTagName('video')[i].src+" | "
      }
      var sources = document.getElementsByTagName('source');
      for(var i =0; i <sources.length; i++){
        f += document.getElementsByTagName('source')[i].src+" | "
      }
      f += window.location.href;
      var domInfo = {
        videos: f
      };
  
      // Directly respond to the sender (popup), 
      // through the specified callback.
      response(domInfo);
    }
  });
