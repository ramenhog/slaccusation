

let messageData = {};
const TIMEOUT_IN_SECS = 10;

function getAttachments(ellapsedTimeSecs, yesVotes, noVotes) {
  let actions = [];
  if (ellapsedTimeSecs < TIMEOUT_IN_SECS) {
    actions = [
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
    ];
  }
  
  return [
        {
            title: `Interactive`,
            callback_id: '123',
            attachment_type: 'default',
            actions
        },
        {
          title: 'Yes :thumbsup:',
          text: yesVotes.map((id) => `<@${id}>`).join(", "),
        },
        {
          title: 'No :no_entry_sign:',
          text: noVotes.map((id) => `<@${id}>`).join(", "),
        },
        {
          title: 'Time remaining',
          text: `${Math.floor(TIMEOUT_IN_SECS - ellapsedTimeSecs)}s`
        }
    ];
}

function updateMessage(ts) {
  console.log("update");

  const data = messageData[ts];
  if (!data) {
    console.log("Data not found?");
    return;
  }
  
  if (messageData[ts].timeoutId) {
    clearTimeout(messageData[ts].timeoutId);
    messageData[ts].timeoutId = null;
    console.log("cleared timeout");
    // return;
  }
  
  let ellapsedTimeSecs = ((new Date()).getTime() - messageData[ts].state.createdAt) / 1000;
  const {yesVotes, noVotes} = messageData[ts].state;
  const attachments = getAttachments(ellapsedTimeSecs, yesVotes, noVotes);
  // console.log("attachments", attachments);
  const messageToUpdate = {
    ts,
    attachments: JSON.stringify(attachments),
    channel: data.src.channel,
    as_user: true // ?
  };
  data.bot.api.chat.update(messageToUpdate, (err, result) => {
    console.log("updated", err, result);
    const currentEllapsedTimeSecs = ((new Date()).getTime() - messageData[ts].state.createdAt) / 1000;
    if (!err && ellapsedTimeSecs <= TIMEOUT_IN_SECS) {
      const msUntilNextSec = (Math.ceil(currentEllapsedTimeSecs) - currentEllapsedTimeSecs) * 1000;
      messageData[ts].timeoutId = setTimeout(() => {
        updateMessage(ts);
      }, msUntilNextSec);
    }
  });
}

function handleInteractiveMessage(bot, message) {
  // console.log("handle interactive", message);
  
  const now = (new Date()).getTime();
  const ts = message.original_message.ts;
  const user = message.user;
  const [action] = message.actions;
  if (action && messageData[ts]/*&& messageData[ts].createdAt + TIMEOUT_IN_SECS >= now*/) {
    console.log("Would handle action");
    let {yesVotes, noVotes} = messageData[ts].state;
    yesVotes = yesVotes.filter((id) => id !== user);
    noVotes = noVotes.filter((id) => id !== user);
    (action.value === 'yes' ? yesVotes : noVotes).push(user);
    messageData[ts].state = Object.assign({}, messageData[ts].state, {yesVotes, noVotes});
    updateMessage(ts);
  }
  
}

function newMessage() {
  
}

function main(bot, message) {
  console.log("Hello World!");
  // console.log(message);
  const src = {
    response_url: message.response_url,
    channel: message.channel_id,
  }
  bot.reply(src, {
    attachments: getAttachments(0, [], [])
  }, (err, result) => {
    console.log("sent interactive message", err, result);
    // const newMessage = result.message;
    const data = {
      ts: result.ts,
      bot,
      src: Object.assign(src, {ts: result.ts}),
      state: {
        createdAt: (new Date()).getTime(),
        yesVotes: [],
        noVotes: []
      },
      timeoutId: null
    };
    messageData[result.ts] = data;
    updateMessage(result.ts);
  });
}

module.exports = {
  main,
  handleInteractiveMessage
};