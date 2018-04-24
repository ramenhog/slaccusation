# Slaccusation

A Slack-based game of espionage and deception

---
## Installation
Visit [http://slaccusation.glitch.me/](http://slaccusation.glitch.me/) to add Slaccusation to your Slack workspace.

---
## Instructions for game play

### Starting a game.
Invite *Slaccusation bot* and all players to a *group direct message* in your Slack workspace. Type `/slaccusation` to begin a game &#42;.

Players will then receive a private message from Slaccusation bot with either the location or their role as a spy.

Slaccusation bot will also post a starting message in the group DM signifying the start of the game and assigning a specific player to begin questioning.

### Accessing the list of possible locations.
Type `/slaccusation list` to see all possible locations. This feature is most useful for the spy.

### Ending the game.
There are 3 ways a game can end:

#### 1. Accusing a player of being the spy
Once per game, each player is allowed to declare another player as being the spy by using the command `/slaccusation accuse [username]` to put it to a vote.

If players do not all agree, then the game continues. If the vote is unanimous, Slaccusation bot will  officially accuse the suspected player and end the game.

Slaccusation bot will then reveal whether the accusation was correct. If so, the non-spies will have won the game and Slaccusation bot will reveal the location. If not, the spy will have won and Slaccusation bot will reveal the identity of the actual spy.

#### 2. Guessing the location
The spy is allowed one chance to end the game by guessing the location with `/slaccusation guess [location name]`. The location name must match a location name from the official list.

If the location is guessed correctly, the spy wins and his/her identity is revealed to the non-spies. If the guess is incorrectly, the non-spies win and the location is revealed to the spy.

#### 3. Forcibly ending the game
To end the game for any other reason, type `/slaccusation end`.

---

## About
Slaccusation was created by [Stef Liu](https://ramenhog.com) and [Rich Clark](https://rich-clark.com) and inspired by the board game, [Spyfall](https://boardgamegeek.com/boardgame/166384/spyfall).

---

**Known Error**

&#42; Since Glitch projects sleep after [5 minutes of idleness](https://glitch.com/faq#restrictions), if the bot is sleeping, Slaccusation bot may respond with an `operation timeout` error. In that case, just try the command again and it should work.

