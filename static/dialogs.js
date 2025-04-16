(function () {
  var dialog = {
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
    alert: function (message) {
      
      var {dialogBox,background,dialogContainer} = this._createDialogBase();
      
      dialogBox.focus();
      
      document.body.append(dialogContainer);
      
      this._appendHeaders(message,dialogBox);
      
      var acceptButton = this._createButtonBase();
      acceptButton.textContent = this.texts.ok;
      dialogBox.append(acceptButton);
      
      return new Promise((accept) => {
        acceptButton.onclick = function () {
          accept();
          dialogContainer.remove();
        };
      })
    },
    prompt: function (message) {
      
      var {dialogBox,background,dialogContainer} = this._createDialogBase();
      
      dialogBox.focus();
      
      document.body.append(dialogContainer);
      
      this._appendHeaders(message,dialogBox);
      
      var input = this._createTextInputBase();
      dialogBox.append(input);
      
      var acceptButton = this._createButtonBase();
      acceptButton.textContent = this.texts.ok;
      dialogBox.append(acceptButton);
      
      var cancelButton = this._createButtonBase();
      cancelButton.textContent = this.texts.cancel;
      dialogBox.append(cancelButton);
      
      return new Promise((accept) => {
        acceptButton.onclick = function () {
          if (input.value.length < 1) {
            accept(undefined);
          } else {
            accept(input.value);
          }
          dialogContainer.remove();
        };
        cancelButton.onclick = function () {
          accept();
          dialogContainer.remove();
        };
      })
    },
    confirm: function (message) {
      
      var {dialogBox,background,dialogContainer} = this._createDialogBase();
      
      dialogBox.focus();
      
      document.body.append(dialogContainer);
      
      this._appendHeaders(message,dialogBox);
      
      var acceptButton = this._createButtonBase();
      acceptButton.textContent = this.texts.ok;
      dialogBox.append(acceptButton);
      
      var cancelButton = this._createButtonBase();
      cancelButton.textContent = this.texts.cancel;
      dialogBox.append(cancelButton);
      
      return new Promise((accept) => {
        acceptButton.onclick = function () {
          accept(true);
          dialogContainer.remove();
        };
        cancelButton.onclick = function () {
          accept(false);
          dialogContainer.remove();
        };
      })
    }
  };
  
  window.dialog = dialog;
})();