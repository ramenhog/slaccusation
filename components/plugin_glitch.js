const request = require('request');
module.exports = function(controller) {
  
  function keepAlive() {
    request({
      url: 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me',
    }, (err) => {
      setTimeout(() => {
        keepAlive();
      }, 55000);
    });  
  }
  
  // if this is running on Glitch
  if (process.env.PROJECT_DOMAIN) {

    // Register with studio using the provided domain name
    controller.registerDeployWithStudio(process.env.PROJECT_DOMAIN + '.glitch.me');
    
    // make web call to self every 55 seconds
    keepAlive();
  }
}
