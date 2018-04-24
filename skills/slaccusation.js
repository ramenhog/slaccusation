var debug = require('debug')('botkit:channel_join');
const db = require("../datastore.js");

var locations = [
  'Race Track',
  'Vineyard',
  'Library',
  'Retirement Home',
  'Construction Site',
  'Candy Factory',
  'Coal Mine',
  'Rock Concert',
  'Wedding',
  'Harbor Docks',
  'Art Museum',
  'Stadium',
  'Cat Show',
  'Jail',
  'The UN',
  'Subway (Train)',
  'Cemetery',
  'Jazz Club',
  'Gas Station',
  'Sightseeing Bus'
];

const LOCATION_EMOJI = {
  "Race Track": ":racing_car:",
  "Vineyard": ":wine_glass: :grapes:",
  "Library": ":book:",
  "Retirement Home": ":older_man: :older_woman: :house:",
  "Construction Site": ":construction:",
  "Candy Factory": ":candy: :factory:",
  "Coal Mine": ":helmet_with_white_cross:",
  "Rock Concert": ":guitar:",
  "Wedding": ":wedding:",
  "Harbor Docks": ":boat:",
  "Art Museum": ":frame_with_picture:",
  "Stadium": ":stadium:",
  "Cat Show": ":cat:",
  "Jail": ":knife:",
  "The UN": ":flag-us: :flag-gb: :flag-cn: :flag-ru: :flag-tw: :flag-br:",
  "Subway (Train)": ":train:",
  "Cemetery": ":coffin:",
  "Jazz Club": ":saxophone:",
  "Gas Station": ":fuelpump:",
  "Sightseeing Bus": ":bus:"
}


class MessageTranslator {
  
  constructor(bot, message) {
    this.bot = bot;
    this.message = message;
  }
  
  endedGame() {
    this.bot.replyPublicDelayed(this.message, "The current Slaccusation game has been forcibly ended.");
  }
  
  accusedIncorrectly(spy, location) {
    this.bot.replyPublicDelayed(this.message, {
      "attachments": [
          {
              "fallback": "You accused incorrectly! *@" + spy.user.name + "* is the Spy and has just won the game!",
              "text": "You accused incorrectly! *@" + spy.user.name + "* is the Spy and has just won the game!",
              "image_url": spy.user.profile.image_192
          }
      ]
    });
  }
  
  announceNewGame(starter) {
    const locationsWithEmoji = locations.map((location) => `\`${location}\` ${LOCATION_EMOJI[location]}`);
    console.log(locationsWithEmoji);
    this.bot.replyPublicDelayed(this.message, [
      "Let’s play some *Slaccusation!*",
      "",
      "I’ll be messaging everyone in this group individually to reveal the `Secret Location`. It will be one of these places:",
      locationsWithEmoji.join("\n"),
      "",
      "I’ll also be notifying one lucky (or unlucky) player that they’re the  `Spy`.",
      "",
      "*@" + starter.user.name + "* may start the questioning. Game on! :sleuth_or_spy:"
    ].join("\n"));
  }
  
  accusedSuccessfully(spy, location) {
    this.bot.replyPublicDelayed(this.message, {
      "attachments": [
          {
              "fallback": "You accused correctly! *@" + spy.user.name + "* is the Spy! The location was " + location + ".",
              "text": "You accused correctly! *@" + spy.user.name + "* is the Spy! The location was " + location + ".",
              "image_url": "https://media.giphy.com/media/LZElUsjl1Bu6c/giphy.gif"
          }
      ]
    });
  }
  
  beginAccusePolling() {
    const accuser = this.message.user_name;
    const accusee = this.message.text.split("accuse ").pop();
    this.bot.reply(this.message, {
      attachments:[
          {
              title: `@${accuser} accused ${accusee} of being the Spy. Do you agree?`,
              callback_id: '123',
              attachment_type: 'default',
              actions: [
                  {
                      "name":"yes",
                      "text": ":thumbsup:",
                      "value": "yes",
                      "type": "button",
                  },
                  {
                      "name":"no",
                      "text": ":no_entry_sign:",
                      "value": "no",
                      "type": "button",
                  }
              ]
          },
          {
            title: 'Yes :thumbsup:',
            text: ``,
          },
          {
            title: 'No :no_entry_sign:',
            text: '',
          }
      ]
    });
  }
  
  errorGameAlreadyInProgress() {
    this.bot.replyPublicDelayed(this.message, 'A Slaccusation game is already in progress!');
  }
  
  errorGameNotInProgress() {
    this.bot.replyPublicDelayed(this.message, 'A Slaccusation game is not currently in progress. Type `/slaccusation` to start a new game.');
  }
  
  errorInvalidCommand() {
    this.bot.replyPublicDelayed(this.message, 'Please type a valid command.');
  }
  
