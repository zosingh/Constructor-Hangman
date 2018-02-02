//require npm inquirer and is-letter
//is-letter checks if it is a one character letter 
var inquirer = require('inquirer');
var isLetter = require('is-letter');

//require objects/exports
var Word = require('./word.js');
var Game = require('./game.js');


//hangman graphic.... still working on this
var hangManDisplay = Game.newWord.hangman; 

//set the maxListener
require('events').EventEmitter.prototype._maxListeners = 100;


var hangman = {
  //bring in the team name from game.js
  wordBank: Game.newWord.wordList,
  guessesRemaining: 10,
  //empty array to hold letters guessed and check to see if letter was already guessed by player
  guessedLetters: [],
  
  display: 0,
  currentWord: null,

  //_____asks player if they would like to play_____
  startGame: function() {
    var that = this;
    //clears guessedLetters before a new game starts if it's not already empty.
    if(this.guessedLetters.length > 0){
      this.guessedLetters = [];
    }

    inquirer.prompt([{
      name: "play",
      type: "confirm",
      message: "So do you wanna play so NFL Hangman?"
    }])

    .then(function(answer) {
      if(answer.play){
        that.newGame();
      } else{
        console.log("Fine, I didn't want to play anyway..");
      }
    })},

  //_____starts a new game if they want to play_____
  newGame: function() {
    if(this.guessesRemaining === 10) {
      console.log("Okay! Here we go!");
      console.log('*****************');
      //generates random number based on the wordBank
      var randNum = Math.floor(Math.random()*this.wordBank.length);
      this.currentWord = new Word(this.wordBank[randNum]);
      this.currentWord.getLets();
      //displays current word as blanks.
      console.log(this.currentWord.renderTheWord());
      this.rePromptPlayer();
    } else{
      this.resetGuessesRemaining();
      this.newGame();
    }
  },

  resetGuessesRemaining: function() {
    this.guessesRemaining = 10;
  },

  //____PROMPT Player for letter____
  rePromptPlayer : function(){
    var that = this;
    //asks player for a letter
    inquirer.prompt([{
      name: "chosenLtr",
      type: "input",
      message: "Choose a letter:",
      //Use the npm is-letter here to validate the character 
      validate: function(value) {
        if(isLetter(value)){
          return true;
        } else{
          return false;
        }
      }
    }]).then(function(ltr) {
      // using toUpperCase becuase all the words I used in my bank are in CAPS 
      var letterReturned = (ltr.chosenLtr).toUpperCase();
      //adds to the guessedLetters array 
      var guessedAlready = false;
        for(var i = 0; i<that.guessedLetters.length; i++){
          if(letterReturned === that.guessedLetters[i]){
            guessedAlready = true;
          }
        }
        //if the letter wasn't guessed already run through entire function, else reprompt player
        if(guessedAlready === false){
          that.guessedLetters.push(letterReturned);

          var found = that.currentWord.wasLetterFound(letterReturned);
          //if letter not found tell player they were wrong
          if(found === 0){
            console.log('NOPE! You guessed that one wrong. haha');
            that.guessesRemaining--;
            that.display++;

            //let player know # of guesses remaining 
            console.log('Guesses remaining: ' + that.guessesRemaining);
            console.log(hangManDisplay[(that.display)-1]);

            console.log('\n*******************');
            console.log(that.currentWord.renderTheWord());
            console.log('\n*******************');
            console.log("Letters guessed: " + that.guessedLetters);

          } else{
            console.log('NICE!, You guessed that one right!');
              //checks to see if player has won
              if(that.currentWord.findingTheWord() === true){
                console.log(that.currentWord.renderTheWord());
                console.log('YOU WON, Nice work!!! give it another shot...');
      
              } else{
                // display the player how many guesses remaining
                console.log('Guesses remaining: ' + that.guessesRemaining);
                console.log(that.currentWord.renderTheWord());
                console.log('\n*******************');
                console.log("Letters guessed: " + that.guessedLetters);

              }
          }
          if(that.guessesRemaining > 0 && that.currentWord.wordFound === false) {
            that.rePromptPlayer();
          }else if(that.guessesRemaining === 0){
            console.log('Dang, you gotta brush up on your NFL teams. GAME OVER!');
            console.log('The team name you were guessing was: ' + that.currentWord.word);
          }
        } else{
            console.log("Whatcha smoking kid? You already used that letter. Try again.")
            that.rePromptPlayer();
          }
    });
  }
}

hangman.startGame();