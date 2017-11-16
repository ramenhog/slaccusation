// var debug = require('debug')('botkit:channel_join');
// const db = require("../datastore.js");

// var locations = [
//   'Race Track',
//   'Vineyard',
//   'Library',
//   'Retirement Home',
//   'Construction Site',
//   'Candy Factory',
//   'Coal Mine',
//   'Rock Concert',
//   'Wedding',
//   'Harbor Docks',
//   'Art Museum',
//   'Stadium',
//   'Cat Show',
//   'Jail',
//   'The UN',
//   'Subway (Train)',
//   'Cemetery',
//   'Jazz Club',
//   'Gas Station',
//   'Sightseeing Bus'
// ];

// function handleMessage(bot, message, state={}) {
//   let {spy, location} = state;
  
//   if (!!message.text) {
//     var messageText = message.text;
//     if (messageText === 'list') {
//       var messageList = locations.join(',\n');
//       bot.replyPrivate(message, "*Here is a list of locations:* \n\n" + messageList);
//     } else if (!spy || !location) {
//       bot.replyPublic(message, "The game timed out...sorry. I'm still working on this part.");
//     } else if (messageText.toLowerCase().indexOf('accuse') > -1) {
//       if (messageText.toLowerCase().indexOf(spy.user.name.toLowerCase()) > -1) {
//         bot.replyPublic(message, {
//           "attachments": [
//               {
//                   "fallback": "You accused correctly! *@" + spy.user.name + "* is the Spy! The location was " + location + ".",
//                   "text": "You accused correctly! *@" + spy.user.name + "* is the Spy! The location was " + location + ".",
//                   "image_url": "https://media.giphy.com/media/LZElUsjl1Bu6c/giphy.gif"
//               }
//           ]
//         });
//       } else {
//         bot.replyPublic(message, {
//           "attachments": [
//               {
//                   "fallback": "You accused incorrectly! *@" + spy.user.name + "* is the Spy and has just won the game!",
//                   "text": "You accused incorrectly! *@" + spy.user.name + "* is the Spy and has just won the game!",
//                   "image_url": spy.user.profile.image_192
//               }
//           ]
//         });
//       }
//     } else if (messageText.toLowerCase().indexOf('is the location') > -1) {
//       if (!!spy && !!location) {
//         if (message.user_name === spy.user.name) {
//           if (messageText.toLowerCase().indexOf(location.toLowerCase()) > -1) {
//             bot.replyPublic(message, {
//               "attachments": [
//                   {
//                       "fallback": "The Spy, *@" + spy.user.name + "* guessed the " + location + " correctly and has won the game.",
//                       "text": "The Spy, *@" + spy.user.name + "* guessed the " + location + " and has won the game.",
//                       "image_url": spy.user.profile.image_192
//                   }
//               ]
//             });
//           } else {
//             bot.replyPublic(message, {
//               "attachments": [
//                   {
//                       "fallback": "The Spy, *@" + spy.user.name + "* has lost the game. GOOD GUYS WIN!",
//                       "text": "The Spy, *@" + spy.user.name + "* has lost the game. The location was " + location + ". \n GOOD GUYS WIN!",
//                       "image_url": "https://media.giphy.com/media/LZElUsjl1Bu6c/giphy.gif"
//                   }
//               ]
//             });
//           } 
//         } else {
//           bot.replyPrivate(message, "Only the SPY can guess the location.");
//         }
//       } else {
//         bot.replyPublic(message, 'A Slaccusation game is not currently in progress. Type `/slaccusation` to start a new game.');
//       }
//     } else {
//       bot.replyPublic(message, 'Please type a valid command.');
//     }
//   } else {
//     console.log("Starting new game");
//     let newState = {
//       spy: {},
//       location: locations[Math.floor(Math.random() * locations.length)]
//     };
    
//     var channelId = message.channel;
//     bot.api.mpim.list({}, function(err, response) {
//       var currentGroup = response.groups.filter(function(group) {
//         return group.id === channelId;
//       })[0];

//       var currentMembers = currentGroup.members;

//       var membersRequests = Promise.all(currentMembers.map(function(member) {
//         return new Promise((resolve, reject) => {
//           return bot.api.users.info({user: member}, (err, memberInfo) => {
//             if (err) { return reject(err); }
//             resolve(memberInfo);
//           });
//         })}));

//       membersRequests.then(function(currentMemberInfo) {
//         var players = currentMemberInfo.filter(function(memberInfo) {
//           return !memberInfo.user.is_bot;
//         });

//         var starter = players[Math.floor(Math.random() * players.length)];
//         newState.spy = players.splice(Math.floor(Math.random() * players.length), 1)[0];
//         console.log("Storing new state", message.channel, newState);
//         db.storeState(message.channel, newState).then(() => {
//           console.log("Stored state");
//           ({spy, location} = newState);
//           console.log("Stored state!", spy.user.id, location);
          
//           bot.startPrivateConversation({user: spy.user.id}, function(err, dm) {
//             console.log('SPY!!!!!!!!!!!!!', spy.user.name);
//             dm.say({
//               "attachments": [
//                   {
//                       "fallback": "YOU ARE THE SPY!",
//                       "text": "YOU ARE THE SPY!",
//                       "image_url": "https://thumbs.gfycat.com/UnsteadyCarelessGuineapig-max-1mb.gif"
//                   }
//               ]
//             });
//           });

//           players.forEach(function(player) {
//             console.log('PLAYER!!!!!!!!!', player.user.name);
//             bot.startPrivateConversation({user: player.user.id}, function(err, dm) {
//               dm.say("You are at the *" + location + '*.');
//             });
//           });

//           bot.replyPublic(message, "Let’s play some *Slaccusation!* \n \n I’ll be messaging everyone in this group individually to reveal the `Secret Location`. \n I’ll also be notifying one lucky (or unlucky) player that they’re the  `Spy`.\n \n *@" + starter.user.name + "* may start the questioning. Game on! :sleuth_or_spy:");

//         }).catch((error) => {
//           console.log("Error storing state", error);
//           debug(`Error: encountered an error saving state`, error);
//         });

//       });
//     });
//   }
// }

// module.exports = function(controller) {

//     controller.on('bot_channel_join', function(bot, message) {

//         controller.studio.run(bot, 'channel_join', message.user, message.channel, message).catch(function(err) {
//             debug('Error: encountered an error loading onboarding script from Botkit Studio:', err);
//         });

//     });
  
//     controller.on('slash_command', function(bot, message) {
//       console.log("I AM HERE!! LOG ME!!!!");
      
//       db.getState(message.channel).then(function(state){
//         console.log("in channel join");
//         state = state || {};
//         console.log(`Got state`, message.channel, state);
//         handleMessage(bot, message, state);
//       }).catch(function(err){
//         console.log(`Error: encountered an error loading state`, err);
//       });
      
//     });

// }