  errorNonSpyAttemptGuessLocation() {
    this.bot.replyPrivateDelayed(this.message, "Only the SPY can guess the location.");
  }
  
  errorSpyGuessSelf() {
    this.bot.replyPrivateDelayed(this.message, "Well done, you figured out YOU'RE the spy. Now that you've gotten that out of your system, play the game for real. :stuck_out_tongue:")
  }
  
  errorNoSpyGuess() {
    this.bot.replyPrivateDelayed(this.message, "You didn't accuse anyone.")
  }
  
  informNonSpy(player, location, playerStr) {
    console.log('PLAYER!!!!!!!!!', player.user.name);
    this.bot.startPrivateConversation({user: player.user.id}, function(err, dm) {
      dm.say("Game with " + playerStr.join(", ") + ": You are at the *" + location + '*.');
    });
  }
  
  informSpy(spy, playerStr) {
    this.bot.startPrivateConversation({user: spy.user.id}, function(err, dm) {
      console.log('SPY!!!!!!!!!!!!!', spy.user.name);
      dm.say({
        "attachments": [
            {
                "fallback": "Game with " + playerStr + ": YOU ARE THE SPY!",
                "text": "Game with " + playerStr + ": YOU ARE THE SPY!",
                "image_url": "https://thumbs.gfycat.com/UnsteadyCarelessGuineapig-max-1mb.gif"
            }
        ]
      });
    });

  }
  
  listLocations() {
    const locationsWithEmoji = locations.map((location) => `\`${location}\` ${LOCATION_EMOJI[location]}`);
    var messageList = locationsWithEmoji.join('\n');
    this.bot.replyPrivateDelayed(this.message, "*Here is a list of locations:* \n\n" + messageList);
  }
  
  spyLost(spy, location) {
    const guess = this.message.text.split("guess ").pop();
    this.bot.replyPublicDelayed(this.message, {
      "attachments": [
          {
              "fallback": "The Spy, *@" + spy.user.name + "* has lost the game by guessing " + guess + ". GOOD GUYS WIN!",
              "text": "The Spy, *@" + spy.user.name + "* has lost the game by guessing " + guess + ". The location was " + location + ". \n GOOD GUYS WIN!",
              "image_url": "https://media.giphy.com/media/LZElUsjl1Bu6c/giphy.gif"
          }
      ]
    });
  }
  
  spyWon(spy, location) {
    this.bot.replyPublicDelayed(this.message, {
      "attachments": [
          {
              "fallback": "The Spy, *@" + spy.user.name + "* guessed the " + location + " correctly and has won the game.",
              "text": "The Spy, *@" + spy.user.name + "* guessed the " + location + " and has won the game.",
              "image_url": spy.user.profile.image_192
          }
      ]
    });
  }
}

function newGame(bot, message, translator) {
  let newState = {
    gameInProgress: true,
    spy: {},
    location: locations[Math.floor(Math.random() * locations.length)]
  };

  var channelId = message.channel;
  bot.api.mpim.list({}, function(err, response) {
    var currentGroup = response.groups.filter(function(group) {
      return group.id === channelId;
    })[0];

    var currentMembers = currentGroup.members;

    var membersRequests = Promise.all(currentMembers.map(function(member) {
      return new Promise((resolve, reject) => {
        return bot.api.users.info({user: member}, (err, memberInfo) => {
          if (err) { return reject(err); }
          resolve(memberInfo);
        });
      })}));

    membersRequests.then(function(currentMemberInfo) {
      var players = currentMemberInfo.filter(function(memberInfo) {
        return !memberInfo.user.is_bot;
      });

      var starter = players[Math.floor(Math.random() * players.length)];
      const allPlayers = [
        ...players
      ];
      const playerStr = allPlayers.reduce((first,next) => {
        first.push(next.user.name);
        return first;
      }, []);
      newState.players = players;
      newState.spy = players.splice(Math.floor(Math.random() * players.length), 1)[0];
      db.storeState(message.channel, newState).then(() => {
        const {spy, location} = newState;

        translator.informSpy(spy, playerStr);

        players.forEach(function(player) {
          translator.informNonSpy(player, location, playerStr);
        });

        translator.announceNewGame(starter);
        
      }).catch((error) => {
        debug(`Error: encountered an error saving state`, error);
      });

    });
  });
}


function endGame(message) {
  let newState = {
    gameInProgress: false
  };
  db.storeState(message.channel, newState).catch((error) => {
    debug(`Error: encountered an error saving state`, error);
  });
}


