(function () {
  var pollDialogs = {
    styles: {
      //Container (Holds both background and dialog box)
      containerClassName: "windowDialogContainer",
      //Background
      backgroundClassName: "windowDialogBackground",
      //Dialog
      dialogClassName: "windowDialogBox",
      //Button
      buttonClassName: "windowDialogButton",
      //Header
      headerClassName: "windowDialogHeader",
      //Input (Where you type text)
      inputClassName: "windowDialogInput"
    },
    texts: {
      ok: "OK",
      cancel: "Cancel",
    },
    _createDialogBase () {
      var background = document.createElement("div");
      background.style.position = "fixed";
      background.style.top = "0";
      background.style.left = "0";
      background.style.width = "100vw";
      background.style.height = "100vh";
      background.style.opacity = "0.5";
      background.className = this.styles.backgroundClassName;
      
      var dialogBox = document.createElement("div");
      dialogBox.style.position = "fixed";
      dialogBox.style.top = "50%";
      dialogBox.style.left = "50%";
      dialogBox.style.transform = "translate(-50%, -50%)";
      dialogBox.style.width = "fit-content";
      dialogBox.style.height = "fit-content";
      dialogBox.style.padding = "20px";
      dialogBox.style.maxWidth = "500px";
      dialogBox.style.maxHeight = "300px";
      dialogBox.style.minWidth = "300px";
      dialogBox.style.minHeight = "300px";
      dialogBox.style.overflow = "auto";
      dialogBox.className = this.styles.dialogClassName;
      
      var dialogContainer = document.createElement("div");
      dialogContainer.style.zIndex = "9999999";
      dialogContainer.className = this.styles.containerClassName;
      dialogContainer.append(background);
      dialogContainer.append(dialogBox);
      
      return {background,dialogBox,dialogContainer};
    },
    _createButtonBase () {
      var button = document.createElement("div");
      button.className = this.styles.buttonClassName;
      button.style.width = "fit-content";
      button.style.height = "fit-content";
      button.style.minWidth = "30px";
      button.style.minHeight = "20px";
      button.style.padding = "3px";
      button.style.cursor = "pointer";
      button.style.display = "inline-block";
      
      return button;
    },
    _createHeaderBase () {
      var span = document.createElement("span");
      span.className = this.styles.headerClassName;
      
      return span;
    },
    _createTextBase () {
      var span = document.createElement("span");      
      return span;
    },
    _createBreakBase () {
      var br = document.createElement("br");
      return br;
    },
    _createTextInputBase () {
      var input = document.createElement("input");
      input.type = "text";
      input.className = this.styles.inputClassName;
      
      return input;
    },
    _appendHeaders (message,dialogBox) {
      for (var m of message.split("\n")) {
        var header = this._createHeaderBase();
        header.textContent = m;
        dialogBox.append(header);
        dialogBox.append(this._createBreakBase());
      }
    },
    displayButtonChooser: function (message,buttonTexts) {
      
      var {dialogBox,background,dialogContainer} = this._createDialogBase();
      
      dialogBox.focus();
      
      this._appendHeaders(message,dialogBox);
      
      document.body.append(dialogContainer);
      
      return new Promise((accept) => {
        buttonTexts.forEach((buttonText,index) => {
          var button = this._createButtonBase();
          button.textContent = buttonText;
          button.onclick = function () {
            dialogContainer.remove();
            accept(index);
          };
          dialogBox.append(button);
        });
      })
    },
    //Dialogs
    createPoll: function () {
      
      var {dialogBox,background,dialogContainer} = this._createDialogBase();
      
      dialogBox.focus();
      
      document.body.append(dialogContainer);
      
      this._appendHeaders("Create poll",dialogBox);
      
      var questionText = this._createTextBase();
      questionText.textContent = "Question:";
      dialogBox.append(questionText);
      
      var questionInput = this._createTextInputBase();
      questionInput.placeholder = "Example: What is your favorite color?";
      dialogBox.append(questionInput);
      
      dialogBox.append(this._createBreakBase());
            
      var answerContainer = document.createElement("div");
      dialogBox.append(answerContainer);
      
      var choices = [];
      var t = this;
      function addChoice (index) {
        var choiceContainer = document.createElement("div");
        
        var choiceText = t._createTextBase();
        choiceText.textContent = "Response choice text:";
        choiceContainer.append(choiceText);

        var choiceInput = t._createTextInputBase();
        choiceInput.placeholder = "Example: green";
        choiceInput.value = choices[index];
        choiceInput.onchange = function () {
          choices[index] = choiceInput.value;
        };
        choiceInput.onkeydown = function (e) {
          if (e.key == "Enter") {
            e.preventDefault();
            choices.push("");
            refreshChoices();
          }
        };
        choiceContainer.append(choiceInput);
        
        choiceContainer.append(t._createBreakBase());
        
        answerContainer.append(choiceContainer);
      }
      
      function refreshChoices () {
        var c = [];
        for (var ch of answerContainer.children) {
          c.push(ch);
        }
        for (var ch of c) {
          ch.remove();
        }
        var index = 0;
        while (index < choices.length) {
          addChoice(index);
          index += 1;
        }
      }
      
      var addChoiceButton = this._createButtonBase();
      addChoiceButton.textContent = "Add response choice";
      dialogBox.append(addChoiceButton);
      
      addChoiceButton.onclick = function () {
        try{
          choices.push("");
          refreshChoices();
        }catch(e){
          window.alert(e);
        }
      };
      
      
      choices.push("");
      choices.push("");
      refreshChoices();
      
      
      var removeChoiceButton = this._createButtonBase();
      removeChoiceButton.textContent = "Remove last response choice";
      dialogBox.append(removeChoiceButton);
      
      removeChoiceButton.onclick = function () {
        choices.pop()
        refreshChoices();
      };
      
      return new Promise((accept) => {
        dialogBox.append(this._createBreakBase());
        var startPollButton = this._createButtonBase();
        startPollButton.textContent = "Start poll";
        dialogBox.append(startPollButton);

        startPollButton.onclick = function () {
          if (choices.length < 2) {
            dialog.alert("You must have at lease two choices availible to poll.");
            return;
          }
          if (choices.length > 100) {
            dialog.alert("You have too many choices");
            return;
          }
          for (var choice of choices) {
            if (choice.length < 1) {
              dialog.alert("One of your choices is empty");
              return;
            }
            if (choice.length > 100) {
              dialog.alert("One of your choices is too long");
              return;
            }
          }
          if (questionInput.value.length < 1) {
            dialog.alert("Your question is empty");
            return;
          }
          dialogContainer.remove();
          accept({
            question: questionInput.value,
            choices: choices
          });
        };
        
        var cancelPollButton = this._createButtonBase();
        cancelPollButton.textContent = "Cancel poll";
        dialogBox.append(cancelPollButton);
        
        cancelPollButton.onclick = function () {
          dialogContainer.remove();
          accept();
        };
      })
    },
    displayPoll: function (createdPoll) {
      var {dialogBox,background,dialogContainer} = this._createDialogBase();
      
      dialogBox.focus();
      
      document.body.append(dialogContainer);
      
      this._appendHeaders("Poll",dialogBox);
      
      var questionText = this._createTextBase();
      questionText.textContent = "Question: "+createdPoll.question;
      dialogBox.append(questionText);
      
      var pollDiv = document.createElement("div");
      dialogBox.append(pollDiv);
      
      var choiceButtons = [];
      return new Promise((accept) => {
        var cancelButton = this._createButtonBase();
          cancelButton.textContent = "Don't vote";
        cancelButton.onclick = function () {
          dialogContainer.remove();
          accept({accepted:false});
        };
        createdPoll.choices.forEach((text,index) => {
          var pollButton = this._createButtonBase();
          pollButton.textContent = "Choice - " + text;
          pollDiv.append(pollButton);
          pollDiv.append(this._createBreakBase());
          pollButton.onclick = function () {
            dialogContainer.remove();
            accept({ accepted: true,index});
          };
        });
        dialogBox.append(this._createBreakBase());
        dialogBox.append(cancelButton);
      });
    },
    displayResults: function (createdPollResults) {
      var {dialogBox,background,dialogContainer} = this._createDialogBase();
      
      dialogBox.focus();
      
      document.body.append(dialogContainer);
      
      this._appendHeaders("Poll Results",dialogBox);
      
      var questionText = this._createTextBase();
      questionText.textContent = "Question: "+createdPollResults.question;
      dialogBox.append(questionText);
      
      var pollDiv = document.createElement("div");
      dialogBox.append(pollDiv);
      var i = 0;
      var sortedVotes = [];
      for (var text of createdPollResults.choices) {
        var count = 0;
        var users = [];
        var votes = createdPollResults.votes[i];
        if (votes) {
          for (var voteUsername of votes) {
            users.push(voteUsername);
            count += 1;
          }
        }
        sortedVotes.push({
          text,
          count
        });
        var choiceText = this._createTextBase();
        
        choiceText.textContent = `* ${text} - No votes`;
        if (count > 0) {
          choiceText.textContent = `* ${text} - ${count} Vote(s) [${users.join(",")}]`;
        }
        pollDiv.append(choiceText);
        pollDiv.append(this._createBreakBase());
        i += 1;
      }
      sortedVotes = sortedVotes.sort((a,b) => {
        return b.count - a.count;
      });
      var winners = [];
      var number = sortedVotes[0].count;
      for (var vote of sortedVotes) {
        if (vote.count == number) {
          winners.push(vote.text);
        }
      }
      this._appendHeaders("Winner(s): "+winners,dialogBox);
      return new Promise((accept) => {
        var closeButton = this._createButtonBase();
        closeButton.textContent = "Close";
        closeButton.onclick = function () {
          dialogContainer.remove();
          accept();
        };
        dialogBox.append(closeButton);
        
      });
    }
  };
  window.pollDialogs = pollDialogs;
})();