function getMessageAction(message, spy, location) {
  console.log("get message action", message.text, !!spy);
  
  const messageText = message.text;
  
  if (!messageText) {
    return {type: "NEW_GAME"};
  }
  
  if (messageText === 'list') {
    return {type: "LIST"};
  }
  
  if (spy && messageText.toLowerCase().indexOf('accuse') > -1) {
    if (message.user_name === messageText.split("accuse ").pop() && messageText.toLowerCase().indexOf(spy.user.name.toLowerCase()) > -1) {
      return {
        type: "ERROR_SPY_GUESS_SELF"
      };
    } else if (messageText.split("accuse ").pop() == 'accuse') {
      return {
        type: "ERROR_NO_SPY_GUESS"
      };
    } else {
      return {
        type: "ACCUSE",
        data: {
          correct: messageText.toLowerCase().indexOf(spy.user.name.toLowerCase()) > -1
        }
      };
    }
  }
  
  if (messageText.toLowerCase().indexOf('end') > -1) {
    return {
      type: "END_GAME"
    }
  }
  
  if (spy && messageText.toLowerCase().indexOf('guess') > -1) {
    console.log("guess", message.user_name, spy.user.name);
    if (message.user_name !== spy.user.name) {
      return {
        type: "ERROR_NON_SPY_GUESS_LOCATION"
      };
    } else {
      return {
        type: "GUESS_LOCATION",
        data: {
          spyWon: messageText.toLowerCase().indexOf(location.toLowerCase()) > -1
        }
      };
    }
  }
  
  return {
    type: "INVALID_COMMAND"
  };
  
}

function handleMessage(bot, message, state={}) {
  let {
    spy,
    location,
    gameInProgress
  } = (state || {});
  console.log("handle message", state);
  const translator = new MessageTranslator(bot, message);
  
  const action = getMessageAction(message, spy, location);
  console.log("action", action);
  
  if (!gameInProgress && action.type !== "NEW_GAME" && action.type !== "LIST") {
    translator.errorGameNotInProgress();
    return;
  }
  
  switch (action.type) {
    case "ACCUSE":
      translator.beginAccusePolling();
      break;
    case "END_GAME":
      translator.endedGame();
      return endGame(message);
    case "ERROR_NON_SPY_GUESS_LOCATION":
      translator.errorNonSpyAttemptGuessLocation();
      break;
    //case "ERROR_SPY_GUESS_SELF":
    //  translator.errorSpyGuessSelf();
    //  break;
    case "ERROR_NO_SPY_GUESS":
      translator.errorNoSpyGuess();
      break;
    case "GUESS_LOCATION":
      if (action.data.spyWon) {
        translator.spyWon(spy, location);
      } else {
        translator.spyLost(spy, location);
      }
      return endGame(message);
    case "INVALID_COMMAND":
      translator.errorInvalidCommand();
      break;
    case "LIST":
      translator.listLocations();
      break;
    case "NEW_GAME":
      return newGame(bot, message, translator);
    default:
      console.log("Unknown action type", action.type);
  }
  
}

function handleInteractiveMessage(bot, message, state) {
  const {spy, players, location} = state;
  console.log("handle interactive message", message);
  if (message.actions[0]) {
    const reply = message.original_message;

    const person = '<@' + message.user + '>';
    const yesAttachments = reply.attachments[1].text ? reply.attachments[1].text.split(', ') : [];
    let yesVotes = yesAttachments.filter(user => user !== person);
    const noAttachments = reply.attachments[2].text ? reply.attachments[2].text.split(', ') : [];
    let noVotes = noAttachments.filter(user => user !== person);
    
    const supporters = message.actions[0].name === 'yes' ? yesVotes : noVotes;
    supporters.push(person);
    if (message.actions[0].name === 'yes' && players.length === supporters.length) {
      const translator = new MessageTranslator(bot, message);
      if (reply.attachments[0].title.split("accused ").pop().toLowerCase().indexOf(spy.user.name.toLowerCase()) > -1) {
        translator.accusedSuccessfully(spy, location);
      } else {
        translator.accusedIncorrectly(spy, location);
      }
      return endGame(message);
    } else {
      reply.attachments[(message.actions[0].name === 'yes' ? 1 : 2)].text = supporters.join(', ');
      reply.attachments[(message.actions[0].name === 'yes' ? 2 : 1)].text = (message.actions[0].name === 'yes' ? noVotes : yesVotes).join(', ');
    }
    bot.replyInteractive(message, reply);
   }
}

module.exports = function(controller) {
  controller.on('slash_command', function(bot, message) {
    db.getState(message.channel).then(function(state){
      bot.replyAcknowledge();
      debug(`Got state new channel`, message.channel, state);
      handleMessage(bot, message, state);
    }).catch(function(err){
      console.log(`Error: encountered an error loading state`, err);
      debug(`Error: encountered an error loading state`, err);
    });
  });

  controller.middleware.receive.use(function(bot, message, next) {
    if (message.type == 'interactive_message_callback') {
      db.getState(message.channel).then(function(state){
        handleInteractiveMessage(bot, message, state);
      }).catch(function(err){
        console.log(`Error: encountered an error loading state`, err);
        debug(`Error: encountered an error loading state`, err);
      });
    }

    next();    
  });
}