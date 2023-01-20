// <reference path="http://code.createjs.com/createjs-2013.12.12.min.js" />
// <reference path="../../../Content/GamesDownloadTemplate/lib/ScormHelper.js" />

// TODO:
// Add sounds

var Game =
  Game ||
  (function (createjs) {
    function Game(canvas, gameData) {
      // Game variables

      var self = this;
      self.stage = new createjs.Stage(canvas);
      var stageBg = new createjs.Shape();
      stageBg.name = "stageBg";
      stageBg.graphics
        .setStrokeStyle(3)
        .beginStroke("black")
        .beginFill("silver")
        .drawRect(0, 0, 800, 600)
        .endStroke()
        .endFill();
      self.stage.addChild(stageBg);
      var badAndroidDevice =
        navigator.userAgent.indexOf("Android") > -1 &&
        !(navigator.userAgent.indexOf("Chrome") > -1);
      if (badAndroidDevice && createjs.Touch.isSupported()) {
        stage.enableDOMEvents(false);
      }
      createjs.Touch.enable(self.stage, false, true);
      self.stage.enableMouseOver(25);
      self.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas
      createjs.Ticker.framerate = 50;
      self.stage.on("mouseleave", menuMouseLeave);
      self.previousView = null;
      self.currentView = null;
      var originalWidth = self.stage.canvas.width;
      var originalHeight = self.stage.canvas.height;
      sanitizeWords();
      var grid, resizeInterval, quit;
      var qData = "";
      var instructionsView = null;
      var count = 0;
      var cubeSize = 0;
      var drawSize = 0;
      var originalOrder = [];
      var cellCoords = [];
      var clickedCellCoords = [];
      var cellHilights = {};
      var vData = {};
      var hData = {};
      var vDataTemp = {};
      var hDataTemp = {};
      var playerAnswers = {};
      var tempPlayerAnswers = {};
      var cellTextObjects = {};
      var currentCellObject = {};
      var activeCellObject = {};
      var rotateDown = true;
      var scoreSubmitted = false;
      var gridMove = false;
      var gameOver = false;
      var update = false;
      var isLmsConnected = false;
      var currentLmsInteraction = null;
      var lastClicked = false;
      var gameLoaded = false;
      var clearActiveSelection = false;
      var menuOpen = false;
      var menuItemOver = false;
      var isMobileDevice = false;
      var allAnswers = false;
      var updatePaused = false;
      var incompleteConfirmation = false;
      var questions = gameData["Terms"];
      var questionCount = questions.length;
      var questionNumbers = Object.keys(questions);
      var assetsPath = gameData.assetsPath || "";
      var resourceLoader = new createjs.LoadQueue(true, assetsPath);
      var orientation = 0;
      var masterSound = createjs.Sound;
      var views = {
        questionBubble: null,
        prevArrow: null,
        nextArrow: null,
        textBoxInput: null,
        textBox: null,
        textBoxInputControl: null,
        markerSprites: null,
        deleteButton: null,
        clueTextBox: null,
        textBoxError: null,
        textBoxTotal: null,
        correctAnswerText: null,
        yourAnswerText: null,
        correctAnswerTextInput: null,
        yourAnswerTextInput: null,
        questionContainer: null,
        menuStrip: null,
        minimize: null,
        maximize: null,
        menuTitle: null,
        menuButtons: null,
        resizeNE: null,
        resizeNW: null,
        resizeSE: null,
        resizeSW: null,
        buttonContainer: null,
        miniContainer: null,
        miniTitleText: null,
        helpButton: null,
        pointsText: null,
        pointsText1: null,
        gameOverBox: null,
        gameOverBox1: null,
        gameView: null,
        returnButton: null,
        instructionView: null,
        puzzleContainer: null,
        gridContainer: null,
        questionTextBox: null,
        miniMenuContainer: null,
        menuContainer: null,
        displayMessage: null,
        messageText: null,
        barContainer: null,
        verticalBarBG: null,
        loadingShape: null,
        loadingContainer: null,
        loadingText: null,
        playContainer: null,
      };

      var helpers = {
        soundEffects: function () {
          try {
            var soundEffectsContainer = new createjs.Container();
            soundEffectsContainer.x = 0;
            soundEffectsContainer.y = 550;
            soundEffectsContainer.hitArea = new createjs.Shape(
              new createjs.Graphics().beginFill("#F00").drawCircle(0, 0, 50)
            );
            soundEffectsContainer.cursor = "pointer";

            var soundEffectsBG = new createjs.Bitmap(
              resourceLoader.getResult("instructions_background")
            );
            soundEffectsBG.x = 0;
            soundEffectsBG.y = 0;
            soundEffectsBG.rotation = 90;

            muteIcon = new createjs.Bitmap(resourceLoader.getResult("musicOn"));
            muteIcon.x = -50;
            muteIcon.y = -1;
            muteIcon.scaleX = 0.8;
            muteIcon.scaleY = 0.8;
            muteIcon.rotation = 0;

            soundEffectsContainer.addChild(soundEffectsBG, muteIcon);

            soundEffectsContainer.addEventListener("click", function () {
              try {
                //console.log("SOUND EFFECTS ENABLED OR DISABLED");
                var tempMute = masterSound.getMute();
                if (tempMute) {
                  // unMute
                  muteIcon.image = resourceLoader.getResult("musicOn");
                  masterSound.setMute(false);
                } else {
                  // reMute
                  muteIcon.image = resourceLoader.getResult("musicOff");
                  masterSound.setMute(true);
                }
              } catch (ex) {
                console.log("ERROR FROM helpers.instructions :: " + ex);
              }
            });
            soundEffectsContainer.on("mouseover", handleInstructionsMouseOver);
            soundEffectsContainer.on("mouseout", handleInstructionsMouseOver);

            function handleInstructionsMouseOver(event) {
              try {
                if (event.type == "mouseover") {
                  createjs.Tween.get(muteIcon, { loop: false }).to(
                    { scaleX: 1.0, scaleY: 1.0 },
                    50
                  );
                } else {
                  createjs.Tween.get(muteIcon, { loop: false }).to(
                    { scaleX: 0.8, scaleY: 0.8 },
                    50
                  );
                }
              } catch (ex) {
                console.log(
                  "ERROR FROM handleInstructionsMouseOver() :: " + ex
                );
              }
            }

            soundEffectsContainer.rotation = -90;
            return soundEffectsContainer;
          } catch (ex) {
            console.log("ERROR FROM helpers.soundEffects :: " + ex);
          }
        },
      };
      // THESE ARE WITHOUT SPECIAL CHARS
      //var validChars = new Array(8, 13, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85,
      //                           86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
      //                           121, 122);

      // THESE ARE WITH SPECIAL CHARS -- NO WHITE SPACES
      var validChars = new Array(
        8,
        13,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122
      );

      //var ratioX, ratioY, ratioPortrait, ratioLandscape;
      //if (window.document.documentElement.clientWidth < window.document.documentElement.clientHeight) {
      //    // Portrait
      //    ratioX = 1 - (window.document.documentElement.clientWidth / originalWidth);
      //    ratioY = 1 - (window.document.documentElement.clientHeight / originalHeight);
      //    ratioPortrait = ratioX > ratioY ? ratioX : ratioY;
      //    ratioX = 1 - (window.document.documentElement.clientHeight / originalWidth);
      //    ratioY = 1 - (window.document.documentElement.clientWidth / originalHeight);
      //    ratioLandscape = ratioX > ratioY ? ratioX : ratioY;
      //}
      //else
      //{
      //    // Landscape
      //    ratioX = 1 - (window.document.documentElement.clientWidth / originalWidth);
      //    ratioY = 1 - (window.document.documentElement.clientHeight / originalHeight);
      //    ratioLandscape = ratioX > ratioY ? ratioX : ratioY;
      //    ratioX = 1 - (window.document.documentElement.clientHeight / originalWidth);
      //    ratioY = 1 - (window.document.documentElement.clientWidth / originalHeight);
      //    ratioPortrait = ratioX > ratioY ? ratioX : ratioY;
      //}

      if (typeof ScormHelper !== "undefined") {
        isLmsConnected = ScormHelper.initialize();
      }
      if (isLmsConnected) {
        quit = function () {
          ScormHelper.cmi.exit("");
          ScormHelper.adl.nav.request("exitAll");
          ScormHelper.terminate();
        };
      } else {
        quit = function () {
          window.location = "https://zainuddinhazin.github.io/lab-escape";
        };
      }

      if (
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
      ) {
        isMobileDevice = true;
      }

      // setup the resources to be loaded.
      (function () {
        resourceLoader.installPlugin(createjs.Sound);
        +"img/";
        var assets = [
          { id: "exitYellowBtn", src: "img/exitYellowBtn.png" },
          { id: "gameOverBox", src: "img/gameOverBox.png" },
          { id: "restartBtn", src: "img/restartBtn.png" },
          { id: "reviewBtn", src: "img/reviewBtn.png" },
          { id: "crosswordIcon", src: "img/crosswordIcon.png" },
          { id: "resetButton", src: "img/resetSizeButton.png" },
          { id: "crosswordTitle", src: "img/crosswordTITLE.png" },
          { id: "boardBackground", src: "img/crosswordsBG.jpg" },
          { id: "panUp", src: "img/panButtonUp.png" },
          { id: "panDown", src: "img/panButtonDown.png" },
          { id: "panLeft", src: "img/panButtonLeft.png" },
          { id: "panRight", src: "img/panButtonRight.png" },
          { id: "zoomIn", src: "img/zoomIn.png" },
          { id: "zoomOut", src: "img/zoomOut.png" },
          { id: "questionIcon", src: "img/questionIcon.png" },
          { id: "helpButton", src: "img/helpButton.png" },
          { id: "prevQuestion", src: "img/arrowBack.png" },
          { id: "nextQuestion", src: "img/arrowNext.png" },
          { id: "checkMarkSprite", src: "img/submitSprite.png" },
          { id: "closeButton", src: "img/exitYellowBtn.png" },
          { id: "sceneBg", src: "img/sceneBg.png" },
          { id: "sceneBg1", src: "img/sceneBg-1.png" },
          { id: "sceneBg2", src: "img/sceneBg-2.png" },
          { id: "sceneBg3", src: "img/sceneBg-3.png" },
          { id: "sceneBg4", src: "img/sceneBg-4.png" },
          { id: "title_background", src: "img/crosswordBackgroundTitle.png" },
          { id: "start_button", src: "img/playButton.png" },
          { id: "next_button", src: "img/nextButton.png" },
          { id: "delete_button", src: "img/garbageCan.png" },
          // { id: "instructions_background", src: "img/instructions_background.png" },
          // { id: "instructions_question", src: "img/instructions_question.png" },
          { id: "musicOff", src: "img/musicOff.png" },
          { id: "musicOn", src: "img/musicOn.png" },
        ];
        resourceLoader.loadManifest(assets);

        // And the Sound Effects
        var soundEffects = [
          { id: "bgMusic", src: "Audio/bgMusic.mp3", data: 1 },
          { id: "buttonPress", src: "Audio/buttonPress.mp3", data: 1 },
          { id: "error", src: "Audio/error.mp3", data: 1 },
          { id: "goodTone", src: "Audio/goodTone.mp3", data: 1 },
          { id: "swoosh", src: "Audio/swoosh.mp3", data: 1 },
        ];
        resourceLoader.loadManifest(soundEffects);
      })();

      /****************
           Mouse Events
         ****************/

      function bubbleContainerMouseDown(e) {
        var notSet = false;
        if (!views.questionContainer.x) {
          views.questionContainer.x = 140;
          notSet = true;
        }
        if (!views.questionContainer.y) {
          views.questionContainer.y = 380;
          notSet = true;
        }
        if (!views.questionContainer.width) {
          views.questionContainer.width =
            views.questionBubble.getBounds().width;
          notSet = true;
        }
        if (!views.questionContainer.height) {
          views.questionContainer.height =
            views.questionBubble.getBounds().height;
          notSet = true;
        }
        if (notSet) {
          views.questionContainer.setBounds(
            views.questionContainer.x,
            views.questionContainer.y,
            views.questionContainer.width,
            views.questionContainer.height
          );
          self.stage.update();
        }
        update = true;
        views.questionContainer.offset = {
          x: views.questionContainer.x - e.stageX,
          y: views.questionContainer.y - e.stageY,
        };
        views.questionContainer.minX = 1;
        views.questionContainer.maxX = 799 - views.questionContainer.width;
        views.questionContainer.minY = 1;
        views.questionContainer.maxY = 600 - views.questionContainer.height;
      }

      function bubbleContainerMouseMove(e) {
        var newX = e.stageX + views.questionContainer.offset.x;
        var newY = e.stageY + views.questionContainer.offset.y;
        views.questionContainer.x = newX;
        views.questionContainer.y = newY;
        if (newX < 0) views.questionContainer.x = 1;
        if (newX > views.questionContainer.maxX)
          views.questionContainer.x = views.questionContainer.maxX;
        if (newY < 0) views.questionContainer.y = 1;
        if (newY > views.questionContainer.maxY)
          views.questionContainer.y = views.questionContainer.maxY;
        setInputPosition();
      }

      function bubbleContainerMouseUp(e) {
        update = true;
      }

      function cubeMouseClick(e) {
        if (gameOver) return false;
        if (isMobileDevice) {
          cubeMouseOver(e);
        }
        if (gridMove) {
          gridMove = false;
          return false;
        }
        clearActiveSelection = false;
        if (activeCellObject.hasOwnProperty("target"))
          clearCellHilights(activeCellObject["target"]["cells"], false);
        tweenToPurple(currentCellObject);
        maximizeMouseClick();
        activeCellObject = $.extend(true, {}, currentCellObject);
        views.textBoxInput.focus();
      }

      function cubeMouseDown(e) {
        mouseDownEvent(e);
      }

      function cubeMouseOut(e) {
        if (e) {
          if (!gameOver) {
            if (
              !self.stage.getObjectUnderPoint(e.stageX, e.stageY).name ||
              !self.stage
                .getObjectUnderPoint(e.stageX, e.stageY)
                .name.match(/^-?[0-9][,]-?[0-9]/)
            ) {
              clearCellHilights(cellCoords, true);
              if (activeCellObject.hasOwnProperty("target"))
                displayQuestionWithoutObject(activeCellObject.questionNumber);
            }
          }
        }
      }

      function cubeMouseOver(e) {
        var questionNumber = hData.hasOwnProperty(e.currentTarget.name)
          ? hData[e.currentTarget.name][1]
          : vData[e.currentTarget.name][1];
        if (
          (!activeCellObject.hasOwnProperty("target") ||
            activeCellObject["target"]["cells"] != cellCoords) &&
          currentCellObject.questionNumber != questionNumber
        ) {
          clearCellHilights(cellCoords, true);
        }
        var obj = displayQuestion(questionNumber, e);
        currentCellObject = $.extend(true, {}, obj);
        currentCellObject["questionNumber"] = questionNumber;
        if (
          !activeCellObject.hasOwnProperty("target") ||
          activeCellObject.questionNumber != questionNumber
        )
          addCellHighlight(obj);
      }

      function cubePressMove(e) {
        clearActiveSelection = false;
        gridMove = true;
        var oldX = views.gridContainer.x;
        var newX = e.stageX + views.gridContainer.offset.x;
        views.gridContainer.x = newX;
        if (
          views.gridContainer.getTransformedBounds().x <
            views.gridContainer.minX ||
          views.gridContainer.getTransformedBounds().x >
            views.gridContainer.maxX
        )
          views.gridContainer.x = oldX;
        var oldY = views.gridContainer.y;
        var newY = e.stageY + views.gridContainer.offset.y;
        views.gridContainer.y = newY;
        if (
          views.gridContainer.getTransformedBounds().y <
            views.gridContainer.minY ||
          views.gridContainer.getTransformedBounds().y >
            views.gridContainer.maxY
        )
          views.gridContainer.y = oldY;
      }

      function cubePressUp() {
        if (gridMove) {
          gridMove = false;
          return false;
        }
        if (clearActiveSelection) {
          if (activeCellObject.hasOwnProperty("target")) {
            clearCellHilights(activeCellObject["target"]["cells"], "ignore");
            clearActiveSelection = false;
          }
        }
      }

      function gridMouseDown(e) {
        clearActiveSelection = true;
        mouseDownEvent(e);
      }

      function maximizeMouseClick() {
        if (views.questionContainer.saveCoords.minimized) {
          var sidebarHidden = views.barContainer.alpha;
          views.questionContainer.saveCoords.minimized = false;
          createjs.Tween.get(views.questionContainer).to(
            {
              x: views.questionContainer.saveCoords.x,
              y: views.questionContainer.saveCoords.y,
              scaleX: 1.0,
              scaleY: 1.0,
              alpha: 1.0,
            },
            250
          );
          createjs.Tween.get(views.miniContainer).to(
            {
              scaleX: 0.0,
              scaleY: 0.0,
              alpha: 0,
              x: sidebarHidden === 1.0 ? 215 : 76,
              y: 600,
            },
            250
          );
        }
      }

      function maximizeMouseDblClick(e) {
        views.questionContainer.x = 1;
        views.questionContainer.y = 349;
        if (!views.questionContainer.width) {
          views.questionContainer.width =
            views.questionBubble.getBounds().width;
        }
        if (!views.questionContainer.height) {
          views.questionContainer.height =
            views.questionBubble.getBounds().height;
        }
        views.questionContainer.setBounds(
          views.questionContainer.x,
          views.questionContainer.y,
          views.questionContainer.width,
          views.questionContainer.height
        );
        if (!views.questionBubble.startWidth)
          views.questionBubble.startWidth =
            views.questionBubble.getBounds().width;
        if (!views.questionBubble.startHeight)
          views.questionBubble.startHeight =
            views.questionBubble.getBounds().height;
        homeBounds();
        var bubble = views.questionContainer;
        var scaleX = views.questionBubble.scaleX - 2.065;
        var scaleY = views.questionBubble.scaleY - 1.15;
        var diff;
        var scale;
        var change;
        if (scaleX !== 0) {
          scale = 2.065;
          change = scaleX * views.questionBubble.width;
          views.questionBubble.scaleX = scale;
          views.menuStrip.scaleX = views.questionBubble.scaleX;
          bubble.startX = 1;
          diff =
            views.questionBubble.getTransformedBounds().width - bubble.width;
          changeChildBounds(diff, "horizontal", "resizeNE");
        }
        if (scaleY !== 0) {
          scale = 1.15;
          change = scaleY * views.questionBubble.height;
          views.questionBubble.scaleY = scale;
          diff =
            views.questionBubble.getTransformedBounds().height - bubble.height;
          bubble.startY = 349;
          changeChildBounds(diff, "vertical", "resizeSE");
        }
        var obj = new Object();
        obj["currentTarget"] = e.currentTarget.parent.parent.children[2];
        obj["nativeEvent"] = new Object();
        obj["nativeEvent"]["movementX"] = 0;
        obj["nativeEvent"]["movementY"] = 0;
        resizeMouseDown(obj);
        resizePressMove(obj);
      }

      function menuItemMouseOver(e) {
        menuOpen = true;
        if (menuItemOver) {
          //menuItemOver.currentTarget.children[0].graphics._fill.style = "rgba(255,255,255,0.01)";
          //e.currentTarget.children[0].graphics._fill.style = "rgba(255,255,255,0.5)";
          menuItemOver.currentTarget.children[0].graphics._fillInstructions[0].params[1] =
            "rgba(255,255,255,0.01)";
          e.currentTarget.children[0].graphics._fillInstructions[0].params[1] =
            "rgba(255,255,255,0.5)";
          menuItemOver = e;
        } else {
          //e.currentTarget.children[0].graphics._fill.style = "rgba(255,255,255,0.5)";
          e.currentTarget.children[0].graphics._fillInstructions[0].params[1] =
            "rgba(255,255,255,0.5)";
          menuItemOver = e;
        }
      }

      function menuMouseLeave() {
        if (menuOpen) {
          createjs.Tween.get(views.menuContainer).to(
            { x: 800, y: 0, scaleX: 0, scaleY: 0, alpha: 0.0 },
            250
          );
          createjs.Tween.get(views.miniMenuContainer).to(
            { scaleX: 1.0, scaleY: 1.0, alpha: 1.0, x: 750, y: 0 },
            250
          );
          menuOpen = false;
        }
        if (menuItemOver) {
          //menuItemOver.currentTarget.children[0].graphics._fill.style = "rgba(255,255,255,0.01)";
          menuItemOver.currentTarget.children[0].graphics._fillInstructions[0].params[1] =
            "rgba(255,255,255,0.01)";
          menuItemOver = false;
        }
      }

      function menuMouseOut(e) {
        if (menuOpen) {
          if (
            self.stage.getObjectUnderPoint(e.stageX, e.stageY).name !==
              "miniMenu" ||
            (isMobileDevice &&
              self.stage.getObjectUnderPoint(e.stageX, e.stageY).name ===
                "miniMenu")
          ) {
            createjs.Tween.get(views.menuContainer).to(
              { x: 800, y: 0, scaleX: 0, scaleY: 0, alpha: 0.0 },
              250
            );
            createjs.Tween.get(views.miniMenuContainer).to(
              { scaleX: 1.0, scaleY: 1.0, alpha: 1.0, x: 750, y: 0 },
              250
            );
            menuOpen = false;
          }
        }
        if (menuItemOver) {
          //menuItemOver.currentTarget.children[0].graphics._fill.style = "rgba(255,255,255,0.01)";
          menuItemOver.currentTarget.children[0].graphics._fillInstructions[0].params[1] =
            "rgba(255,255,255,0.01)";
          menuItemOver = false;
        }
      }

      function menuMouseOver() {
        createjs.Tween.get(views.menuContainer).to(
          { x: 600, y: 0, scaleX: 1.0, scaleY: 1.0, alpha: 0.9 },
          250
        );
        createjs.Tween.get(views.miniMenuContainer).to(
          { scaleX: 0.0, scaleY: 0.0, alpha: 0.0, x: 800, y: 0 },
          250
        );
        menuOpen = true;
      }

      function minimizeMouseClick() {
        if (!views.questionContainer.saveCoords.minimized) {
          var sidebarHidden = views.barContainer.alpha;
          views.questionContainer.saveCoords = {
            x: views.questionContainer.x,
            y: views.questionContainer.y,
            minimized: true,
          };
          createjs.Tween.get(views.questionContainer).to(
            {
              x: sidebarHidden === 1.0 ? 140 : 1,
              y: 600,
              scaleX: 0,
              scaleY: 0,
              alpha: 0.0,
            },
            250
          );
          createjs.Tween.get(views.miniContainer).to(
            {
              scaleX: 1.0,
              scaleY: 1.0,
              alpha: 1.0,
              x: sidebarHidden === 1.0 ? 140 : 1,
              y: 575,
            },
            250
          );
        }
      }

      function minimizeMouseDblClick(minimize) {
        if (!views.questionContainer.width) {
          views.questionContainer.width =
            views.questionBubble.getBounds().width;
        }
        if (!views.questionContainer.height) {
          views.questionContainer.height =
            views.questionBubble.getBounds().height;
        }
        views.questionContainer.setBounds(
          views.questionContainer.x,
          views.questionContainer.y,
          views.questionContainer.width,
          views.questionContainer.height
        );
        if (!views.questionBubble.startWidth)
          views.questionBubble.startWidth =
            views.questionBubble.getBounds().width;
        if (!views.questionBubble.startHeight)
          views.questionBubble.startHeight =
            views.questionBubble.getBounds().height;
        homeBounds();
        var bubble = views.questionContainer;
        var scaleX = 0.8566225725988693 - views.questionBubble.scaleX;
        var scaleY = 0.6963145095920737 - views.questionBubble.scaleY;
        var diff;
        var scale;
        var change;
        if (scaleX !== 0) {
          scale = 0.8566225725988693;
          change = scaleX * views.questionBubble.width;
          views.questionBubble.scaleX = scale;
          views.menuStrip.scaleX = views.questionBubble.scaleX;
          bubble.startX = 140;
          diff =
            views.questionBubble.getTransformedBounds().width - bubble.width;
          changeChildBounds(diff, "horizontal", "resizeNE");
        }
        if (scaleY !== 0) {
          scale = 0.6963145095920737;
          change = scaleY * views.questionBubble.height;
          views.questionBubble.scaleY = scale;
          diff =
            views.questionBubble.getTransformedBounds().height - bubble.height;
          bubble.startY = 448;
          changeChildBounds(diff, "vertical", "resizeSE");
        }
        changeChildBounds(0, "horizontal", "resizeNE");
        changeChildBounds(0, "vertical", "resizeSE");
        var sidebarHidden = views.barContainer.alpha;
        views.questionContainer.x = sidebarHidden === 1.0 ? 140 : 1;
        views.questionContainer.y = minimize === true ? 448 : 600;
        if (minimize === true) minimizeMouseClick();
        else maximizeMouseClick();
      }

      function mouseDownEvent(e) {
        views.gridContainer.offset = {
          x: views.gridContainer.x - e.stageX,
          y: views.gridContainer.y - e.stageY,
        };
        views.gridContainer.cubeWidth =
          drawSize * views.gridContainer.scaleY * 0.75;
        views.gridContainer.minX =
          138 -
          views.gridContainer.getTransformedBounds().width +
          views.gridContainer.cubeWidth;
        views.gridContainer.maxX = 800 - views.gridContainer.cubeWidth;
        views.gridContainer.minY =
          0 -
          views.gridContainer.getTransformedBounds().height +
          views.gridContainer.cubeWidth;
        views.gridContainer.maxY = 600 - views.gridContainer.cubeWidth;
      }

      function resizeMouseDown(e) {
        var notSet = false;
        if (!views.questionContainer.x) {
          views.questionContainer.x = 140;
          notSet = true;
        }
        if (!views.questionContainer.y) {
          views.questionContainer.y = 380;
          notSet = true;
        }
        if (!views.questionContainer.width) {
          views.questionContainer.width =
            views.questionBubble.getBounds().width;
          notSet = true;
        }
        if (!views.questionContainer.height) {
          views.questionContainer.height =
            views.questionBubble.getBounds().height;
          notSet = true;
        }
        if (notSet) {
          views.questionContainer.setBounds(
            views.questionContainer.x,
            views.questionContainer.y,
            views.questionContainer.width,
            views.questionContainer.height
          );
          self.stage.update();
        }
        if (!views.questionBubble.startWidth)
          views.questionBubble.startWidth =
            views.questionBubble.getBounds().width;
        if (!views.questionBubble.startHeight)
          views.questionBubble.startHeight =
            views.questionBubble.getBounds().height;
        views.questionContainer.startX = e.stageX;
        views.questionContainer.startY = e.stageY;
        homeBounds();
      }

      function resizePressMove(e) {
        var corner = e.currentTarget.name;
        var bubble = views.questionContainer;
        var movementX = 0;
        var movementY = 0;
        if (!isMobileDevice) {
          movementX =
            e.nativeEvent.movementX ||
            e.nativeEvent.mozMovementX ||
            e.nativeEvent.webkitMovementX ||
            0;
          movementY =
            e.nativeEvent.movementY ||
            e.nativeEvent.mozMovementY ||
            e.nativeEvent.webkitMovementY ||
            0;
        } else {
          movementX = bubble.startX - e.stageX;
          movementY = bubble.startY - e.stageY;
        }
        movementX = movementX * 2;
        movementY = movementY * 2;
        var scaleX =
          1 - bubble.width / (bubble.width + Math.abs(movementX) * 0.75);
        var scaleY =
          1 - bubble.height / (bubble.height + Math.abs(movementY) * 0.75);
        var diff;
        var scale;
        var change;
        if (e.stageX - bubble.startX != 0) {
          if (corner === "resizeNW" || corner === "resizeSW")
            scale =
              e.stageX - bubble.startX < 0
                ? views.questionBubble.scaleX + scaleX
                : views.questionBubble.scaleX - scaleX;
          else
            scale =
              e.stageX - bubble.startX < 0
                ? views.questionBubble.scaleX - scaleX
                : views.questionBubble.scaleX + scaleX;
          change = scale * views.questionBubble.width;
          if (
            change > 330 &&
            change < 798 &&
            (((corner === "resizeNE" || corner === "resizeSE") &&
              bubble.x + change < 800) ||
              ((corner === "resizeNW" || corner === "resizeSW") &&
                bubble.x + bubble.width > change))
          ) {
            views.questionBubble.scaleX = scale;
            views.menuStrip.scaleX = views.questionBubble.scaleX;
            bubble.startX = e.stageX;
            diff =
              views.questionBubble.getTransformedBounds().width - bubble.width;
            changeChildBounds(diff, "horizontal", corner);
          }
        }

        if (e.stageY - bubble.startY != 0) {
          if (corner === "resizeNE" || corner === "resizeNW")
            scale =
              e.stageY - bubble.startY < 0
                ? views.questionBubble.scaleY + scaleY
                : views.questionBubble.scaleY - scaleY;
          else
            scale =
              e.stageY - bubble.startY < 0
                ? views.questionBubble.scaleY - scaleY
                : views.questionBubble.scaleY + scaleY;
          change = scale * views.questionBubble.height;
          if (
            change > 150 &&
            change < 251 &&
            (((corner === "resizeSW" || corner === "resizeSE") &&
              bubble.y + change < 600) ||
              ((corner === "resizeNW" || corner === "resizeNE") &&
                bubble.y + bubble.height > change))
          ) {
            views.questionBubble.scaleY = scale;
            diff =
              views.questionBubble.getTransformedBounds().height -
              bubble.height;
            bubble.startY = e.stageY;
            changeChildBounds(diff, "vertical", corner);
          }
        }
      }

      function resizePressUp(e) {
        setTimeout(function () {
          changeChildBounds(0, "horizontal", e.currentTarget.name, function () {
            changeChildBounds(0, "vertical", e.currentTarget.name, function () {
              self.stage.update();
            });
          });
        }, 10);
      }

      /*****************
          Keyboard Events
         *****************/

      function keyPress() {
        tempPlayerAnswers[views.questionTextBox.question] =
          views.textBoxInput.value;
        views.textBoxTotal.text =
          views.textBoxInput.value.length +
          "/" +
          questions[views.questionTextBox.question]["Name"].length +
          " Letters Entered";

        showTextBoxTotal();
        if (
          views.textBoxInput.value.trim().length ===
          questions[views.questionTextBox.question]["Name"].length
        )
          views.markerSprites.gotoAndStop(0);
        else views.markerSprites.gotoAndStop(1);
        return;
      }

      /*****************
             Menu Items
         *****************/

      function endCurrentGame(e) {
        menuMouseLeave(e);
        if (!gameOver) {
          if (questionNumbers.length > 0 && !incompleteConfirmation) {
            incompleteConfirmation = true;
            views.messageText.text =
              "**Warning** Incomplete Puzzle **Warning**\n\nTo submit your answers, return to the game and select 'Submit Current Game Answers' again.";
            var bounds = views.messageText.getTransformedBounds();
            views.messageText.y =
              (views.messageText.parent.getTransformedBounds().height -
                bounds.height) /
              2;
            self.currentView.getChildAt(0).mouseEnabled = false;
            self.currentView.getChildAt(1).mouseEnabled = false;
            self.currentView.getChildAt(2).mouseEnabled = false;
            self.currentView.getChildAt(3).mouseEnabled = false;
            self.currentView.getChildAt(4).mouseEnabled = true;
            views.textBoxInputControl.alpha = 0.0;
            views.textBoxInput.disabled = true;
            views.displayMessage.alpha = 1.0;
          } else {
            getResults();
          }
        } else {
          self.currentView.getChildAt(0).mouseEnabled = false;
          self.currentView.getChildAt(1).mouseEnabled = false;
          self.currentView.getChildAt(2).mouseEnabled = true;
          self.currentView.getChildAt(3).mouseEnabled = true;
          self.currentView.getChildAt(4).mouseEnabled = false;
          self.currentView.getChildAt(2).alpha = 1.0;
          self.currentView.getChildAt(3).alpha = 1.0;
        }
      }

      function helpMouseClick(e) {
        menuMouseOut(e);
        self.currentView.getChildAt(0).mouseEnabled = false;
        self.currentView.getChildAt(1).mouseEnabled = true;
        self.currentView.getChildAt(2).mouseEnabled = false;
        self.currentView.getChildAt(3).mouseEnabled = false;
        self.currentView.getChildAt(4).mouseEnabled = false;
        views.textBoxInputControl.alpha = 0.0;
        views.textBoxInput.disabled = true;
        views.returnButton.alpha = 1.0;
        views.instructionView.alpha = 1.0;
      }

      function resetGrid(e) {
        var sidebarHidden = views.barContainer.alpha;
        views.gridContainer.scaleX = 1;
        views.gridContainer.scaleY = 1;
        views.gridContainer.x = sidebarHidden === 1.0 ? 476 : 400;
        views.gridContainer.y = 301;
        menuMouseLeave(e);
      }

      function resetQuestionBox(e) {
        if (!views.questionContainer.width) {
          views.questionContainer.width =
            views.questionBubble.getBounds().width;
        }
        if (!views.questionContainer.height) {
          views.questionContainer.height =
            views.questionBubble.getBounds().height;
        }
        views.questionContainer.setBounds(
          views.questionContainer.x,
          views.questionContainer.y,
          views.questionContainer.width,
          views.questionContainer.height
        );
        if (!views.questionBubble.startWidth)
          views.questionBubble.startWidth =
            views.questionBubble.getBounds().width;
        if (!views.questionBubble.startHeight)
          views.questionBubble.startHeight =
            views.questionBubble.getBounds().height;
        homeBounds();
        var bubble = views.questionContainer;
        var scaleX = 0.8566225725988693 - views.questionBubble.scaleX;
        var scaleY = 0.6963145095920737 - views.questionBubble.scaleY;
        var diff;
        var scale;
        var change;
        if (scaleX !== 0) {
          scale = 0.8566225725988693;
          change = scaleX * views.questionBubble.width;
          views.questionBubble.scaleX = scale;
          views.menuStrip.scaleX = views.questionBubble.scaleX;
          bubble.startX = 140;
          diff =
            views.questionBubble.getTransformedBounds().width - bubble.width;
          changeChildBounds(diff, "horizontal", "resizeNE");
        }
        if (scaleY !== 0) {
          scale = 0.6963145095920737;
          change = scaleY * views.questionBubble.height;
          views.questionBubble.scaleY = scale;
          diff =
            views.questionBubble.getTransformedBounds().height - bubble.height;
          bubble.startY = 448;
          changeChildBounds(diff, "vertical", "resizeSE");
        }
        changeChildBounds(0, "horizontal", "resizeNE");
        changeChildBounds(0, "vertical", "resizeSE");
        var sidebarHidden = views.barContainer.alpha;
        views.questionContainer.x = sidebarHidden === 1.0 ? 140 : 1;
        views.questionContainer.y = views.questionContainer.saveCoords.minimized
          ? 600
          : 448;
        views.questionContainer.saveCoords.x = sidebarHidden === 1.0 ? 140 : 1;
        views.questionContainer.saveCoords.y = 448;
        if (views.questionContainer.saveCoords.minimized) maximizeMouseClick();
        menuMouseLeave(e);
      }

      function restartMouseClick(e) {
        menuMouseOut(e);
        if (!gameOver) {
          views.messageText.text =
            "You must 'Submit Current Game Answers' before starting a new game.";
          var bounds = views.messageText.getTransformedBounds();
          views.messageText.y =
            (views.messageText.parent.getTransformedBounds().height -
              bounds.height) /
            2;
          self.currentView.getChildAt(0).mouseEnabled = false;
          self.currentView.getChildAt(1).mouseEnabled = false;
          self.currentView.getChildAt(2).mouseEnabled = false;
          self.currentView.getChildAt(3).mouseEnabled = false;
          self.currentView.getChildAt(4).mouseEnabled = true;
          views.textBoxInputControl.alpha = 0.0;
          views.textBoxInput.disabled = true;
          views.displayMessage.alpha = 1.0;
          return false;
        }
        self.currentView.cursor = "default";
        helpMouseClick(e);
        self.stage.removeAllChildren();
        self.stage.removeAllEventListeners();
        self.previousView = null;
        self.currentView = null;
        instructionsView = null;
        originalWidth = self.stage.canvas.width;
        originalHeight = self.stage.canvas.height;
        count = 0;
        originalOrder = [];
        update = false;
        cellCoords = [];
        clickedCellCoords = [];
        cellHilights = {};
        vData = {};
        hData = {};
        vDataTemp = {};
        hDataTemp = {};
        questions = gameData["Terms"];
        questionCount = questions.length;
        cellTextObjects = {};
        cubeSize = 0;
        drawSize = 0;
        qData = "";
        gameOver = false;
        playerAnswers = {};
        scoreSubmitted = false;
        gridMove = false;
        activeCellObject = {};
        currentCellObject = {};
        lastClicked = false;
        resizeInterval = null;
        rotateDown = true;
        gameLoaded = false;
        clearActiveSelection = false;
        menuOpen = false;
        menuItemOver = false;
        allAnswers = false;
        incompleteConfirmation = false;
        updatePaused = false;
        views = {
          questionBubble: null,
          prevArrow: null,
          nextArrow: null,
          textBoxInput: null,
          textBox: null,
          textBoxInputControl: null,
          markerSprites: null,
          deleteButton: null,
          clueTextBox: null,
          textBoxError: null,
          textBoxTotal: null,
          correctAnswerText: null,
          yourAnswerText: null,
          correctAnswerTextInput: null,
          yourAnswerTextInput: null,
          questionContainer: null,
          menuStrip: null,
          minimize: null,
          maximize: null,
          menuTitle: null,
          menuButtons: null,
          resizeNE: null,
          resizeNW: null,
          resizeSE: null,
          resizeSW: null,
          buttonContainer: null,
          miniContainer: null,
          miniTitleText: null,
          helpButton: null,
          pointsText: null,
          gameOverBox: null,
          gameView: null,
          returnButton: null,
          instructionView: null,
          puzzleContainer: null,
          gridContainer: null,
          questionTextBox: null,
          miniMenuContainer: null,
          menuContainer: null,
          displayMessage: null,
          messageText: null,
          barContainer: null,
          verticalBarBG: null,
          loadingShape: null,
          loadingContainer: null,
          loadingText: null,
          playContainer: null,
        };
        showView(createTitleView1());
      }

      function toggleSidebarClick(e) {
        var textObj = e.currentTarget.children[1];
        if (textObj.text === "Hide Vertical Sidebar") {
          textObj.text = "Show Vertical Sidebar";
          createjs.Tween.get(views.verticalBarBG)
            .to({ x: -140 }, 250)
            .to({ alpha: 0.0 }, 0);
          createjs.Tween.get(views.barContainer)
            .to({ x: -120 }, 250)
            .to({ alpha: 0.0 }, 0);
          createjs.Tween.get(views.miniContainer).to({ x: 1 }, 250);
        } else {
          textObj.text = "Hide Vertical Sidebar";
          views.verticalBarBG.alpha = 1.0;
          views.barContainer.alpha = 1.0;
          createjs.Tween.get(views.verticalBarBG).to({ x: 0 }, 250);
          createjs.Tween.get(views.barContainer).to({ x: 20 }, 250);
          createjs.Tween.get(views.miniContainer).to({ x: 140 }, 250);
        }
        menuMouseLeave(e);
      }

      /*****************
               Views
         *****************/

      function createAllQuestionsAnsweredPopup() {
        if (!allAnswers) {
          allAnswers = true;
          views.messageText.text =
            "All questions have been answered. If you are happy with your answers, you can 'Submit Current Game Answers' from the menu.";
          var bounds = views.messageText.getTransformedBounds();
          views.messageText.y =
            (views.messageText.parent.getTransformedBounds().height -
              bounds.height) /
            2;
          self.currentView.getChildAt(0).mouseEnabled = false;
          self.currentView.getChildAt(1).mouseEnabled = false;
          self.currentView.getChildAt(2).mouseEnabled = false;
          self.currentView.getChildAt(3).mouseEnabled = false;
          self.currentView.getChildAt(4).mouseEnabled = true;
          views.textBoxInputControl.alpha = 0.0;
          views.textBoxInput.disabled = true;
          views.displayMessage.alpha = 1.0;
        }
      }

      function createDisplayMessage() {
        var view = new createjs.Container();
        var returnButton = new createjs.Bitmap(
          resourceLoader.getResult("reviewBtn")
        );
        var background = new createjs.Shape();
        var messageContainer = new createjs.Container();
        var messageBackground = new createjs.Shape();
        var messageText = new createjs.Text("", "12pt Arial Black", "red");
        var returnContainer = new createjs.Container();
        var returnText = new createjs.Text(
          "Return",
          "12px Arial Black",
          "#040707"
        );
        background.graphics
          .beginFill("silver")
          .setStrokeStyle(1)
          .beginStroke("black")
          .drawRect(0, 0, 800, 600);
        background.alpha = 0.75;
        background.regX = 400;
        background.x = 400;
        background.y = 0;
        messageBackground.graphics
          .beginFill("rgba(0,0,0,0.8)")
          .setStrokeStyle(2)
          .beginStroke("white")
          .drawRoundRect(0, 0, 500, 100, 10);
        messageBackground.regX = 250;
        messageBackground.setBounds(0, 0, 500, 100);
        messageText.lineWidth = 490;
        messageText.maxWidth = 490;
        messageText.textAlign = "center";
        messageContainer.addChild(messageBackground, messageText);
        messageContainer.x = 400;
        messageContainer.y =
          300 - messageBackground.getTransformedBounds().height / 2;
        returnText.x = 3;
        returnButton.y = 18;
        returnContainer.addChild(returnText, returnButton);
        returnContainer.setTransform(760, 542.5, 0.75, 0.75);
        returnContainer.cursor = "pointer";
        returnContainer.on("click", function () {
          self.currentView.getChildAt(0).mouseEnabled = true;
          self.currentView.getChildAt(1).mouseEnabled = false;
          self.currentView.getChildAt(2).mouseEnabled = false;
          self.currentView.getChildAt(3).mouseEnabled = false;
          self.currentView.getChildAt(4).mouseEnabled = false;
          if (!gameOver) {
            views.textBoxInputControl.alpha = 1.0;
            views.textBoxInput.disabled = false;
          }
          views.displayMessage.alpha = 0.0;
        });
        view.alpha = 0.0;
        view.addChild(background, messageContainer, returnContainer);
        views.messageText = messageText;
        view.name = "displayMessage";
        background.name = "displayMessageBG";
        messageContainer.name = "displayMessageContainer";
        messageBackground.name = "displayMessageContainerBG";
        messageText.name = "displayMessageText";
        return view;
      }

      function createGameOverBox() {
        var view = new createjs.Container();
        var gameOverContainer = new createjs.Container();
        // var background = new createjs.Shape();
        var background = new createjs.Bitmap(
          resourceLoader.getResult("sceneBg3")
        );
        var gameOverBox = new createjs.Bitmap(
          resourceLoader.getResult("gameOverBox")
        );
        var reviewButton = new createjs.Bitmap(
          resourceLoader.getResult("reviewBtn")
        );
        var restartButton = new createjs.Bitmap(
          resourceLoader.getResult("restartBtn")
        );
        var gameOverHeaderText = new createjs.Text(
          "Permainan Tamat",
          "18px Arial Black",
          "white"
        );
        var gameOverText = new createjs.Text(
          "Anda dapat",
          "30px Arial Black",
          "silver"
        );
        var pointsText = new createjs.Text("", "34px Arial Black", "white");
        var restartText = new createjs.Text(
          "Mulakan\nPermainan Baru",
          "bold 14px Arial",
          "white"
        );
        var reviewText = new createjs.Text(
          "Ulasan Jawapan",
          "bold 14px Arial",
          "white"
        );
        // background.graphics.beginFill("silver").drawRect(0, 0, 800, 600);
        // background.alpha = 0.75;
        // background.regX = 400;
        // background.x = 400;
        // background.y = 0;
        reviewButton.x = 76;
        reviewButton.y = 182;
        restartButton.x = 466;
        restartButton.y = 182;
        gameOverContainer.regX = 295;
        gameOverHeaderText.textAlign = "center";
        gameOverHeaderText.lineWidth = 590;
        gameOverHeaderText.maxWidth = 590;
        gameOverHeaderText.y = 20;
        gameOverHeaderText.x = 295;
        gameOverText.textAlign = "center";
        gameOverText.x = 295;
        gameOverText.y = 60;
        pointsText.textAlign = "center";
        pointsText.x = 295;
        pointsText.y = 90;
        restartText.textAlign = "center";
        restartText.x = 490;
        restartText.y = 148;
        reviewText.textAlign = "center";
        reviewText.x = 100;
        reviewText.y = 148;
        views.pointsText = pointsText;
        gameOverContainer.addChild(
          gameOverBox,
          gameOverHeaderText,
          gameOverText,
          pointsText,
          restartButton,
          reviewButton,
          restartText,
          reviewText
        );
        gameOverContainer.x = 400;
        gameOverContainer.y = 356;
        reviewButton.on("click", reviewMouseClick);
        restartButton.on("click", restartMouseClick);
        reviewButton.cursor = "pointer";
        restartButton.cursor = "pointer";
        // if (isLmsConnected || isMobileDevice) {
        var exitButton = new createjs.Bitmap(
          resourceLoader.getResult("exitYellowBtn")
        );
        var exitText = new createjs.Text(
          "Quit Game",
          "bold 14px Arial",
          "white"
        );
        exitButton.x = 271;
        exitButton.y = 182;
        exitText.textAlign = "center";
        exitText.x = 295;
        exitText.y = 162;
        exitButton.on("click", quit);
        exitButton.cursor = "pointer";
        gameOverContainer.addChild(exitButton, exitText);
        // }
        view.addChild(background, gameOverContainer);
        return view;
      }

      function createGameOverBox1() {
        var view = new createjs.Container();
        var gameOverContainer = new createjs.Container();
        // var background = new createjs.Shape();
        var background = new createjs.Bitmap(
          resourceLoader.getResult("sceneBg4")
        );
        var gameOverBox1 = new createjs.Bitmap(
          resourceLoader.getResult("gameOverBox")
        );
        var reviewButton = new createjs.Bitmap(
          resourceLoader.getResult("reviewBtn")
        );
        var restartButton = new createjs.Bitmap(
          resourceLoader.getResult("restartBtn")
        );
        var gameOverHeaderText = new createjs.Text(
          "Permainan Tamat",
          "18px Arial Black",
          "white"
        );
        var gameOverText = new createjs.Text(
          "Anda dapat",
          "30px Arial Black",
          "silver"
        );
        var pointsText1 = new createjs.Text("", "34px Arial Black", "white");
        var restartText = new createjs.Text(
          "Mulakan\nPermainan Baru",
          "bold 14px Arial",
          "white"
        );
        var reviewText = new createjs.Text(
          "Ulasan Jawapan",
          "bold 14px Arial",
          "white"
        );
        // background.graphics.beginFill("silver").drawRect(0, 0, 800, 600);
        // background.alpha = 0.75;
        // background.regX = 400;
        // background.x = 400;
        // background.y = 0;
        reviewButton.x = 76;
        reviewButton.y = 182;
        restartButton.x = 466;
        restartButton.y = 182;
        gameOverContainer.regX = 295;
        gameOverHeaderText.textAlign = "center";
        gameOverHeaderText.lineWidth = 590;
        gameOverHeaderText.maxWidth = 590;
        gameOverHeaderText.y = 20;
        gameOverHeaderText.x = 295;
        gameOverText.textAlign = "center";
        gameOverText.x = 295;
        gameOverText.y = 60;
        pointsText1.textAlign = "center";
        pointsText1.x = 295;
        pointsText1.y = 90;
        restartText.textAlign = "center";
        restartText.x = 490;
        restartText.y = 148;
        reviewText.textAlign = "center";
        reviewText.x = 100;
        reviewText.y = 148;
        views.pointsText1 = pointsText1;
        gameOverContainer.addChild(
          gameOverBox1,
          gameOverHeaderText,
          gameOverText,
          pointsText1,
          restartButton,
          reviewButton,
          restartText,
          reviewText
        );
        gameOverContainer.x = 400;
        gameOverContainer.y = 356;
        reviewButton.on("click", reviewMouseClick);
        restartButton.on("click", restartMouseClick);
        reviewButton.cursor = "pointer";
        restartButton.cursor = "pointer";
        if (isLmsConnected || isMobileDevice) {
          var exitButton = new createjs.Bitmap(
            resourceLoader.getResult("exitYellowBtn")
          );
          var exitText = new createjs.Text(
            "Quit Game",
            "bold 14px Arial",
            "white"
          );
          exitButton.x = 271;
          exitButton.y = 182;
          exitText.textAlign = "center";
          exitText.x = 295;
          exitText.y = 162;
          exitButton.on("click", quit);
          exitButton.cursor = "pointer";
          gameOverContainer.addChild(exitButton, exitText);
        }
        view.addChild(background, gameOverContainer);
        return view;
      }

      function createGameSessionView(maxX, maxY, minX, minY, grid) {
        var view = new createjs.Container();
        var gameOverBox = createGameOverBox();
        var gameOverBox1 = createGameOverBox1();
        var messageBox = createDisplayMessage();
        self.currentView.uncache();
        views.instructionView.alpha = 0.0;
        views.gameOverBox = gameOverBox;
        gameOverBox.alpha = 0.0;
        gameOverBox.mouseEnabled = false;
        views.gameOverBox1 = gameOverBox1;
        gameOverBox1.alpha = 0.0;
        gameOverBox1.mouseEnabled = false;
        views.displayMessage = messageBox;
        messageBox.alpha = 0.0;
        messageBox.mouseEnabled = false;
        var btnSoundEffects = helpers.soundEffects();
        view.addChild(
          createGridView(maxX, maxY, minX, minY, grid),
          views.instructionView,
          gameOverBox,
          gameOverBox1,
          messageBox,
          btnSoundEffects
        );
        displayByQuestionNumber(1);
        views.questionContainer.saveCoords.minimized = false;
        views.questionContainer.saveCoords.x = 140;
        views.questionContainer.saveCoords.y = 448;
        minimizeMouseDblClick(true);
        updatePaused = true;
        showView(view);
        self.currentView.getChildAt(0).mouseEnabled = false;
        self.currentView.getChildAt(1).mouseEnabled = true;
        self.currentView.getChildAt(2).mouseEnabled = false;
        self.currentView.getChildAt(3).mouseEnabled = false;
        self.currentView.getChildAt(4).mouseEnabled = false;
        views.textBoxInputControl.alpha = 0.0;
        views.textBoxInput.disabled = true;
        views.instructionView.alpha = 1.0;
        views.playContainer.alpha = 1.0;
        updatePaused = false;
      }

      function createGridView(maxX, maxY, minX, minY, grid) {
        var gridContainer = new createjs.Container();
        var puzzleContainer = new createjs.Container();
        var gridBackground = new createjs.Bitmap(
          resourceLoader.getResult("boardBackground")
        );
        var crosswordTitle = new createjs.Bitmap(
          resourceLoader.getResult("crosswordTitle")
        );
        var crosswordIcon = new createjs.Bitmap(
          resourceLoader.getResult("crosswordIcon")
        );
        var logoContainer = new createjs.Container();
        var diffX = maxX - minX + 1;
        var diffY = maxY - minY + 1;
        cubeSize = 596 / (diffX > diffY ? diffX : diffY);
        drawSize = cubeSize - 5;
        var reg = drawSize / 2;
        var keys = Object.keys(grid);
        var cnt = keys.length - 1;
        var gridInterval;

        function createCube(cnt) {
          var key = keys[cnt];
          var cubeContainer = new createjs.Container();
          var cubeShape = new createjs.Shape();
          cubeContainer.name = key;
          cubeShape.graphics.beginFill("rgba(0,0,0,0.35)");
          cubeShape.graphics.drawRoundRect(0, 0, drawSize, drawSize, 5);
          cubeShape.name = key;
          cubeShape.regX = cubeShape.regY = reg;
          cubeShape.alpha = 1.0;
          cubeShape.shadow = new createjs.Shadow("rgba(0,0,0,1.0)", 2, 2, 2);
          cubeShape.shadow.name = key;
          key = key.split(",");
          var x = key[0];
          var y = key[1];
          var l = grid[key];
          var cubeX = x * cubeSize;
          var cubeY = y * cubeSize;
          cubeContainer.x = cubeX;
          cubeContainer.y = cubeY > 0 ? 0 - cubeY : Math.abs(cubeY);
          var letterText = new createjs.Text(
            "*",
            "Bold 12pt Arial Black",
            "black"
          );
          letterText.lineWidth = cubeSize;
          letterText.textAlign = "center";
          letterText.textBaseline = "middle";
          letterText.mouseEnabled = false;
          letterText.alpha = 0.0;
          letterText.letter = l;
          cubeContainer.letter = l;
          cubeContainer.alpha = 1.0;
          cubeContainer.hitArea = new createjs.Shape(
            new createjs.Graphics()
              .beginFill("#000")
              .drawRoundRect(
                0 - cubeSize / 2,
                0 - cubeSize / 2,
                cubeSize + 1,
                cubeSize + 1,
                5
              )
          );
          cubeContainer.hitArea.alpha = 0.01;
          cubeContainer.addChild(cubeShape, letterText);
          gridContainer.addChild(cubeContainer);
          cubeContainer.on("mouseover", cubeMouseOver);
          cubeContainer.on("mousedown", cubeMouseDown);
          cubeContainer.on("pressmove", cubePressMove);
          cubeContainer.on("pressup", cubePressUp);
          cubeContainer.on("mouseout", cubeMouseOut);
          cubeContainer.on("click", cubeMouseClick);

          cubeContainer.mouseChildren = false;
          cubeContainer.cursor = "pointer";
          cellTextObjects[cubeContainer.name] = letterText;
        }

        do createCube(cnt);
        while (cnt-- > 0);

        var verticalBar = new createjs.Shape();
        var barContainer = new createjs.Container();
        var verticalBarBackground = new createjs.Shape();
        var verticalBarHit = new createjs.Shape();
        var helpButton = new createjs.Bitmap(
          resourceLoader.getResult("helpButton")
        );
        var outerGridContainer = new createjs.Container();
        var gridMask = new createjs.Shape();
        var pan = createPanControls();
        var zoom = createZoomControls();
        var bubble = createQuestionBubbleControl();
        var menu = createMenuControls();
        var bounds = gridContainer.getBounds();
        gridContainer.regX = bounds.x + bounds.width / 2;
        gridContainer.regY = bounds.y + bounds.height / 2;
        gridContainer.x = 476;
        gridContainer.y = 301;
        verticalBarBackground.graphics
          .setStrokeStyle(1)
          .beginStroke("#040707")
          .beginFill("#000000")
          .drawRect(0, 0, 140, 600)
          .endFill()
          .endStroke();
        verticalBarHit.graphics
          .setStrokeStyle(1)
          .beginStroke("#fff")
          .beginFill("#fff")
          .drawRect(0, 0, 140, 600)
          .endFill()
          .endStroke();
        verticalBar.graphics
          .beginFill("black")
          .drawRect(0, 0, 100, 600)
          .endFill();
        verticalBar.x = 0;
        verticalBar.y = 0;
        verticalBarBackground.on("mouseover", function () {});
        helpButton.cursor = "pointer";
        barContainer.addChild(verticalBar);
        barContainer.x = 20;
        barContainer.y = 0;
        helpButton.x = 780;
        helpButton.y = 553;
        helpButton.on("click", helpMouseClick);
        helpButton.scaleX = 1.0;
        helpButton.scaleY = 1.0;
        helpButton.regX = helpButton.getBounds().width / 2;
        pan.x = -11;
        pan.y = 225;
        zoom.x = 28;
        zoom.y = 400;
        bubble.x = 140;
        bubble.y = 380;
        menu.x = 750;
        menu.y = 0;
        bounds = bubble.getBounds();
        views.questionBubble.width = bounds.width;
        views.questionBubble.height = bounds.height;
        bubble.width = bounds.width;
        bubble.height = bounds.height;
        barContainer.addChild(pan, zoom);
        outerGridContainer.addChild(gridContainer);
        outerGridContainer.x = 0;
        outerGridContainer.y = 0;
        crosswordTitle.setTransform(null, null, 0.2, 0.2);
        crosswordTitle.x = -17.5;
        crosswordTitle.y = 0;
        crosswordIcon.setTransform(null, null, 0.8, 0.8);
        crosswordIcon.x = 2.5;
        crosswordIcon.y = 40;
        logoContainer.addChild(crosswordTitle, crosswordIcon);
        logoContainer.x = 0;
        logoContainer.y = 30;
        barContainer.addChild(logoContainer);
        puzzleContainer.addChild(
          gridBackground,
          outerGridContainer,
          verticalBarBackground,
          barContainer,
          helpButton,
          bubble,
          views.miniContainer,
          menu,
          views.menuContainer
        );
        gridContainer.scaleX = 1.0;
        gridContainer.scaleY = 1.0;
        views.helpButton = helpButton;
        views.gridContainer = gridContainer;
        views.questionContainer = bubble;
        views.questionContainer.saveCoords = {
          x: 140,
          y: 380,
          minimized: false,
        };
        gridMask.graphics.beginFill("#FF0000").rect(1, 1, 798, 598);
        gridMask.cache(1, 1, 798, 598);
        outerGridContainer.mask = gridMask;
        views.barContainer = barContainer;
        views.verticalBarBG = verticalBarBackground;
        views.puzzleContainer = puzzleContainer;
        gridBackground.on("mousedown", gridMouseDown);
        gridBackground.on("pressmove", cubePressMove);
        gridBackground.on("pressup", cubePressUp);
        gridBackground.addEventListener("mouseout", function (e) {
          clearInterval(gridInterval);
        });
        gameLoaded = true;
        return puzzleContainer;
      }

      function createInstructionView() {
        var view = new createjs.Container();
        var instructionContainer = new createjs.Container();
        var overviewContainer = new createjs.Container();
        var panContainer = new createjs.Container();
        var zoomContainer = new createjs.Container();
        var resetContainer = new createjs.Container();
        var questionContainer = new createjs.Container();
        var cycleContainer = new createjs.Container();
        var checkContainer = new createjs.Container();
        var garbageContainer = new createjs.Container();
        var helpContainer = new createjs.Container();
        var panIconContainer = new createjs.Container();
        var zoomIconContainer = new createjs.Container();
        var exitContainer = new createjs.Container();
        var selectTheText = new createjs.Text(
          "Pilih butang",
          "14px Arial Black",
          "#040707"
        );
        var overviewText = new createjs.Text(
          "",
          "bold 14px Arial Black",
          "#040707"
        );
        var panText = new createjs.Text(
          "untuk menggerakkan teka silang kata",
          "14px Arial Black",
          "#040707"
        );
        var zoomText = new createjs.Text(
          "untuk zoom in atau zoom out",
          "14px Arial Black",
          "#040707"
        );
        var resetText = new createjs.Text(
          "untuk kembali ke kedudukan asal teka silang kata",
          "14px Arial Black",
          "#040707"
        );
        var questionText = new createjs.Text(
          "untuk membuka soalan teka silang kata",
          "14px Arial Black",
          "#040707"
        );
        var cycleText = new createjs.Text(
          "untuk menukar soalan",
          "14px Arial Black",
          "#040707"
        );
        var checkText = new createjs.Text(
          "untuk menghantar jawapan",
          "14px Arial Black",
          "#040707"
        );
        var garbageText = new createjs.Text(
          "untuk membersihkan jawapan daripada teka silang kata",
          "14px Arial Black",
          "#040707"
        );
        var helpText = new createjs.Text(
          "untuk menunjukkan skrin bantuan",
          "14px Arial Black",
          "#040707"
        );
        var exitText = new createjs.Text(
          "untuk menamatkan permainan",
          "14px Arial Black",
          "#040707"
        );
        var background = new createjs.Bitmap(
          resourceLoader.getResult("boardBackground")
        );
        var title = new createjs.Bitmap(
          resourceLoader.getResult("crosswordTitle")
        );
        var zoomIn = new createjs.Bitmap(resourceLoader.getResult("zoomIn"));
        var zoomOut = new createjs.Bitmap(resourceLoader.getResult("zoomOut"));
        var garbageCan = new createjs.Bitmap(
          resourceLoader.getResult("delete_button")
        );
        var arrowLeft = new createjs.Bitmap(
          resourceLoader.getResult("prevQuestion")
        );
        var arrowRight = new createjs.Bitmap(
          resourceLoader.getResult("nextQuestion")
        );
        var reset = new createjs.Bitmap(
          resourceLoader.getResult("resetButton")
        );
        var questionIcon = new createjs.Bitmap(
          resourceLoader.getResult("questionIcon")
        );
        var helpButton = new createjs.Bitmap(
          resourceLoader.getResult("helpButton")
        );
        var panUp = new createjs.Bitmap(resourceLoader.getResult("panUp"));
        var panDown = new createjs.Bitmap(resourceLoader.getResult("panDown"));
        var panLeft = new createjs.Bitmap(resourceLoader.getResult("panLeft"));
        var panRight = new createjs.Bitmap(
          resourceLoader.getResult("panRight")
        );
        var crosswordIcon = new createjs.Bitmap(
          resourceLoader.getResult("crosswordIcon")
        );
        var returnButton = new createjs.Bitmap(
          resourceLoader.getResult("reviewBtn")
        );
        var exitButton = new createjs.Bitmap(
          resourceLoader.getResult("exitYellowBtn")
        );
        var verticalBar = new createjs.Shape();
        var barContainer = new createjs.Container();
        var verticalBarBackground = new createjs.Shape();
        var selectBounds = selectTheText.getBounds();
        var squareBox = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#ffd966")
            .drawPolyStar(5, 5, 10, 3, 0)
            .endFill()
            .endStroke()
        );
        var squareBoxStroke = new createjs.Shape(
          new createjs.Graphics()
            .setStrokeStyle(1)
            .beginStroke("#040707")
            .beginFill("#ffd966")
            .drawPolyStar(5, 5, 10, 3, 0)
            .endFill()
            .endStroke()
        );
        var squareContainer = new createjs.Container();
        var squareHeaderBox = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#ffd966")
            .drawPolyStar(7.5, 7.5, 15, 3, 0)
            .endFill()
            .endStroke()
        );
        var squareHeaderBoxStroke = new createjs.Shape(
          new createjs.Graphics()
            .setStrokeStyle(1)
            .beginStroke("#040707")
            .beginFill("#ffd966")
            .drawPolyStar(7.5, 7.5, 15, 3, 0)
            .endFill()
            .endStroke()
        );
        var squareHeaderContainer = new createjs.Container();
        var arrowContainer = new createjs.Container();
        var arrowShape = new createjs.Shape();
        var returnContainer = new createjs.Container();
        var returnText = new createjs.Text(
          "Main!",
          "14px Arial Black",
          "#040707"
        );
        var overviewTextContainer = new createjs.Container();
        var overviewHeaderText = new createjs.Text(
          "Rumusan",
          "bold 24px Arial Black",
          "#040707"
        );
        var overviewFooterText = new createjs.Text(
          "Arahan",
          "bold 24px Arial Black",
          "#040707"
        );
        var overviewSeparatorHeader = new createjs.Shape();
        var spriteData = {
          images: [resourceLoader.getResult("checkMarkSprite")],
          frames: [
            [2, 0, 28, 32],
            [32, 0, 28, 32],
          ],
        };
        var spriteSheet = new createjs.SpriteSheet(spriteData);
        var checkMark = new createjs.Sprite(spriteSheet);
        selectTheText.x = 35;
        squareContainer.addChild(squareBoxStroke, squareBox);
        squareBoxStroke.x = 1;
        squareHeaderContainer.addChild(squareHeaderBoxStroke, squareHeaderBox);
        squareHeaderBoxStroke.x = 1;
        verticalBarBackground.graphics
          .setStrokeStyle(1)
          .beginStroke("#040707")
          .beginFill("#000000")
          .drawRect(0, 0, 140, 600)
          .endFill()
          .endStroke();
        verticalBar.graphics
          .beginFill("black")
          .drawRect(0, 0, 100, 600)
          .endFill();
        verticalBar.x = 0;
        verticalBar.y = 0;
        barContainer.addChild(verticalBar);
        barContainer.x = 20;
        barContainer.y = 0;
        title.setTransform(null, null, 0.2, 0.2);
        title.y = 30;
        title.x = 2.5;
        crosswordIcon.setTransform(null, null, 0.8, 0.8);
        crosswordIcon.x = 22.5;
        crosswordIcon.y = 70;
        var panStartText = selectTheText.clone(true);
        panUp.x = 32;
        panUp.y = 0;
        panRight.x = 64;
        panRight.y = 34;
        panDown.x = 32;
        panDown.y = 68;
        panLeft.x = 0;
        panLeft.y = 34;
        panIconContainer.addChild(panLeft, panRight, panUp, panDown);
        panIconContainer.setTransform(null, null, 0.3, 0.3);
        panIconContainer.x = selectBounds.width + 45;
        var bounds = panIconContainer.getBounds();
        panText.x = panIconContainer.x + bounds.width * 0.3 + 10;
        panText.y = (bounds.height * 0.3) / 2 - panText.getBounds().height / 2;
        panStartText.y = (bounds.height * 0.3) / 2 - selectBounds.height / 2;
        panContainer.y = 165;
        bounds = panContainer.getBounds();
        panIconContainer.y = 3;
        var zoomStartText = selectTheText.clone(true);
        zoomIconContainer.addChild(zoomIn, zoomOut);
        zoomIn.x = 0;
        zoomIn.y = 0;
        zoomOut.x = 0;
        zoomOut.y = 60;
        zoomIconContainer.setTransform(null, null, 0.5, 0.5);
        zoomIconContainer.x = selectBounds.width + 45;
        bounds = zoomIconContainer.getBounds();
        zoomText.x = zoomIconContainer.x + bounds.width * 0.5 + 10;
        zoomText.y =
          (bounds.height * 0.5) / 2 - zoomText.getBounds().height / 2;
        zoomStartText.y = (bounds.height * 0.5) / 2 - selectBounds.height / 2;
        zoomContainer.y = 215;
        zoomIconContainer.y = 3;
        var resetStartText = selectTheText.clone(true);
        reset.setTransform(null, null, 0.75, 0.75);
        reset.x = selectBounds.width + 45;
        bounds = reset.getBounds();
        resetText.x = reset.x + bounds.width * 0.75 + 10;
        resetText.y = (bounds.height * 0.75) / 2 - selectBounds.height / 2;
        resetStartText.y = (bounds.height * 0.75) / 2 - selectBounds.height / 2;
        resetContainer.y = 275;
        reset.y = 3;
        var cycleStartText = selectTheText.clone(true);
        arrowContainer.addChild(arrowShape, arrowLeft, arrowRight);
        bounds = arrowLeft.getBounds();
        arrowRight.x = bounds.width + 10;
        bounds = arrowContainer.getBounds();
        arrowShape.graphics
          .beginFill("black")
          .drawRect(0, 0, bounds.width, bounds.height)
          .endFill();
        arrowShape.alpha = 0.75;
        arrowContainer.x = selectBounds.width + 45;
        bounds = arrowContainer.getBounds();
        cycleText.x = arrowContainer.x + bounds.width + 10;
        cycleText.y = bounds.height / 2 - cycleText.getBounds().height / 2;
        cycleStartText.y = bounds.height / 2 - selectBounds.height / 2;
        cycleContainer.y = 275;
        arrowContainer.y = 3;
        var questionStartText = selectTheText.clone(true);
        questionIcon.setTransform(null, null, 0.75, 0.75);
        questionIcon.x = selectBounds.width + 45;
        bounds = questionIcon.getBounds();
        questionText.x = questionIcon.x + bounds.width * 0.75 + 10;
        questionText.y =
          (bounds.height * 0.75) / 2 - questionText.getBounds().height / 2;
        questionStartText.y =
          (bounds.height * 0.75) / 2 - selectBounds.height / 2;
        questionContainer.y = 360;
        questionIcon.y = 3;
        var checkStartText = selectTheText.clone(true);
        checkMark.gotoAndStop(0);
        checkMark.x = selectBounds.width + 45;
        bounds = checkMark.getBounds();
        checkText.x = checkMark.x + bounds.width + 10;
        checkText.y = bounds.height / 2 - checkText.getBounds().height / 2;
        checkStartText.y = bounds.height / 2 - selectBounds.height / 2;
        checkContainer.y = 405;
        checkMark.y = 3;
        var garbageStartText = selectTheText.clone(true);
        garbageCan.x = selectBounds.width + 45;
        bounds = garbageCan.getBounds();
        garbageText.x = garbageCan.x + bounds.width + 10;
        garbageText.y = bounds.height / 2 - garbageText.getBounds().height / 2;
        garbageStartText.y = bounds.height / 2 - selectBounds.height / 2;
        garbageContainer.y = 320;
        garbageCan.y = 3;
        var helpStartText = selectTheText.clone(true);
        helpButton.setTransform(null, null, 0.75, 0.75);
        helpButton.x = selectBounds.width + 45;
        bounds = helpButton.getBounds();
        helpText.x = helpButton.x + bounds.width * 0.75 + 10;
        helpText.y =
          (bounds.height * 0.75) / 2 - helpText.getBounds().height / 2;
        helpStartText.y = (bounds.height * 0.75) / 2 - selectBounds.height / 2;
        helpContainer.y = 365;
        helpButton.y = 3;
        var exitStartText = selectTheText.clone(true);
        exitButton.setTransform(null, null, 0.75, 0.75);
        exitButton.x = selectBounds.width + 45;
        bounds = exitButton.getBounds();
        exitText.x = exitButton.x + bounds.width * 0.75 + 10;
        exitText.y =
          (bounds.height * 0.75) / 2 - exitText.getBounds().height / 2;
        exitStartText.y = (bounds.height * 0.75) / 2 - selectBounds.height / 2;
        exitContainer.y = 535;
        exitButton.y = 3;
        returnText.x = 5;
        returnButton.y = 18;
        returnContainer.addChild(returnText, returnButton);
        returnContainer.setTransform(740, 515, 1.0, 1.0);
        returnContainer.cursor = "pointer";
        returnContainer.on("click", returnMouseClick);
        returnContainer.alpha = 0.0;
        views.returnButton = returnContainer;
        overviewText.text =
          "Sebuah teka silang kata yang terdiri daripada grid segi empat dan ruang kosong di mana perkataan disusun secara menegak dan melintang ditulis mengikut petunjuk. Semua jawapan berkaitan dengan subjek Reka Cipta tingkatan 4.";
        overviewSeparatorHeader.graphics
          .setStrokeStyle(5)
          .beginStroke("#040707")
          .moveTo(0, 0)
          .lineTo(575, 0)
          .closePath()
          .endStroke();
        var overviewSeparatorFooter = overviewSeparatorHeader.clone(false);
        bounds = overviewHeaderText.getBounds();
        overviewSeparatorHeader.y = bounds.y + bounds.height + 3;
        overviewText.y = overviewSeparatorHeader.y + 7;
        bounds = overviewText.getTransformedBounds();
        overviewFooterText.y = bounds.y + bounds.height + 75;
        bounds = overviewFooterText.getTransformedBounds();
        overviewSeparatorFooter.y = bounds.y + bounds.height + 3;
        overviewText.maxWidth = 550;
        overviewText.lineWidth = 550;
        overviewTextContainer.addChild(
          overviewHeaderText,
          overviewSeparatorHeader,
          overviewText,
          overviewFooterText,
          overviewSeparatorFooter
        );
        overviewTextContainer.x = 35;
        var overviewSquare = squareHeaderContainer.clone(true);
        overviewSquare.y = 62.5;
        var panSquare = squareContainer.clone(true);
        panSquare.y = panStartText.y + 2;
        var zoomSquare = squareContainer.clone(true);
        zoomSquare.y = zoomStartText.y + 2;
        var resetSquare = squareContainer.clone(true);
        resetSquare.y = resetStartText.y + 2;
        var questionSquare = squareContainer.clone(true);
        questionSquare.y = questionStartText.y + 2;
        var cycleSquare = squareContainer.clone(true);
        cycleSquare.y = cycleStartText.y + 2;
        var garbageSquare = squareContainer.clone(true);
        garbageSquare.y = garbageStartText.y + 2;
        var helpSquare = squareContainer.clone(true);
        helpSquare.y = helpStartText.y + 2;
        var checkSquare = squareContainer.clone(true);
        checkSquare.y = checkStartText.y + 2;
        var exitSquare = squareContainer.clone(true);
        exitSquare.y = exitStartText.y + 2;
        instructionContainer.x = 139;
        instructionContainer.y = 0;
        overviewContainer.addChild(overviewSquare, overviewTextContainer);
        panContainer.addChild(
          panSquare,
          panStartText,
          panIconContainer,
          panText
        );
        zoomContainer.addChild(
          zoomSquare,
          zoomStartText,
          zoomIconContainer,
          zoomText
        );
        resetContainer.addChild(resetSquare, resetStartText, reset, resetText);
        questionContainer.addChild(
          questionSquare,
          questionStartText,
          questionIcon,
          questionText
        );
        cycleContainer.addChild(
          cycleSquare,
          cycleStartText,
          arrowContainer,
          cycleText
        );
        checkContainer.addChild(
          checkSquare,
          checkStartText,
          checkMark,
          checkText
        );
        garbageContainer.addChild(
          garbageSquare,
          garbageStartText,
          garbageCan,
          garbageText
        );
        helpContainer.addChild(helpSquare, helpStartText, helpButton, helpText);
        exitContainer.addChild(exitSquare, exitStartText, exitButton, exitText);
        instructionContainer.addChild(
          overviewContainer,
          panContainer,
          zoomContainer,
          cycleContainer,
          garbageContainer,
          helpContainer
        );
        view.addChild(
          background,
          verticalBarBackground,
          barContainer,
          title,
          crosswordIcon,
          instructionContainer,
          returnContainer
        );
        views.instructionView = view;
        return view;
      }

      function createMenuControls() {
        var miniContainer = new createjs.Container();
        var miniTitleText = new createjs.Text("Menu", "12pt Arial", "white");
        var miniMenuStripBackground = new createjs.Shape();
        miniContainer.name = "miniMenu";
        miniTitleText.name = "miniMenu";
        miniMenuStripBackground.name = "miniMenu";
        miniMenuStripBackground.graphics
          .beginFill("#040707")
          .drawRoundRectComplex(0, 0, 50, 20, 0, 0, 0, 5);
        miniContainer.cursor = "pointer";
        miniTitleText.textAlign = "center";
        miniTitleText.lineWidth = 45;
        miniTitleText.maxWidth = 45;
        miniTitleText.x = 25;
        miniTitleText.y = 1;
        miniContainer.addChild(miniMenuStripBackground, miniTitleText);
        miniMenuStripBackground.alpha = 0.8;
        if (!isMobileDevice) miniContainer.on("mouseover", menuMouseOver);
        else miniContainer.on("click", menuMouseOver);
        var menuWidth = 200;
        var menuHeight = isLmsConnected || isMobileDevice ? 176 : 154;
        var menuItemColor = "rgba(100,246,255,1.0)";
        var menuContainer = new createjs.Container();
        var menuBackground = new createjs.Shape();
        var menuBGContainer = new createjs.Container();
        menuContainer.name = "miniMenu";
        menuBackground.name = "miniMenu";
        menuBackground.graphics
          .beginFill("#040707")
          .drawRoundRectComplex(0, 0, menuWidth, menuHeight, 0, 0, 0, 5);
        menuBackground.alpha = 0.7;
        menuContainer.alpha = 0.0;
        menuContainer.x = 800 - menuWidth;
        menuContainer.y = 0;
        var menuHeader = new createjs.Shape();
        menuHeader.name = "miniMenu";
        menuHeader.graphics
          .beginFill("#040707")
          .setStrokeStyle(1)
          .beginStroke("white")
          .drawRect(0, 0, menuWidth, 20);
        var menuTitleText = new createjs.Text("Menu", "12pt Arial", "white");
        menuTitleText.name = "miniMenu";
        menuTitleText.textAlign = "center";
        menuTitleText.lineWidth = menuWidth;
        menuTitleText.maxWidth = menuWidth;
        menuTitleText.x = menuWidth / 2;
        menuTitleText.y = 1;
        menuBackground.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRoundRectComplex(0, 0, menuWidth, menuHeight, 0, 0, 0, 5)
        );
        menuBackground.hitArea.alpha = 0.01;
        menuBackground.hitArea.name = "miniMenu";
        menuBGContainer.name = "miniMenu";
        if (!isMobileDevice) menuBackground.on("mouseout", menuMouseOut);
        else {
          menuHeader.cursor = "pointer";
          menuHeader.on("click", menuMouseOut);
        }
        menuBGContainer.addChild(menuBackground, menuHeader, menuTitleText);
        var menuItemAContainer = new createjs.Container();
        var menuItemAShape = new createjs.Shape();
        menuItemAContainer.name = "miniMenu";
        menuItemAShape.name = "miniMenu";
        menuItemAShape.graphics
          .beginFill("rgba(255,255,255,0.01)")
          .drawRect(0, 0, menuWidth, 20);
        var menuItemA = new createjs.Text(
          "Reset Puzzle Grid Defaults",
          "10pt Arial",
          menuItemColor
        );
        menuItemA.name = "miniMenu";
        menuItemA.textAlign = "left";
        menuItemA.lineWidth = menuWidth - 5;
        menuItemA.maxWidth = menuWidth - 5;
        menuItemA.x = 5;
        menuItemA.y = 2;
        menuItemAContainer.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRect(0, 0, menuWidth, 20)
        );
        menuItemAContainer.addChild(menuItemAShape, menuItemA);
        menuItemAContainer.x = 0;
        menuItemAContainer.y = 22;
        menuItemAContainer.cursor = "pointer";
        menuItemAContainer.on("click", resetGrid);
        if (!isMobileDevice) {
          menuItemAContainer.on("mouseout", menuMouseOut);
          menuItemAContainer.on("mouseover", menuItemMouseOver);
        }
        var menuItemBContainer = new createjs.Container();
        var menuItemBShape = new createjs.Shape();
        menuItemBContainer.name = "miniMenu";
        menuItemBShape.name = "miniMenu";
        menuItemBShape.graphics
          .beginFill("rgba(255,255,255,0.01)")
          .drawRect(0, 0, menuWidth, 20);
        var menuItemB = new createjs.Text(
          "Reset Question Box Defaults",
          "10pt Arial",
          menuItemColor
        );
        menuItemB.name = "miniMenu";
        menuItemB.textAlign = "left";
        menuItemB.lineWidth = menuWidth - 5;
        menuItemB.maxWidth = menuWidth - 5;
        menuItemB.x = 5;
        menuItemB.y = 2;
        menuItemBContainer.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRect(0, 0, menuWidth, 20)
        );
        menuItemBContainer.addChild(menuItemBShape, menuItemB);
        menuItemBContainer.x = 0;
        menuItemBContainer.y = 44;
        menuItemBContainer.cursor = "pointer";
        menuItemBContainer.on("click", resetQuestionBox);
        if (!isMobileDevice) {
          menuItemBContainer.on("mouseout", menuMouseOut);
          menuItemBContainer.on("mouseover", menuItemMouseOver);
        }
        var menuItemCContainer = new createjs.Container();
        var menuItemCShape = new createjs.Shape();
        menuItemCContainer.name = "miniMenu";
        menuItemCShape.name = "miniMenu";
        menuItemCShape.graphics
          .beginFill("rgba(255,255,255,0.01)")
          .drawRect(0, 0, menuWidth, 20);
        var menuItemC = new createjs.Text(
          "Submit Current Game Answers",
          "10pt Arial",
          menuItemColor
        );
        menuItemC.name = "miniMenu";
        menuItemC.textAlign = "left";
        menuItemC.lineWidth = menuWidth - 5;
        menuItemC.maxWidth = menuWidth - 5;
        menuItemC.x = 5;
        menuItemC.y = 2;
        menuItemCContainer.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRect(0, 0, menuWidth, 20)
        );
        menuItemCContainer.addChild(menuItemCShape, menuItemC);
        menuItemCContainer.x = 0;
        menuItemCContainer.y = 66;
        menuItemCContainer.cursor = "pointer";
        menuItemCContainer.on("click", endCurrentGame);
        if (!isMobileDevice) {
          menuItemCContainer.on("mouseout", menuMouseOut);
          menuItemCContainer.on("mouseover", menuItemMouseOver);
        }
        var menuItemDContainer = new createjs.Container();
        var menuItemDShape = new createjs.Shape();
        menuItemDContainer.name = "miniMenu";
        menuItemDShape.name = "miniMenu";
        menuItemDShape.graphics
          .beginFill("rgba(255,255,255,0.01)")
          .drawRect(0, 0, menuWidth, 20);
        var menuItemD = new createjs.Text(
          "Start New Game",
          "10pt Arial",
          menuItemColor
        );
        menuItemD.name = "miniMenu";
        menuItemD.textAlign = "left";
        menuItemD.lineWidth = menuWidth - 5;
        menuItemD.maxWidth = menuWidth - 5;
        menuItemD.x = 5;
        menuItemD.y = 2;
        menuItemDContainer.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRect(0, 0, menuWidth, 20)
        );
        menuItemDContainer.addChild(menuItemDShape, menuItemD);
        menuItemDContainer.x = 0;
        menuItemDContainer.y = 88;
        menuItemDContainer.cursor = "pointer";
        menuItemDContainer.on("click", restartMouseClick);
        if (!isMobileDevice) {
          menuItemDContainer.on("mouseout", menuMouseOut);
          menuItemDContainer.on("mouseover", menuItemMouseOver);
        }
        var menuItemEContainer = new createjs.Container();
        var menuItemEShape = new createjs.Shape();
        menuItemEContainer.name = "miniMenu";
        menuItemEShape.name = "miniMenu";
        menuItemEShape.graphics
          .beginFill("rgba(255,255,255,0.01)")
          .drawRect(0, 0, menuWidth, 20);
        var menuItemE = new createjs.Text(
          "Show Help",
          "10pt Arial",
          menuItemColor
        );
        menuItemE.name = "miniMenu";
        menuItemE.textAlign = "left";
        menuItemE.lineWidth = menuWidth - 5;
        menuItemE.maxWidth = menuWidth - 5;
        menuItemE.x = 5;
        menuItemE.y = 2;
        menuItemEContainer.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRect(0, 0, menuWidth, 20)
        );
        menuItemEContainer.addChild(menuItemEShape, menuItemE);
        menuItemEContainer.x = 0;
        menuItemEContainer.y = 132;
        menuItemEContainer.cursor = "pointer";
        menuItemEContainer.on("click", helpMouseClick);
        if (!isMobileDevice) {
          menuItemEContainer.on("mouseout", menuMouseOut);
          menuItemEContainer.on("mouseover", menuItemMouseOver);
        }
        var menuItemFContainer = new createjs.Container();
        var menuItemFShape = new createjs.Shape();
        menuItemFContainer.name = "miniMenu";
        menuItemFShape.name = "miniMenu";
        menuItemFShape.graphics
          .beginFill("rgba(255,255,255,0.01)")
          .drawRect(0, 0, menuWidth, 20);
        var menuItemF = new createjs.Text(
          "Hide Vertical Sidebar",
          "10pt Arial",
          menuItemColor
        );
        menuItemF.name = "miniMenu";
        menuItemF.textAlign = "left";
        menuItemF.lineWidth = menuWidth - 5;
        menuItemF.maxWidth = menuWidth - 5;
        menuItemF.x = 5;
        menuItemF.y = 2;
        menuItemFContainer.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRect(0, 0, menuWidth, 20)
        );
        menuItemFContainer.addChild(menuItemFShape, menuItemF);
        menuItemFContainer.x = 0;
        menuItemFContainer.y = 110;
        menuItemFContainer.cursor = "pointer";
        menuItemFContainer.on("click", toggleSidebarClick);
        if (!isMobileDevice) {
          menuItemFContainer.on("mouseout", menuMouseOut);
          menuItemFContainer.on("mouseover", menuItemMouseOver);
        }
        var menuItemExitContainer = new createjs.Container();
        var menuItemExitShape = new createjs.Shape();
        menuItemExitContainer.name = "miniMenu";
        menuItemExitShape.name = "miniMenu";
        menuItemExitShape.graphics
          .beginFill("rgba(255,255,255,0.01)")
          .drawRect(0, 0, menuWidth, 20);
        var menuItemExit = new createjs.Text(
          "Quit Game",
          "10pt Arial",
          menuItemColor
        );
        menuItemExit.name = "miniMenu";
        menuItemExit.textAlign = "left";
        menuItemExit.lineWidth = menuWidth - 5;
        menuItemExit.maxWidth = menuWidth - 5;
        menuItemExit.x = 5;
        menuItemExit.y = 2;
        menuItemExitContainer.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRect(0, 0, menuWidth, 20)
        );
        menuItemExitContainer.addChild(menuItemExitShape, menuItemExit);
        menuItemExitContainer.x = 0;
        menuItemExitContainer.y = 154;
        menuItemExitContainer.cursor = "pointer";
        menuItemExitContainer.on("click", quit);
        if (!isMobileDevice) {
          menuItemExitContainer.on("mouseout", menuMouseOut);
          menuItemExitContainer.on("mouseover", menuItemMouseOver);
        }
        menuContainer.addChild(
          menuBGContainer,
          menuItemAContainer,
          menuItemBContainer,
          menuItemCContainer,
          menuItemDContainer,
          menuItemEContainer,
          menuItemFContainer
        );
        if (isLmsConnected || isMobileDevice)
          menuContainer.addChild(menuItemExitContainer);
        views.miniMenuContainer = miniContainer;
        views.menuContainer = menuContainer;
        return miniContainer;
      }

      function createPanControls() {
        var panContainer = new createjs.Container();
        var panLeft = new createjs.Bitmap(resourceLoader.getResult("panLeft"));
        var panRight = new createjs.Bitmap(
          resourceLoader.getResult("panRight")
        );
        var panUp = new createjs.Bitmap(resourceLoader.getResult("panUp"));
        var panDown = new createjs.Bitmap(resourceLoader.getResult("panDown"));
        panUp.x = 32;
        panUp.y = 0;
        panRight.x = 64;
        panRight.y = 34;
        panDown.x = 32;
        panDown.y = 68;
        panLeft.x = 0;
        panLeft.y = 34;
        panUp.cursor = "pointer";
        panDown.cursor = "pointer";
        panLeft.cursor = "pointer";
        panRight.cursor = "pointer";
        var panInterval;
        panUp.addEventListener("mousedown", function (e) {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          update = true;
          var cubeHeight = drawSize * views.gridContainer.scaleX * 0.8;
          var max =
            0 - views.gridContainer.getTransformedBounds().height + cubeHeight;
          panInterval = setInterval(function () {
            if (views.gridContainer.getTransformedBounds().y > max) {
              views.gridContainer.y -= 1;
            }
          }, 5);
        });
        panUp.addEventListener("pressup", function (e) {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          update = true;
          clearInterval(panInterval);
        });
        panUp.addEventListener("mouseout", function (e) {
          update = true;
          clearInterval(panInterval);
        });
        panDown.addEventListener("mousedown", function (e) {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          var cubeHeight = drawSize * views.gridContainer.scaleX * 0.75;
          var y = 600 - cubeHeight;
          update = true;
          panInterval = setInterval(function () {
            if (views.gridContainer.getTransformedBounds().y < y) {
              views.gridContainer.y += 1;
            }
          }, 5);
        });
        panDown.addEventListener("pressup", function (e) {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          update = true;
          clearInterval(panInterval);
        });
        panDown.addEventListener("mouseout", function (e) {
          update = true;
          clearInterval(panInterval);
        });
        panLeft.addEventListener("mousedown", function (e) {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          var cubeWidth = drawSize * views.gridContainer.scaleY * 0.75;
          var max =
            138 - views.gridContainer.getTransformedBounds().width + cubeWidth;
          update = true;
          panInterval = setInterval(function () {
            if (views.gridContainer.getTransformedBounds().x > max) {
              views.gridContainer.x -= 1;
            }
          }, 5);
        });
        panLeft.addEventListener("pressup", function (e) {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          update = true;
          clearInterval(panInterval);
        });
        panLeft.addEventListener("mouseout", function (e) {
          update = true;
          clearInterval(panInterval);
        });
        panRight.addEventListener("mousedown", function (e) {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          var cubeWidth = drawSize * views.gridContainer.scaleY * 0.75;
          var max = 800 - cubeWidth;
          update = true;
          panInterval = setInterval(function (e) {
            if (views.gridContainer.getTransformedBounds().x < max) {
              views.gridContainer.x += 1;
            }
          }, 5);
        });
        panRight.addEventListener("pressup", function (e) {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          update = true;
          clearInterval(panInterval);
        });
        panRight.addEventListener("mouseout", function (e) {
          update = true;
          clearInterval(panInterval);
        });
        panContainer.addChild(panLeft, panRight, panUp, panDown);
        return panContainer;
      }

      function createQuestionBubbleControl() {
        var questionBubbleContainer = new createjs.Container();
        var questionBubble = new createjs.Shape();
        questionBubble.graphics
          .beginFill("black")
          .drawRoundRect(0, 0, 386, 218, 5);
        questionBubble.alpha = 0.9;
        questionBubble.setBounds(0, 0, 386, 218);
        var prevQuestion = new createjs.Bitmap(
          resourceLoader.getResult("prevQuestion")
        );
        var nextQuestion = new createjs.Bitmap(
          resourceLoader.getResult("nextQuestion")
        );
        var deleteButton = new createjs.Bitmap(
          resourceLoader.getResult("delete_button")
        );
        var spriteData = {
          images: [resourceLoader.getResult("checkMarkSprite")],
          frames: [
            [2, 0, 28, 32],
            [32, 0, 28, 32],
          ],
        };
        var spriteSheet = new createjs.SpriteSheet(spriteData);
        var markerSprites = new createjs.Sprite(spriteSheet);
        views.markerSprites = markerSprites;
        var bounds = questionBubble.getBounds();
        questionBubble.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRoundRect(0, 0, bounds.width, bounds.height, 5)
        );
        questionBubble.hitArea.alpha = 0.01;
        questionBubble.cursor = "move";
        questionBubble.x = 0;
        questionBubble.y = 0;
        var menuStripContainer = new createjs.Container();
        var menuStripBackground = new createjs.Shape();
        menuStripBackground.graphics
          .beginFill("#040707")
          .setStrokeStyle(1)
          .beginStroke("white")
          .drawRoundRectComplex(0, 0, 386, 25, 5, 5, 0, 0);
        menuStripContainer.addChild(menuStripBackground);
        menuStripContainer.x = 0;
        menuStripContainer.y = 0;
        var minimizeContainer = new createjs.Container();
        var minimizeShape = new createjs.Shape();
        minimizeShape.graphics
          .beginFill("#6B2E96")
          .setStrokeStyle(1)
          .beginStroke("white")
          .drawRect(0, 0, 15, 15);
        minimizeShape.graphics.beginFill("white").drawRect(3, 9, 9, 2);
        minimizeContainer.addChild(minimizeShape);
        minimizeContainer.x = 0;
        minimizeContainer.y = 5;
        var maximizeContainer = new createjs.Container();
        var maximizeShape = new createjs.Shape();
        maximizeShape.graphics
          .beginFill("#6B2E96")
          .setStrokeStyle(1)
          .beginStroke("white")
          .drawRect(0, 0, 15, 15);
        maximizeShape.graphics
          .beginFill("#6B2E96")
          .setStrokeStyle(1)
          .beginStroke("white")
          .drawRect(6, 3, 6, 6);
        maximizeShape.graphics
          .beginFill("#6B2E96")
          .setStrokeStyle(1)
          .beginStroke("white")
          .drawRect(3, 6, 6, 6);
        maximizeContainer.addChild(maximizeShape);
        maximizeContainer.x = 18;
        maximizeContainer.y = 5;
        var menuTitleContainer = new createjs.Container();
        var menuButtonContainer = new createjs.Container();
        menuButtonContainer.addChild(minimizeContainer, maximizeContainer);
        menuButtonContainer.x = bounds.width - 51;
        menuButtonContainer.y = 0;
        var resizeShape = new createjs.Shape();
        resizeShape.graphics
          .setStrokeStyle(1)
          .beginStroke("white")
          .moveTo(5, 5)
          .lineTo(5, 9)
          .moveTo(5, 5)
          .lineTo(9, 5)
          .moveTo(8, 8)
          .lineTo(8, 13)
          .moveTo(8, 8)
          .lineTo(13, 8);
        var resizeContainerNW = new createjs.Container();
        resizeContainerNW.addChild(resizeShape.clone(true));
        resizeContainerNW.x = 0;
        resizeContainerNW.y = 0;
        var resizeContainerNE = new createjs.Container();
        resizeContainerNE.addChild(resizeShape.clone(true));
        resizeContainerNE.rotation = 90;
        resizeContainerNE.x = bounds.width;
        resizeContainerNE.y = 0;
        var resizeContainerSE = new createjs.Container();
        resizeContainerSE.addChild(resizeShape.clone(true));
        resizeContainerSE.rotation = 180;
        resizeContainerSE.x = bounds.width;
        resizeContainerSE.y = bounds.height;
        var resizeContainerSW = new createjs.Container();
        resizeContainerSW.addChild(resizeShape.clone(true));
        resizeContainerSW.rotation = 270;
        resizeContainerSW.x = 0;
        resizeContainerSW.y = bounds.height;
        menuStripContainer.addChild(
          resizeContainerNW,
          resizeContainerNE,
          resizeContainerSE,
          resizeContainerSW
        );
        resizeContainerNE.cursor = "nesw-resize";
        resizeContainerSW.cursor = "nesw-resize";
        resizeContainerNW.cursor = "nwse-resize";
        resizeContainerSE.cursor = "nwse-resize";
        resizeContainerNE.hitArea = new createjs.Shape(
          new createjs.Graphics().beginFill("#000").drawRect(0, 0, 15, 15)
        );
        resizeContainerNW.hitArea = new createjs.Shape(
          new createjs.Graphics().beginFill("#000").drawRect(0, 0, 15, 15)
        );
        resizeContainerSE.hitArea = new createjs.Shape(
          new createjs.Graphics().beginFill("#000").drawRect(0, 0, 15, 15)
        );
        resizeContainerSW.hitArea = new createjs.Shape(
          new createjs.Graphics().beginFill("#000").drawRect(0, 0, 15, 15)
        );
        resizeContainerNE.hitArea.alpha = 0.01;
        resizeContainerNW.hitArea.alpha = 0.01;
        resizeContainerSE.hitArea.alpha = 0.01;
        resizeContainerSW.hitArea.alpha = 0.01;
        resizeContainerNE.on("mousedown", resizeMouseDown);
        resizeContainerNE.on("pressmove", resizePressMove);
        resizeContainerNE.on("pressup", resizePressUp);
        resizeContainerNW.on("mousedown", resizeMouseDown);
        resizeContainerNW.on("pressmove", resizePressMove);
        resizeContainerNW.on("pressup", resizePressUp);
        resizeContainerSE.on("mousedown", resizeMouseDown);
        resizeContainerSE.on("pressmove", resizePressMove);
        resizeContainerSE.on("pressup", resizePressUp);
        resizeContainerSW.on("mousedown", resizeMouseDown);
        resizeContainerSW.on("pressmove", resizePressMove);
        resizeContainerSW.on("pressup", resizePressUp);
        prevQuestion.x = 0;
        prevQuestion.y = 5;
        nextQuestion.x = 190;
        nextQuestion.y = 5;
        prevQuestion.on("click", displayPreviousQuestion);
        nextQuestion.on("click", displayNextQuestion);
        prevQuestion.scaleX = 0.5;
        prevQuestion.scaleY = 0.5;
        nextQuestion.scaleX = 0.5;
        nextQuestion.scaleY = 0.5;
        var questionBounds = prevQuestion.getBounds();
        prevQuestion.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRect(0, 0, questionBounds.width, questionBounds.height)
            .endFill()
        );
        nextQuestion.hitArea = new createjs.Shape(
          new createjs.Graphics()
            .beginFill("#000")
            .drawRect(0, 0, questionBounds.width, questionBounds.height)
            .endFill()
        );
        prevQuestion.hitArea.alpha = 0.01;
        nextQuestion.hitArea.alpha = 0.01;
        prevQuestion.cursor = "pointer";
        nextQuestion.cursor = "pointer";
        var textBox = new createjs.Text("", "12pt Arial", "white");
        textBox.x = 15;
        textBox.y = 25;
        textBox.lineWidth = bounds.width - 30;
        textBox.maxWidth = textBox.lineWidth;
        textBox.question = 0;
        views.questionTextBox = textBox;
        var textBoxInput = document.createElement("input");
        textBoxInput.id = "textBoxInput";
        textBoxInput.type = "text";
        textBoxInput.style.width = "270px";
        textBoxInput.style.font = "14pt Arial";
        textBoxInput.style.padding = "10px";
        textBoxInput.style.height = "8px";
        //was 8 above broke in ie11.... Changed to 25 and text shows up
        //unsure why or its the correct fix.
        //Josh j
        textBoxInput.onkeypress = function (key) {
          if (validChars.indexOf(key.keyCode) === -1) {
            return false;
          }
        };
        textBoxInput.onkeyup = function (key) {
          if (key.keyCode !== 13) {
            keyPress();
          }
        };
        textBoxInput.onkeydown = function (key) {
          var keyCode = key.keyCode;
          if (key.ctrlKey) {
            if (keyCode === 37) {
              displayPreviousQuestion();
            } else if (keyCode === 39) {
              displayNextQuestion();
            }
          } else {
            if (key.keyCode === 13) markerClick();
          }
        };

        self.stage.canvas.parentElement.insertBefore(textBoxInput, canvas);
        var textBoxInputControl = new createjs.DOMElement(textBoxInput);
        textBoxInputControl.x = 10;
        textBoxInputControl.y = bounds.height - 55;
        markerSprites.gotoAndStop(1);
        markerSprites.x = 0;
        markerSprites.y = 0;
        markerSprites.on("click", markerClick);
        markerSprites.cursor = "pointer";
        deleteButton.x = markerSprites.getBounds().width + 3;
        deleteButton.y = 0;
        deleteButton.cursor = "pointer";
        deleteButton.on("click", deleteAnswer);
        var buttonContainer = new createjs.Container();
        buttonContainer.addChild(deleteButton, markerSprites);
        buttonContainer.x =
          bounds.width - buttonContainer.getBounds().width - 10;
        buttonContainer.y = textBoxInputControl.y;
        var clueTextBox = new createjs.Text("", "10pt Arial", "white");
        clueTextBox.textAlign = "center";
        clueTextBox.lineWidth = 175;
        clueTextBox.maxWidth = 175;
        clueTextBox.x = 100;
        clueTextBox.y = 5;
        var textBoxError = new createjs.Text("*", "12pt Arial", "red");
        textBoxError.textAlign = "center";
        textBoxError.lineWidth = textBox.maxWidth;
        textBoxError.maxWidth = textBox.maxWidth;
        textBoxError.x = 193;
        textBoxError.y = bounds.height - 20;
        textBoxError.alpha = 0.0;
        var textBoxTotal = new createjs.Text("", "10pt Arial", "white");
        textBoxTotal.textAlign = "center";
        textBoxTotal.lineWidth = textBox.maxWidth;
        textBoxTotal.maxWidth = textBox.maxWidth;
        textBoxTotal.x = 193;
        textBoxTotal.y = bounds.height - 18;
        //seems to be duplicated. This value gets over ridden by a different set down below.
        //set this to 18 to not overlap text --- Josh
        textBoxTotal.alpha = 1.0;
        var correctAnswerText = new createjs.Text(
          "Correct Answer:",
          "14pt Arial",
          "white"
        );
        correctAnswerText.x = 20;
        correctAnswerText.y = bounds.height - 30;
        correctAnswerText.alpha = 0.0;
        var yourAnswerText = new createjs.Text(
          "Your Answer:",
          "14pt Arial",
          "white"
        );
        yourAnswerText.x = 20;
        yourAnswerText.y = bounds.height - 60;
        yourAnswerText.alpha = 0.0;
        bounds = correctAnswerText.getBounds();
        yourAnswerText.lineWidth = bounds.width;
        yourAnswerText.maxWidth = bounds.width;
        correctAnswerText.lineWidth = bounds.width;
        correctAnswerText.maxWidth = bounds.width;
        yourAnswerText.width = bounds.width;
        yourAnswerText.height = bounds.height;
        correctAnswerText.width = bounds.width;
        correctAnswerText.height = bounds.height;
        var correctAnswerTextInput = new createjs.Text(
          "*",
          "bold 14pt Arial Black",
          "rgba(254,254,254,1.0)"
        );
        correctAnswerTextInput.x = 30 + bounds.width;
        correctAnswerTextInput.y = correctAnswerText.y - 2;
        correctAnswerTextInput.alpha = 0.0;
        var yourAnswerTextInput = new createjs.Text(
          "*",
          "bold 14pt Arial Black",
          "rgba(255,0,0,0.5)"
        );
        yourAnswerTextInput.x = 30 + bounds.width;
        yourAnswerTextInput.y = yourAnswerText.y - 2;
        yourAnswerTextInput.alpha = 0.0;
        menuTitleContainer.addChild(nextQuestion, clueTextBox, prevQuestion);
        menuStripContainer.addChild(menuTitleContainer, menuButtonContainer);
        bounds = menuTitleContainer.getBounds();
        menuTitleContainer.x =
          (questionBubble.getBounds().width - bounds.width) / 2;
        menuTitleContainer.y = 0;
        var miniContainer = new createjs.Container();
        var miniTitleText = new createjs.Text("Clue", "10pt Arial", "white");
        var miniMenuStripBackground = new createjs.Shape();
        miniMenuStripBackground.graphics
          .beginFill("#040707")
          .setStrokeStyle(1)
          .beginStroke("white")
          .drawRoundRectComplex(0, 0, 150, 25, 5, 5, 0, 0);
        var miniTitleButtons = menuButtonContainer.clone(true);
        var miniMinimizeButton = miniTitleButtons.getChildAt(0);
        var miniMaximizeButton = miniTitleButtons.getChildAt(1);
        miniMinimizeButton.on("click", minimizeMouseClick);
        miniMinimizeButton.on("dblclick", minimizeMouseDblClick);
        miniMaximizeButton.on("click", maximizeMouseClick);
        miniMinimizeButton.cursor = "pointer";
        miniMaximizeButton.cursor = "pointer";
        miniTitleText.textAlign = "center";
        miniTitleText.lineWidth = 175;
        miniTitleText.maxWidth = 175;
        miniTitleText.x = 75;
        miniTitleText.y = 5;
        miniContainer.addChild(
          miniMenuStripBackground,
          miniTitleText,
          miniTitleButtons
        );
        miniTitleButtons.x = 110;
        miniTitleButtons.y = 0;
        miniContainer.alpha = 0.0;
        miniContainer.x = 140;
        miniContainer.y = 575;
        minimizeContainer.on("click", minimizeMouseClick);
        maximizeContainer.on("click", maximizeMouseClick);
        maximizeContainer.on("dblclick", maximizeMouseDblClick);
        minimizeContainer.cursor = "pointer";
        maximizeContainer.cursor = "pointer";
        questionBubble.name = "questionBubble";
        prevQuestion.name = "prevArrow";
        nextQuestion.name = "nextArrow";
        textBoxInput.name = "textBoxInput";
        textBox.name = "textBox";
        textBoxInputControl.name = "textBoxInputControl";
        markerSprites.name = "markerSprites";
        deleteButton.name = "deleteButton";
        clueTextBox.name = "clueTextBox";
        textBoxError.name = "textBoxError";
        textBoxTotal.name = "textBoxTotal";
        correctAnswerText.name = "correctAnswerText";
        yourAnswerText.name = "yourAnswerText";
        correctAnswerTextInput.name = "correctAnswerTextInput";
        yourAnswerTextInput.name = "yourAnswerTextInput";
        questionBubbleContainer.name = "questionBubbleContainer";
        menuStripBackground.name = "menuStrip";
        minimizeContainer.name = "minimize";
        maximizeContainer.name = "maximize";
        menuTitleContainer.name = "menuTitle";
        menuButtonContainer.name = "menuButtons";
        resizeContainerNE.name = "resizeNE";
        resizeContainerNW.name = "resizeNW";
        resizeContainerSE.name = "resizeSE";
        resizeContainerSW.name = "resizeSW";
        buttonContainer.name = "buttonContainer";
        miniContainer.name = "miniContainer";
        miniTitleText.name = "miniTitleText";
        views.questionBubble = questionBubble;
        views.prevArrow = prevQuestion;
        views.nextArrow = nextQuestion;
        views.textBoxInput = textBoxInput;
        views.textBox = textBox;
        views.textBoxInputControl = textBoxInputControl;
        views.markerSprites = markerSprites;
        views.deleteButton = deleteButton;
        views.clueTextBox = clueTextBox;
        views.textBoxError = textBoxError;
        views.textBoxTotal = textBoxTotal;
        views.correctAnswerText = correctAnswerText;
        views.yourAnswerText = yourAnswerText;
        views.correctAnswerTextInput = correctAnswerTextInput;
        views.yourAnswerTextInput = yourAnswerTextInput;
        views.menuStrip = menuStripBackground;
        views.minimize = minimizeContainer;
        views.maximize = maximizeContainer;
        views.menuTitle = menuTitleContainer;
        views.menuButtons = menuButtonContainer;
        views.resizeNE = resizeContainerNE;
        views.resizeNW = resizeContainerNW;
        views.resizeSE = resizeContainerSE;
        views.resizeSW = resizeContainerSW;
        views.buttonContainer = buttonContainer;
        views.miniContainer = miniContainer;
        views.miniTitleText = miniTitleText;
        questionBubble.on("mousedown", bubbleContainerMouseDown);
        questionBubble.on("pressmove", bubbleContainerMouseMove);
        questionBubble.on("pressup", bubbleContainerMouseUp);
        questionBubbleContainer.addChild(
          questionBubble,
          menuStripContainer,
          textBox,
          textBoxInputControl,
          buttonContainer,
          textBoxError,
          textBoxTotal,
          yourAnswerText,
          yourAnswerTextInput,
          correctAnswerText,
          correctAnswerTextInput
        );
        return questionBubbleContainer;
      }

      function createTitleView() {
        var view = new createjs.Container();
        var descriptionText = new createjs.Text(
          gameData.Description,
          "bold 40px Arial",
          "#fff"
        );
        var titleImage = new createjs.Bitmap(
          resourceLoader.getResult("crosswordTitle")
        );
        var startButton = new createjs.Bitmap(
          resourceLoader.getResult("start_button")
        );
        createjs.Sound.play("bgMusic", { loop: -1, volume: 0.5 });
        descriptionText.lineWidth = 700;
        descriptionText.maxWidth = 700;
        descriptionText.x = 400;
        descriptionText.y = 275;
        descriptionText.textAlign = "center";
        titleImage.x = 67.5;
        titleImage.y = 75;
        startButton.hitArea = new createjs.Shape(
          new createjs.Graphics().beginFill("#f00").drawRect(0, 0, 262, 79)
        );
        startButton.hitArea.alpha = 0.01;
        startButton.cursor = "pointer";
        startButton.regX = 131;
        startButton.regY = 39.5;
        startButton.x = 400;
        startButton.y = 500;
        view.addChild(
          new createjs.Bitmap(resourceLoader.getResult("title_background"))
        );
        view.addChild(titleImage, descriptionText, startButton);
        startButton.on("click", function () {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          console.log("StartButton Click");
          showView(createTitleView1());
        });
        if (!isMobileDevice) {
          startButton.on("mouseover", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 1.1, scaleY: 1.1 }, 200)
              .to({ scaleX: 1.0, scaleY: 1.0 }, 200)
              .to({ scaleX: 1.1, scaleY: 1.1 }, 200)
              .call(function () {
                update = true;
              });
          });
          startButton.on("mouseout", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 1.0, scaleY: 1.0 }, 200)
              .call(function () {
                update = true;
              });
          });
        }
        view.name = "TitleView";
        return view;
      }

      function createTitleView1() {
        var view = new createjs.Container();
        var startButton = new createjs.Bitmap(
          resourceLoader.getResult("next_button")
        );
        startButton.hitArea = new createjs.Shape(
          new createjs.Graphics().beginFill("#f00").drawRect(0, 0, 262, 79)
        );
        startButton.hitArea.alpha = 0.01;
        startButton.cursor = "pointer";
        startButton.regX = 131;
        startButton.regY = 39.5;
        startButton.x = 400;
        startButton.y = 550;
        view.addChild(new createjs.Bitmap(resourceLoader.getResult("sceneBg")));
        view.addChild(startButton);
        startButton.on("click", function () {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          console.log("StartButton Click");
          showView(createTitleView2());
        });
        if (!isMobileDevice) {
          startButton.on("mouseover", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 1.1, scaleY: 1.1 }, 200)
              .to({ scaleX: 1.0, scaleY: 1.0 }, 200)
              .to({ scaleX: 1.1, scaleY: 1.1 }, 200)
              .call(function () {
                update = true;
              });
          });
          startButton.on("mouseout", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 1.0, scaleY: 1.0 }, 200)
              .call(function () {
                update = true;
              });
          });
        }
        view.name = "TitleView";
        return view;
      }

      function createTitleView2() {
        var view = new createjs.Container();
        var startButton = new createjs.Bitmap(
          resourceLoader.getResult("next_button")
        );
        startButton.hitArea = new createjs.Shape(
          new createjs.Graphics().beginFill("#f00").drawRect(0, 0, 262, 79)
        );
        startButton.hitArea.alpha = 0.01;
        startButton.cursor = "pointer";
        startButton.regX = 131;
        startButton.regY = 39.5;
        startButton.x = 400;
        startButton.y = 550;
        view.addChild(
          new createjs.Bitmap(resourceLoader.getResult("sceneBg1"))
        );
        view.addChild(startButton);
        startButton.on("click", function () {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          console.log("StartButton Click");
          showView(createTitleView3());
        });
        if (!isMobileDevice) {
          startButton.on("mouseover", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 1.1, scaleY: 1.1 }, 200)
              .to({ scaleX: 1.0, scaleY: 1.0 }, 200)
              .to({ scaleX: 1.1, scaleY: 1.1 }, 200)
              .call(function () {
                update = true;
              });
          });
          startButton.on("mouseout", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 1.0, scaleY: 1.0 }, 200)
              .call(function () {
                update = true;
              });
          });
        }
        view.name = "TitleView";
        return view;
      }

      function createTitleView3() {
        var view = new createjs.Container();
        var startButton = new createjs.Bitmap(
          resourceLoader.getResult("next_button")
        );
        startButton.hitArea = new createjs.Shape(
          new createjs.Graphics().beginFill("#f00").drawRect(0, 0, 262, 79)
        );
        startButton.hitArea.alpha = 0.01;
        startButton.cursor = "pointer";
        startButton.regX = 131;
        startButton.regY = 39.5;
        startButton.x = 400;
        startButton.y = 550;
        view.addChild(
          new createjs.Bitmap(resourceLoader.getResult("sceneBg2"))
        );
        view.addChild(startButton);
        startButton.on("click", function () {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          console.log("StartButton Click");
          loadGame();
        });
        if (!isMobileDevice) {
          startButton.on("mouseover", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 1.1, scaleY: 1.1 }, 200)
              .to({ scaleX: 1.0, scaleY: 1.0 }, 200)
              .to({ scaleX: 1.1, scaleY: 1.1 }, 200)
              .call(function () {
                update = true;
              });
          });
          startButton.on("mouseout", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 1.0, scaleY: 1.0 }, 200)
              .call(function () {
                update = true;
              });
          });
        }
        view.name = "TitleView";
        return view;
      }

      function createZoomControls() {
        var zoomContainer = new createjs.Container();
        var zoomIn = new createjs.Bitmap(resourceLoader.getResult("zoomIn"));
        var zoomOut = new createjs.Bitmap(resourceLoader.getResult("zoomOut"));
        zoomIn.x = 0;
        zoomIn.y = 0;
        zoomOut.x = 0;
        zoomOut.y = 60;
        zoomIn.cursor = "pointer";
        zoomOut.cursor = "pointer";
        var zoomInterval;
        zoomIn.addEventListener("mousedown", function () {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          update = true;
          zoomInterval = setInterval(function () {
            if (views.gridContainer.scaleX < 2) {
              views.gridContainer.scaleX += views.gridContainer.scaleX * 0.1;
              views.gridContainer.scaleY += views.gridContainer.scaleY * 0.1;
            }
          }, 50);
        });
        zoomIn.addEventListener("pressup", function () {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          update = true;
          clearInterval(zoomInterval);
        });
        zoomIn.addEventListener("mouseout", function () {
          update = true;
          clearInterval(zoomInterval);
        });
        zoomOut.addEventListener("mousedown", function () {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          update = true;
          zoomInterval = setInterval(function () {
            if (views.gridContainer.scaleX > 0.25) {
              views.gridContainer.scaleX -= views.gridContainer.scaleX * 0.1;
              views.gridContainer.scaleY -= views.gridContainer.scaleY * 0.1;
            }
          }, 50);
        });
        zoomOut.addEventListener("pressup", function () {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          update = true;
          clearInterval(zoomInterval);
        });
        zoomOut.addEventListener("mouseout", function () {
          update = true;
          clearInterval(zoomInterval);
        });
        zoomContainer.addChild(zoomIn, zoomOut);
        return zoomContainer;
      }

      /*****************
              Display
         *****************/

      function displayByQuestionNumber(num) {
        cubeMouseOut();
        var obj = new Object();
        obj = displayQuestion(num - 1, obj);
        addCellHighlight(obj);
      }

      function displayPreviousQuestion() {
        createjs.Sound.play("swoosh", { loop: 0, volume: 0.8 });
        var obj = new Object();
        var currentQuestion = views.questionTextBox.question;
        var previousQuestion = currentQuestion - 1;
        previousQuestion =
          previousQuestion < 0 ? questions.length - 1 : previousQuestion;
        obj = displayQuestion(previousQuestion, obj);
        if (!gameOver) {
          clearCellHilights(cellCoords, "ignore");
          //addCellHighlight(obj);
          tweenToPurple(obj);
        }
        //if (activeCellObject.hasOwnProperty("target"))
        //    tweenToPurple(activeCellObject);
        spinCells(obj);
      }

      function displayQuestion(questionNumber, obj) {
        views.textBoxError.text = "";
        //views.textBoxInput.value           = "";
        showTextBoxTotal();
        if (vData.hasOwnProperty(questionNumber)) {
          views.questionTextBox.text = questions[questionNumber]["Definition"];
          views.questionTextBox.question = questionNumber;
          views.clueTextBox.text =
            questionNumber +
            1 +
            " Down (" +
            questions[questionNumber]["Name"].length +
            " Letters)";
          views.miniTitleText.text = questionNumber + 1 + " Down";
          views.textBoxInput.value = tempPlayerAnswers.hasOwnProperty(
            questionNumber
          )
            ? tempPlayerAnswers[questionNumber]
            : playerAnswers.hasOwnProperty(questionNumber)
            ? playerAnswers[questionNumber].toUpperCase()
            : "";
          obj["target"] = views.gridContainer.getChildByName(
            vData[questionNumber][0]
          );
          obj["target"]["cells"] = vData[questionNumber];
          obj["questionNumber"] = questionNumber;
        } else if (hData.hasOwnProperty(questionNumber)) {
          views.questionTextBox.text = questions[questionNumber]["Definition"];
          views.questionTextBox.question = questionNumber;
          views.clueTextBox.text =
            questionNumber +
            1 +
            " Across (" +
            questions[questionNumber]["Name"].length +
            " Letters)";
          views.miniTitleText.text = questionNumber + 1 + " Across";
          views.textBoxInput.value = tempPlayerAnswers.hasOwnProperty(
            questionNumber
          )
            ? tempPlayerAnswers[questionNumber]
            : playerAnswers.hasOwnProperty(questionNumber)
            ? playerAnswers[questionNumber].toUpperCase()
            : "";
          obj["target"] = views.gridContainer.getChildByName(
            hData[questionNumber][0]
          );
          obj["target"]["cells"] = hData[questionNumber];
          obj["questionNumber"] = questionNumber;
        }
        if (gameOver) {
          views.correctAnswerTextInput.text =
            questions[questionNumber]["Name"].toUpperCase();
          views.yourAnswerTextInput.text = playerAnswers.hasOwnProperty(
            questionNumber
          )
            ? playerAnswers[questionNumber].toUpperCase()
            : "(not answered)";
          if (
            views.correctAnswerTextInput.text === views.yourAnswerTextInput.text
          )
            views.yourAnswerTextInput.color = "rgba(46,130,255,0.5)";
          else views.yourAnswerTextInput.color = "rgba(255,0,0,0.5)";
        }
        keyPress();
        views.textBoxInput.focus();
        return obj;
      }

      function displayQuestionWithoutObject(questionNumber) {
        views.textBoxError.text = "";
        views.textBoxInput.value = "";
        showTextBoxTotal();
        if (vData.hasOwnProperty(questionNumber)) {
          views.questionTextBox.text = questions[questionNumber]["Definition"];
          views.questionTextBox.question = questionNumber;
          views.clueTextBox.text =
            questionNumber +
            1 +
            " Down (" +
            questions[questionNumber]["Name"].length +
            " Letters)";
          views.miniTitleText.text = questionNumber + 1 + " Down";
          views.textBoxInput.value = tempPlayerAnswers.hasOwnProperty(
            questionNumber
          )
            ? tempPlayerAnswers[questionNumber]
            : playerAnswers.hasOwnProperty(questionNumber)
            ? playerAnswers[questionNumber].toUpperCase()
            : "";
        } else if (hData.hasOwnProperty(questionNumber)) {
          views.questionTextBox.text = questions[questionNumber]["Definition"];
          views.questionTextBox.question = questionNumber;
          views.clueTextBox.text =
            questionNumber +
            1 +
            " Across (" +
            questions[questionNumber]["Name"].length +
            " Letters)";
          views.miniTitleText.text = questionNumber + 1 + " Across";
          views.textBoxInput.value = tempPlayerAnswers.hasOwnProperty(
            questionNumber
          )
            ? tempPlayerAnswers[questionNumber]
            : playerAnswers.hasOwnProperty(questionNumber)
            ? playerAnswers[questionNumber].toUpperCase()
            : "";
        }
        if (gameOver) {
          views.correctAnswerTextInput.text =
            questions[questionNumber]["Name"].toUpperCase();
          views.yourAnswerTextInput.text = playerAnswers.hasOwnProperty(
            questionNumber
          )
            ? playerAnswers[questionNumber].toUpperCase()
            : "(not answered)";
        }
        keyPress();
        views.textBoxInput.focus();
      }

      function displayNextQuestion() {
        createjs.Sound.play("swoosh", { loop: 0, volume: 0.8 });
        var obj = new Object();
        var currentQuestion = views.questionTextBox.question;
        var nextQuestion = currentQuestion + 1;
        nextQuestion = nextQuestion > questions.length - 1 ? 0 : nextQuestion;
        obj = displayQuestion(nextQuestion, obj);
        if (!gameOver) {
          clearCellHilights(cellCoords, "ignore");
          //addCellHighlight(obj);
          tweenToPurple(obj);
        }
        //if (activeCellObject.hasOwnProperty("target"))
        //    tweenToPurple(activeCellObject);
        spinCells(obj);
      }

      function displayNextUnansweredQuestion(num) {
        var obj = new Object();
        obj = displayQuestion(num, obj);
        if (!gameOver) {
          clearCellHilights(cellCoords);
          addCellHighlight(obj);
        }
        if (activeCellObject.hasOwnProperty("target"))
          tweenToPurple(activeCellObject);
        spinCells(obj);
      }

      function showTextBoxError() {
        if (gameOver) return;
        views.textBoxError.alpha = 1.0;
        views.textBoxTotal.alpha = 0.0;
      }

      function showTextBoxTotal() {
        if (gameOver) return;
        views.textBoxError.alpha = 0.0;
        views.textBoxTotal.alpha = 1.0;
      }

      /*****************
            Misc Clicks
         *****************/

      function deleteAnswer() {
        if (views.textBoxInput.value == "") {
          return;
        }
        createjs.Sound.play("swoosh", { loop: 0, volume: 0.8 });
        views.textBoxInput.value = "";
        markerClick();
      }

      function markerClick() {
        if (gameOver) return false;
        var questionNumber = views.questionTextBox.question;
        var input = views.textBoxInput.value.toUpperCase();
        var iLen = input.length;
        var answer = questions[views.questionTextBox.question]["Name"];
        var aLen = answer.length;
        if (input == "") {
          createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
          var cellCoords = vData.hasOwnProperty(questionNumber)
            ? vData[questionNumber]
            : hData[questionNumber];
          for (var cell in cellCoords) {
            if (cellCoords.hasOwnProperty(cell)) {
              var textObject = cellTextObjects[cellCoords[cell]];
              textObject.text = "*";
              textObject.alpha = 0.0;
            }
          }
          keyPress();
        } else if (iLen > aLen) {
          createjs.Sound.play("error", { loop: 0, volume: 0.8 });
          views.textBoxError.text = "That answer is too long!";
          showTextBoxError();
          views.textBoxInput.select();
        } else if (iLen < aLen) {
          createjs.Sound.play("error", { loop: 0, volume: 0.8 });
          views.textBoxError.text = "That answer is too short!";
          showTextBoxError();
          views.textBoxInput.select();
        } else {
          createjs.Sound.play("goodTone", { loop: 0, volume: 0.8 });
          views.textBoxError.text = "";
          views.textBoxInput.value = input;
          keyPress();
          showTextBoxTotal();
          views.textBoxInput.focus();
          var cellCoords = vData.hasOwnProperty(questionNumber)
            ? vData[questionNumber]
            : hData[questionNumber];
          for (var l in input) {
            var textObject = cellTextObjects[cellCoords[l]];
            textObject.text = input[l].toUpperCase();
            createjs.Tween.get(textObject)
              .to({ rotation: 360, alpha: 0.0 }, 250)
              .to({ rotation: 0 }, 1)
              .to({ rotation: 360, alpha: 1.0 }, 250)
              .to({ rotation: 0 }, 1);
            createjs.Tween.get(textObject.parent)
              .to({ rotation: 360, alpha: 0.0 }, 250)
              .to({ rotation: 0 }, 1)
              .to({ rotation: 360, alpha: 1.0 }, 250)
              .to({ rotation: 0 }, 1);
          }
        }
        updatePlayerAnswers(questionNumber, input);
        if (Object.keys(playerAnswers).length == questionCount) {
          questionNumbers = [];
          createAllQuestionsAnsweredPopup();
        } else {
          var next = 0;
          var idx = questionNumbers.indexOf(questionNumber.toString());
          if (idx !== -1) {
            questionNumbers.splice(idx, 1);
            if (questionNumbers.length > idx) next = questionNumbers[idx];
            else next = questionNumbers[idx - 1];
          } else {
            next = questionNumbers[0];
          }
          displayNextUnansweredQuestion(parseInt(next));
        }
      }

      function returnMouseClick() {
        createjs.Sound.play("buttonPress", { loop: 0, volume: 0.8 });
        views.instructionView.removeChild(
          views.loadingContainer,
          views.playContainer
        );
        maximizeMouseClick();
        self.currentView.getChildAt(0).mouseEnabled = true;
        self.currentView.getChildAt(1).mouseEnabled = false;
        self.currentView.getChildAt(2).mouseEnabled = false;
        self.currentView.getChildAt(3).mouseEnabled = false;
        self.currentView.getChildAt(4).mouseEnabled = false;
        if (!gameOver) {
          views.textBoxInputControl.alpha = 1.0;
          views.textBoxInput.disabled = false;
        }
        views.instructionView.alpha = 0.0;
        views.returnButton.alpha = 1.0;
      }

      function reviewMouseClick() {
        self.currentView.getChildAt(0).mouseEnabled = true;
        self.currentView.getChildAt(1).mouseEnabled = false;
        self.currentView.getChildAt(2).mouseEnabled = false;
        self.currentView.getChildAt(3).mouseEnabled = false;
        self.currentView.getChildAt(4).mouseEnabled = false;
        self.currentView.getChildAt(2).alpha = 0.0;
        self.currentView.getChildAt(3).alpha = 0.0;
      }

      /****************
            Cell Stuff
         ****************/

      function addCellHighlight(e) {
        if (gameOver) return false;
        var cell;
        var name;
        var child;
        cellCoords = e["target"]["cells"];
        for (var i = 0; i < cellCoords.length; i++) {
          cell = cellCoords[i];
          name = cell.join(",");
          child = views.gridContainer.getChildByName(name).children[0];
          // child.graphics._fill.style = "rgba(255,217,102,1.0)";
          // child.graphics._fillInstructions[0].params[1] = "rgba(255,217,102,1.0)";
          child.r = 255;
          child.g = 217;
          child.b = 102;
        }
      }

      function clearCellHilights(coords, tweenActive) {
        if (gameOver) return false;
        var cell;
        var name;
        var child;
        for (var i = 0; i < coords.length; i++) {
          cell = coords[i];
          name = cell.join(",");
          child = views.gridContainer.getChildByName(name).children[0];
          //child.graphics._fill.style = "rgba(0,0,0,0.35)";
          //child.graphics._fillInstructions[0].params[1] = "rgba(0,0,0,0.35)";
        }
        if (tweenActive === "ignore") activeCellObject = {};
        else if (tweenActive === true) {
          if (activeCellObject.hasOwnProperty("target"))
            tweenToPurple(activeCellObject);
        } else if (tweenActive === false)
          if (currentCellObject.hasOwnProperty("target"))
            tweenToPurple(currentCellObject);
      }

      function correctCellHilight(e) {
        var cell;
        var name;
        var child;
        cellCoords = e["target"]["cells"];
        for (var i = 0; i < cellCoords.length; i++) {
          cell = cellCoords[i];
          name = cell.join(",");
          child = views.gridContainer.getChildByName(name).children[0];
          //child.graphics._fill.style = "rgba(0,0,255,0.5)";
          // child.graphics._fillInstructions[0].params[1] = "rgba(0,0,255,0.5)";
          child.r = 0;
          child.g = 0;
          child.b = 255;
        }
      }

      function incorrectCellHilight(e) {
        var cell;
        var name;
        var child;
        cellCoords = e["target"]["cells"];
        for (var i = 0; i < cellCoords.length; i++) {
          cell = cellCoords[i];
          name = cell.join(",");
          child = views.gridContainer.getChildByName(name).children[0];
          //child.graphics._fill.style = "rgba(255,0,0,0.5)";
          //child.graphics._fillInstructions[0].params[1] = "rgba(255,0,0,0.5)";
          child.r = 255;
          child.g = 0;
          child.b = 0;
        }
      }

      function spinCells(e) {
        var cell, cellObj, i;
        var cells = e["target"]["cells"];
        if (hData.hasOwnProperty(cells[0]) && hData.hasOwnProperty(cells[1])) {
          for (i = 0; i < cells.length; i++) {
            cell = cells[i];
            cellObj = views.gridContainer.getChildByName(cell);
            createjs.Tween.get(cellObj)
              .to({ scaleX: -1 }, 250)
              .to({ scaleX: 1 }, 250);
          }
        } else {
          for (i = 0; i < cells.length; i++) {
            cell = cells[i];
            cellObj = views.gridContainer.getChildByName(cell);
            createjs.Tween.get(cellObj)
              .to({ scaleY: -1 }, 250)
              .to({ scaleY: 1 }, 250);
          }
        }
      }

      function tweenToPurple(e) {
        if (gameOver) return false;
        var cell;
        var name;
        var child;
        var coords = e["target"]["cells"];
        cellCoords = e["target"]["cells"];
        for (var i = 0; i < coords.length; i++) {
          cell = coords[i];
          name = cell.join(",");
          child = views.gridContainer.getChildByName(name).children[0];
          //child.graphics._fill.style = "rgba(107,46,150,0.4)";
          // child.graphics._fillInstructions[0].params[1] = "rgba(107,46,150,0.4)";
          child.r = 107;
          child.g = 46;
          child.b = 150;
        }
      }

      function updatePlayerAnswers(questionNumber, input) {
        if (input == "") delete playerAnswers[questionNumber];
        else playerAnswers[questionNumber] = input;
      }

      /****************
              Resize
         ****************/

      function canvasResize() {
        window.scroll(0, 0);
        self.stage.scaleX = 1 - (orientation ? ratioPortrait : ratioLandscape);
        self.stage.scaleY = 1 - (orientation ? ratioPortrait : ratioLandscape);
        var bounds = document
          .getElementById("gameWindow")
          .getBoundingClientRect();
        window.scrollTo(bounds.left, bounds.top);
      }
      window.onresize = function () {
        setInputPosition();
      };
      //Josh Fix this for LMS
      function setInputPosition() {
        if (views.questionContainer) {
          var bounds = views.questionContainer.getBounds();
          var difx =
            views.questionContainer.x -
            ((views.questionContainer.x +
              self.stage.canvas.parentElement.offsetLeft) *
              self.stage.canvas.clientWidth) /
              800;
          var dify =
            views.questionContainer.y -
            views.textBoxInputControl.oHeight -
            (views.questionContainer.y * self.stage.canvas.clientHeight) / 600;

          views.textBoxInputControl.x = 0 - difx;
          views.textBoxInputControl.y =
            (bounds.height * self.stage.canvas.clientHeight) / 600 - 80 - dify;
          views.textBoxInputControl.width =
            ((bounds.width - 116) * canvas.clientHeight) / 600;
          //$("#textBoxInput").css('font-size', (16 * (self.stage.canvas.clientHeight / 600)) - 2);
          //var wtfHeight = (16 * (self.stage.canvas.clientHeight / 600) + 2);
          //$('#textBoxInput').height(wtfHeight);
          //$('#textBoxInput').innerHeight(wtfHeight);
          //views.textBoxInputControl.height = wtfHeight;
          //views.textBoxInputControl.oHeight = wtfHeight;
          //views.textBoxInputControl.setBounds(views.textBoxInputControl.x, views.textBoxInputControl.y, views.textBoxInputControl.width, views.textBoxInputControl.height);
          //views.textBoxInputControl.htmlElement.height = wtfHeight;

          views.textBoxInput.style.height =
            views.textBoxInputControl.height + "px";
          views.textBoxInput.style.width =
            views.textBoxInputControl.width + "px";
        }
      }

      function changeChildBounds(diff, plane, corner) {
        var questionBubbleBounds = views.questionBubble.getBounds();
        var buttonContainerBounds = views.buttonContainer.getBounds();
        var bounds = views.questionContainer.getBounds();
        views.questionBubble.x = 0;
        views.questionBubble.y = 0;
        views.questionBubble.width = questionBubbleBounds.width;
        views.questionBubble.height = questionBubbleBounds.height;
        views.questionBubble.setBounds(
          0,
          0,
          questionBubbleBounds.width,
          questionBubbleBounds.height
        );
        views.menuTitle.x = (bounds.width - 200) / 2;
        views.menuTitle.y = 0;
        views.menuTitle.width = 200;
        views.menuTitle.height = 25;
        views.menuTitle.setBounds(views.menuTitle.x, 0, 200, 25);
        views.menuStrip.x = 0;
        views.menuStrip.y = 0;
        views.menuStrip.width = bounds.width;
        views.menuStrip.height = 25;
        views.menuStrip.setBounds(0, 0, views.menuStrip.width, 25);
        views.menuButtons.x = bounds.width - 51;
        views.menuButtons.y = 0;
        views.menuButtons.width = 33;
        views.menuButtons.height = 25;
        views.menuButtons.setBounds(views.menuButtons.x, 0, 33, 25);
        views.resizeNE.x = bounds.width;
        views.resizeNE.y = 0;
        views.resizeNE.width = 15;
        views.resizeNE.height = 15;
        views.resizeNE.setBounds(views.resizeNE.x, 0, 15, 15);
        views.resizeNW.x = 0;
        views.resizeNW.y = 0;
        views.resizeNW.width = 15;
        views.resizeNW.height = 15;
        views.resizeNW.setBounds(0, 0, 15, 15);
        views.resizeSE.x = bounds.width;
        views.resizeSE.y = bounds.height;
        views.resizeSE.width = 15;
        views.resizeSE.height = 15;
        views.resizeSE.setBounds(views.resizeSE.x, views.resizeSE.y, 15, 15);
        views.resizeSW.x = 0;
        views.resizeSW.y = bounds.height;
        views.resizeSW.width = 15;
        views.resizeSW.height = 15;
        views.resizeSW.setBounds(0, views.resizeSW.y, 15, 15);
        views.textBox.x = 15;
        views.textBox.y = 35;
        views.textBox.width = bounds.width - 30;
        views.textBox.height = bounds.height - 95;
        views.textBox.lineWidth = views.textBox.width;
        views.textBox.maxWidth = views.textBox.lineWidth;
        views.textBox.setBounds(
          15,
          35,
          views.textBox.width,
          views.textBox.height
        );

        setInputPosition();

        views.buttonContainer.x =
          bounds.width - views.buttonContainer.getBounds().width - 10;
        views.buttonContainer.y = views.questionContainer.height - 55;
        views.buttonContainer.width = buttonContainerBounds.width;
        views.buttonContainer.height = buttonContainerBounds.height;
        views.buttonContainer.setBounds(
          views.buttonContainer.x,
          views.buttonContainer.y,
          views.buttonContainer.width,
          views.buttonContainer.height
        );
        views.textBoxTotal.x = bounds.width / 2;
        views.textBoxTotal.y = bounds.height - 18;
        //seems to be duplicated. This value over rides the same value set above.
        //set this to 18 to not overlap text --- Josh
        views.textBoxTotal.width = bounds.width - 30;
        views.textBoxTotal.height = 20;
        views.textBoxTotal.lineWidth = views.textBoxTotal.width;
        views.textBoxTotal.maxWidth = views.textBoxTotal.lineWidth;
        views.textBoxTotal.setBounds(
          views.textBoxTotal.x,
          views.textBoxTotal.y,
          views.textBoxTotal.width,
          views.textBoxTotal.height
        );
        views.textBoxError.x = views.textBoxTotal.x;
        views.textBoxError.y = views.textBoxTotal.y;
        views.textBoxError.width = views.textBoxTotal.width;
        views.textBoxError.height = 20;
        views.textBoxError.lineWidth = views.textBoxError.width;
        views.textBoxError.maxWidth = views.textBoxError.lineWidth;
        views.textBoxError.setBounds(
          views.textBoxError.x,
          views.textBoxError.y,
          views.textBoxError.width,
          views.textBoxError.height
        );
        views.yourAnswerText.x = 20;
        views.yourAnswerText.y = bounds.height - 60;
        views.yourAnswerText.width = views.yourAnswerText.width;
        views.yourAnswerText.height = views.yourAnswerText.height;
        views.yourAnswerText.setBounds(
          views.yourAnswerText.x,
          views.yourAnswerText.y,
          views.yourAnswerText.width,
          views.yourAnswerText.height
        );
        views.correctAnswerText.x = 20;
        views.correctAnswerText.y = bounds.height - 30;
        views.correctAnswerText.width = views.correctAnswerText.width;
        views.correctAnswerText.height = views.correctAnswerText.height;
        views.correctAnswerText.setBounds(
          views.correctAnswerText.x,
          views.correctAnswerText.y,
          views.correctAnswerText.width,
          views.correctAnswerText.height
        );
        views.correctAnswerTextInput.x = views.correctAnswerText.width + 30;
        views.correctAnswerTextInput.y = views.correctAnswerText.y;
        views.correctAnswerTextInput.width =
          bounds.width - 30 - views.correctAnswerText.width;
        views.correctAnswerTextInput.height = views.correctAnswerText.height;
        views.correctAnswerTextInput.lineWidth =
          views.correctAnswerTextInput.width;
        views.correctAnswerTextInput.maxWidth =
          views.correctAnswerTextInput.lineWidth;
        views.correctAnswerTextInput.setBounds(
          views.correctAnswerTextInput.x,
          views.correctAnswerTextInput.y,
          views.correctAnswerTextInput.width,
          views.correctAnswerTextInput.height
        );
        views.yourAnswerTextInput.x = views.yourAnswerText.width + 30;
        views.yourAnswerTextInput.y = views.yourAnswerText.y;
        views.yourAnswerTextInput.width =
          bounds.width - 30 - views.yourAnswerText.width;
        views.yourAnswerTextInput.height = views.yourAnswerText.height;
        views.yourAnswerTextInput.lineWidth = views.yourAnswerTextInput.width;
        views.yourAnswerTextInput.maxWidth =
          views.yourAnswerTextInput.lineWidth;
        views.yourAnswerTextInput.setBounds(
          views.yourAnswerTextInput.x,
          views.yourAnswerTextInput.y,
          views.yourAnswerTextInput.width,
          views.yourAnswerTextInput.height
        );
        if (
          plane === "horizontal" &&
          (corner === "resizeNW" || corner === "resizeSW")
        )
          views.questionContainer.x = bounds.x - diff;
        else views.questionContainer.x = bounds.x;
        views.questionContainer.width =
          bounds.width + (plane === "horizontal" ? diff : 0);
        views.questionContainer.height =
          bounds.height + (plane === "vertical" ? diff : 0);
        if (
          plane === "vertical" &&
          (corner === "resizeNE" || corner === "resizeNW")
        )
          views.questionContainer.y = bounds.y - diff;
        if (plane === "horizontal")
          if (bounds.y + bounds.height > 600)
            views.questionContainer.y = 600 - bounds.height;
        views.questionContainer.setBounds(
          views.questionContainer.x,
          views.questionContainer.y,
          views.questionContainer.width,
          views.questionContainer.height
        );
        views.textBoxInput.style.width = views.textBoxInputControl.width + "px";
      }

      function homeBounds() {
        var questionBubbleBounds = views.questionBubble.getBounds();
        var clueTextBoxBounds = views.clueTextBox.getBounds();
        var textBoxTotalBounds = views.textBoxTotal.getBounds();
        var buttonContainerBounds = views.buttonContainer.getBounds();
        var bounds = views.questionContainer.getBounds();
        views.questionContainer.oX = views.questionContainer.x;
        views.questionContainer.oY = views.questionContainer.y;
        views.questionContainer.oWidth = bounds.width;
        views.questionContainer.oHeight = bounds.height;
        views.questionBubble.oX = 0;
        views.questionBubble.oY = 0;
        views.questionBubble.oWidth = questionBubbleBounds.width;
        views.questionBubble.oHeight = questionBubbleBounds.height;
        views.textBox.oX = 15;
        views.textBox.oY = 35;
        views.textBox.oWidth = bounds.width - 30;
        views.textBox.oHeight = bounds.height - 95;
        views.textBoxInputControl.oX = 10;
        views.textBoxInputControl.oY = bounds.height - 55;
        views.textBoxInputControl.oWidth = bounds.width - 106;
        views.textBoxInputControl.oHeight = 32;
        views.buttonContainer.oX =
          bounds.width - views.buttonContainer.getBounds().width - 10;
        views.buttonContainer.oY = views.textBoxInputControl.oY;
        views.buttonContainer.oWidth = buttonContainerBounds.width;
        views.buttonContainer.oHeight = buttonContainerBounds.height;
        views.clueTextBox.oX = bounds / 2;
        views.clueTextBox.oY = 20;
        views.clueTextBox.oWidth = bounds - 70;
        views.clueTextBox.oHeight = clueTextBoxBounds.height;
        views.textBoxTotal.oX = textBoxTotalBounds.x;
        views.textBoxTotal.oY = textBoxTotalBounds.y;
        views.textBoxTotal.oWidth = textBoxTotalBounds.width;
        views.textBoxTotal.oHeight = textBoxTotalBounds.height;
        views.textBoxError.oX = textBoxTotalBounds.x;
        views.textBoxError.oY = textBoxTotalBounds.y;
        views.textBoxError.oWidth = textBoxTotalBounds.width;
        views.textBoxError.oHeight = textBoxTotalBounds.height;
        views.correctAnswerText.oX = 20;
        views.correctAnswerText.oY = bounds.height - 30;
        views.correctAnswerText.oWidth = views.correctAnswerText.width;
        views.correctAnswerText.oHeight = views.correctAnswerText.height;
        views.correctAnswerTextInput.oX = views.correctAnswerText.width + 30;
        views.correctAnswerTextInput.oY = views.correctAnswerText.y;
        views.correctAnswerTextInput.oWidth =
          bounds.width - 30 - views.correctAnswerText.width;
        views.correctAnswerTextInput.oHeight = views.correctAnswerText.height;
        views.yourAnswerText.oX = 20;
        views.yourAnswerText.oY = bounds.height - 60;
        views.yourAnswerText.oWidth = views.yourAnswerText.width;
        views.yourAnswerText.oHeight = views.yourAnswerText.height;
        views.yourAnswerTextInput.oX = views.yourAnswerText.width + 30;
        views.yourAnswerTextInput.oY = views.yourAnswerText.y;
        views.yourAnswerTextInput.oWidth =
          bounds.width - 30 - views.yourAnswerText.width;
        views.yourAnswerTextInput.oHeight = views.yourAnswerText.height;
        views.menuStrip.oX = 0;
        views.menuStrip.oY = 0;
        views.menuStrip.oWidth = bounds.width;
        views.menuStrip.oHeight = 25;
        views.menuTitle.oX = (bounds.width - 200) / 2;
        views.menuTitle.oY = 0;
        views.menuTitle.oWidth = 200;
        views.menuTitle.oHeight = 25;
        views.menuButtons.oX = bounds.width - 51;
        views.menuButtons.oY = 0;
        views.menuButtons.oWidth = 33;
        views.menuButtons.oHeight = 25;
        views.resizeNE.oX = bounds.width;
        views.resizeNE.oY = 0;
        views.resizeNE.oWidth = 15;
        views.resizeNE.oHeight = 15;
        views.resizeNW.oX = 0;
        views.resizeNW.oY = 0;
        views.resizeNW.oWidth = 15;
        views.resizeNW.oHeight = 15;
        views.resizeSE.oX = bounds.width;
        views.resizeSE.oY = bounds.height;
        views.resizeSE.oWidth = 15;
        views.resizeSE.oHeight = 15;
        views.resizeSW.oX = 0;
        views.resizeSW.oY = bounds.height;
        views.resizeSW.oWidth = 15;
        views.resizeSW.oHeight = 15;
        views.questionContainer.setBounds(
          views.questionContainer.x,
          views.questionContainer.y,
          views.questionContainer.width,
          views.questionContainer.height
        );
        views.questionBubble.setBounds(
          0,
          0,
          questionBubbleBounds.width,
          questionBubbleBounds.height
        );
        views.textBox.setBounds(
          15,
          35,
          views.textBox.width,
          views.textBox.height
        );
        views.clueTextBox.setBounds(
          views.clueTextBox.x,
          20,
          views.clueTextBox.width,
          clueTextBoxBounds.height
        );
        // views.textBoxInputControl.setBounds(views.textBoxInputControl.x, views.textBoxInputControl.y, views.textBoxInputControl.width, views.textBoxInputControl.height);
        views.textBoxError.setBounds(
          textBoxTotalBounds.x,
          textBoxTotalBounds.y,
          textBoxTotalBounds.width,
          textBoxTotalBounds.height
        );
        views.textBoxTotal.setBounds(
          textBoxTotalBounds.x,
          textBoxTotalBounds.y,
          textBoxTotalBounds.width,
          textBoxTotalBounds.height
        );
        views.correctAnswerText.setBounds(
          views.correctAnswerText.x,
          views.correctAnswerText.y,
          views.correctAnswerText.width,
          views.correctAnswerText.height
        );
        views.yourAnswerText.setBounds(
          views.yourAnswerText.x,
          views.yourAnswerText.y,
          views.yourAnswerText.width,
          views.yourAnswerText.height
        );
        views.correctAnswerTextInput.setBounds(
          views.correctAnswerTextInput.x,
          views.correctAnswerTextInput.y,
          views.correctAnswerTextInput.width,
          views.correctAnswerTextInput.height
        );
        views.yourAnswerTextInput.setBounds(
          views.yourAnswerTextInput.x,
          views.yourAnswerTextInput.y,
          views.yourAnswerTextInput.width,
          views.yourAnswerTextInput.height
        );
        views.menuStrip.setBounds(0, 0, views.menuStrip.oWidth, 25);
        views.menuTitle.setBounds(views.menuTitle.oX, 0, 200, 25);
        views.menuButtons.setBounds(views.menuButtons.oX, 0, 33, 25);
        views.resizeNE.setBounds(views.resizeNE.oX, 0, 15, 15);
        views.resizeNW.setBounds(0, 0, 15, 15);
        views.resizeSE.setBounds(views.resizeSE.oX, views.resizeSE.oY, 15, 15);
        views.resizeSW.setBounds(0, views.resizeSW.oY, 15, 15);
        views.buttonContainer.setBounds(
          views.buttonContainer.oX,
          views.buttonContainer.oY,
          views.buttonContainer.oWidth,
          views.buttonContainer.oHeight
        );
        setInputPosition();
      }

      /**************
              Main
         **************/

      function initializeGame() {
        var term, letter, maxX, maxY, minX, minY, firstTerm, success;
        var vCount = 0,
          hCount = 1,
          loopCnt = 0,
          coordX = 0,
          coordY = 0,
          distance = 0,
          vBestDistance = 0,
          hBestDistance = 0,
          checkX = 0,
          checkY = 0,
          termCnt = 0,
          intersects = 0,
          vIntersect = 0,
          hIntersect = 0,
          x = 0,
          y = 0,
          cnt = 0,
          unplaced = 100,
          diffX = 100,
          diffY = 100,
          sortLen = 0,
          bestDiff = 0,
          cells = 0,
          diff = 0,
          longestWord = 0,
          timeDiff = 0;
        var letterCoords = {};
        var vBest = [],
          hBest = [],
          postShuffle = [],
          xy = [];
        var cN = false,
          cS = false,
          cE = false,
          cW = false;
        var gameTerms = gameData.Terms.slice();
        var words = sanitizeAndRandomizeWords();
        var halfGrid = gameTerms.length < 30 ? 15 : 30;
        halfGrid = longestWord > halfGrid ? longestWord : halfGrid;
        var boundsMaxX = halfGrid;
        var boundsMaxY = halfGrid;
        var boundsMinX = 0 - halfGrid;
        var boundsMinY = 0 - halfGrid;
        var sorted = [];
        var build = true;
        var startDist = Math.sqrt(boundsMaxX * 4);
        var bestFailure = {};
        var maxBuildTime = 8000;
        var halfBuildTime = maxBuildTime / 2;
        var startTime = Date.now();
        var ignoreCoords = false;
        scoreSubmitted = false;
        gameOver = false;
        var loadingIncrease = 600 / maxBuildTime;
        var loadingPhrases = [
          "Memuatkan Grafik Permainan",
          "Memulakan Data Permainan",
          "Mumia sedang Membuat Pembetulan",
          "Membina Teka-teki Akhir...",
          "Membina Teka-teki Akhir... Selesai!",
        ];
        var phraseTime = maxBuildTime / (loadingPhrases.length - 1);
        loadGrid();

        function findGrid() {
          vDataTemp = {};
          hDataTemp = {};
          count = 0;
          maxX = 0;
          maxY = 0;
          minX = 0;
          minY = 0;
          coordX = 0;
          coordY = 0;
          loopCnt = 0;
          cells = 0;
          diff = 0;
          hCount = 0;
          vCount = 0;
          diffX = 100;
          diffY = 100;
          grid = {};
          words = sanitizeAndRandomizeWords();
          letterCoords = setupLetterCoordObject();
          sorted = words.slice(0);
          term = sorted[0];
          termCnt = term.length;
          build = true;
          firstTerm = term;
          var qN = originalOrder.indexOf(term);
          originalOrder[qN] = null;
          hDataTemp[qN] = [];

          for (var j = 0; j < termCnt; j++) {
            hDataTemp[[coordX, coordY]] = [term, qN];
            hDataTemp[qN].push([coordX, coordY]);
            recordHorizontalPlacement(coordX, coordY, term[j]);
          }
          sorted.shift();
          termsloop: while (build) {
            // Cycles through remaining terms and looks for best placement
            vIntersect = 0;
            hIntersect = 0;
            vBestDistance = startDist;
            hBestDistance = startDist;
            vBest = [];
            hBest = [];
            sortLen = sorted.length;
            success = false;

            for (var tCnt = 0; tCnt < sortLen; tCnt++) {
              // Checks all remaining terms
              term = sorted[tCnt];
              postShuffle = getAllCoordinates(term);

              for (
                var pos = 0, postShuffleCnt = postShuffle.length;
                pos < postShuffleCnt && success === false;
                pos++
              ) {
                // Checks all letters for term
                xy = postShuffle[pos];
                x = xy[0];
                y = xy[1];
                cN = grid[[x, y + 1]] ? 1 : 0;
                cS = grid[[x, y - 1]] ? 1 : 0;
                cE = grid[[x + 1, y]] ? 1 : 0;
                cW = grid[[x - 1, y]] ? 1 : 0;
                cnt = cN + cS + cE + cW;
                if (cnt > 2) continue;
                if (
                  cN + cW === 2 ||
                  cN + cE === 2 ||
                  cS + cW === 2 ||
                  cS + cE === 2
                )
                  continue;
                letter = grid[xy];
                if (cN + cS === 0) findVerticalPlacement(term, letter);
                else findHorizontalPlacement(term, letter);
              }
            }
            if (vBestDistance < startDist || hBestDistance < startDist) {
              if (vBestDistance > hBestDistance) placeHorizontal();
              else placeVertical();
              if (sorted.length === 0) build = false;
              continue termsloop;
            }
            build = false; // Unable to place any term on the board
          }
          sortLen = sorted.length;
          if (sortLen > 0) {
            findHomeForStragglers();
            if (bestDiff === 0 && sortLen < unplaced) {
              unplaced = sortLen;
              bestFailure = {};
              bestFailure["minX"] = minX;
              bestFailure["minY"] = minY;
              bestFailure["maxX"] = maxX;
              bestFailure["maxY"] = maxY;
              bestFailure["leftOver"] = sorted;
              var key;
              for (key in grid) {
                if (grid.hasOwnProperty(key)) bestFailure[key] = grid[key];
              }
              vData = {};
              hData = {};
              for (key in vDataTemp) {
                if (vDataTemp.hasOwnProperty(key)) vData[key] = vDataTemp[key];
              }
              for (key in hDataTemp) {
                if (hDataTemp.hasOwnProperty(key)) hData[key] = hDataTemp[key];
              }
              vDataTemp = {};
              hDataTemp = {};
            }
          } else {
            diffX = Math.floor(maxX * 0.75) - Math.floor(minX * 0.75) + 1;
            diffY = Math.floor(maxY * 0.75) - Math.floor(minY * 0.75) + 1;
            cells = Object.keys(grid).length;
            diff = cells / (diffX * diffY);

            if (diff > bestDiff) {
              bestDiff = diff;
              bestFailure = {};
              bestFailure["minX"] = minX;
              bestFailure["minY"] = minY;
              bestFailure["maxX"] = maxX;
              bestFailure["maxY"] = maxY;
              bestFailure["leftOver"] = [];
              for (key in grid) {
                if (grid.hasOwnProperty(key)) bestFailure[key] = grid[key];
              }
              vData = {};
              hData = {};
              for (key in vDataTemp) {
                if (vDataTemp.hasOwnProperty(key)) vData[key] = vDataTemp[key];
              }
              for (key in hDataTemp) {
                if (hDataTemp.hasOwnProperty(key)) hData[key] = hDataTemp[key];
              }
              vDataTemp = {};
              hDataTemp = {};
            }
          }
          loadGrid();
        }

        function loadGrid() {
          timeDiff = Date.now() - startTime;
          if (views.loadingShape)
            views.loadingShape.scaleX = (loadingIncrease * timeDiff) / 600;
          //    views.loadingShape.graphics._instructions[1].w = loadingIncrease * timeDiff;
          views.loadingText.text =
            loadingPhrases[Math.floor(timeDiff / phraseTime)];
          self.currentView.updateCache();
          if (timeDiff < maxBuildTime) {
            if (timeDiff > halfBuildTime) ignoreCoords = true;
            setTimeout(function () {
              findGrid();
            }, 0);
          } else {
            if (bestFailure.hasOwnProperty("minX")) {
              grid = {};
              minX = bestFailure["minX"];
              minY = bestFailure["minY"];
              maxX = bestFailure["maxX"];
              maxY = bestFailure["maxY"];
              sorted = bestFailure["leftOver"];
              for (key in bestFailure) {
                if (bestFailure.hasOwnProperty(key))
                  grid[key] = bestFailure[key];
              }
              delete grid["minX"];
              delete grid["minY"];
              delete grid["maxX"];
              delete grid["maxY"];
              delete grid["leftOver"];
            }
            createGameSessionView(maxX, maxY, minX, minY, grid);
            views.loadingShape.scaleX = 1.0;
          }
        }

        function findHomeForStragglers() {
          var word;
          var checkX = 0;
          var checkY = 0;
          var coordX = 0;
          var coordY = 0;
          var boundsMaxX = maxX + 2;
          var boundsMinY = (minY === 0 ? 0 - maxX : minY) - 2;
          var boundsMaxY = (maxY === 0 ? maxX : maxY) + 2;
          var boundsMinX = minX - 2;
          var hBestDistance = 100;
          var vBestDistance = 100;
          var hBest = [];
          var vBest = [];
          var distance = 0;
          while (sorted.length > 0) {
            hBestDistance = 100;
            vBestDistance = 100;
            distance = 0;
            hBest = [];
            vBest = [];
            word = sorted[0];
            while (boundsMaxX + Math.abs(boundsMinX) < word.length) {
              maxX += 2;
              minX -= 2;
              boundsMaxX += 2;
              boundsMinX -= 2;
            }

            while (boundsMaxY + Math.abs(boundsMinY) < word.length) {
              maxY += 2;
              minY -= 2;
              boundsMaxY += 2;
              boundsMinY -= 2;
            }

            for (var j = boundsMinX, k = boundsMaxY; k >= boundsMinY; j++) {
              x = j;
              y = k;
              checkX = x;
              checkY = y;
              coordX = x;
              coordY = y;
              if (!grid[[x, y]]) {
                if (checkHorz(word)) {
                  distance =
                    Math.sqrt(
                      Math.abs(coordX) +
                        Math.abs(coordY) +
                        Math.abs(checkX) +
                        Math.abs(checkY) +
                        Math.abs(coordY) +
                        (Math.abs(coordX) - Math.floor(word.length / 2))
                    ) - Math.sqrt(Math.abs(coordX - checkX));
                  if (distance < hBestDistance) {
                    hBestDistance = distance;
                    hBest = [[x, y].join(","), coordX, coordY, 0, word];
                  }
                }
                checkX = x;
                checkY = y;
                if (checkVert(word)) {
                  distance =
                    Math.sqrt(
                      Math.abs(coordX) +
                        Math.abs(coordY) +
                        Math.abs(checkX) +
                        Math.abs(checkY) +
                        Math.abs(coordX) +
                        (Math.abs(coordY) - Math.floor(word.length / 2))
                    ) - Math.sqrt(Math.abs(coordY - checkY));
                  if (distance < vBestDistance) {
                    vBestDistance = distance;
                    vBest = [[x, y].join(","), coordX, coordY, 0, word];
                  }
                }
              }
              if (j === boundsMaxX) {
                j = boundsMinX;
                k--;
              }
            }
            if (hBestDistance < 100 || vBestDistance < 100) {
              if (hBestDistance < vBestDistance) placeHorizontalStraggler();
              else placeVerticalStraggler();
            } else {
              boundsMaxX += 2;
              boundsMinX -= 2;
              boundsMaxY += 2;
              boundsMinY -= 2;
              maxX += 2;
              maxY += 2;
              minX -= 2;
              minY -= 2;
            }

            maxX++;
            maxY++;
            minX--;
            minY--;
          }

          function placeVerticalStraggler() {
            var term = vBest[4];
            coordX = vBest[1];
            coordY = vBest[2];
            var j = 0;
            var len = term.length - 1;
            var qN = originalOrder.indexOf(term);
            originalOrder[qN] = null;
            vDataTemp[qN] = [[coordX, coordY]];
            vDataTemp[[coordX, coordY]] = [term, qN];
            recordVerticalStragglerPlacement(coordX, coordY, term[j]);
            while (j++ < len) {
              vDataTemp[[coordX, coordY]] = [term, qN];
              vDataTemp[qN].push([coordX, coordY]);
              recordVerticalStragglerPlacement(coordX, coordY, term[j]);
            }
            sorted.splice(sorted.indexOf(term), 1);
            vBest = [];
            vIntersect = 0;
          }

          function placeHorizontalStraggler() {
            var term = hBest[4];
            coordX = hBest[1];
            coordY = hBest[2];
            var j = 0;
            var len = term.length - 1;
            var qN = originalOrder.indexOf(term);
            originalOrder[qN] = null;
            hDataTemp[qN] = [[coordX, coordY]];
            hDataTemp[[coordX, coordY]] = [term, qN];
            recordHorizontalStragglerPlacement(coordX, coordY, term[j]);
            while (j++ < len) {
              hDataTemp[[coordX, coordY]] = [term, qN];
              hDataTemp[qN].push([coordX, coordY]);
              recordHorizontalStragglerPlacement(coordX, coordY, term[j]);
            }
            sorted.splice(sorted.indexOf(term), 1);
            hBest = [];
            hIntersect = 0;
          }

          function recordHorizontalStragglerPlacement(cx, cy, t) {
            grid[[cx, cy]] = t;
            letterCoords[t.charCodeAt()].push([cx, cy]);
            maxX = maxX < coordX ? coordX : maxX;
            minX = minX > coordX ? coordX : minX;
            coordX++;
          }

          function recordVerticalStragglerPlacement(cx, cy, t) {
            grid[[cx, cy]] = t;
            letterCoords[t.charCodeAt()].push([cx, cy]);
            maxY = maxY < coordY ? coordY : maxY;
            minY = minY > coordY ? coordY : minY;
            coordY--;
          }

          function checkHorz(word) {
            var success = true;
            if (checkX + word.length > boundsMaxX) {
              success = false;
            } else {
              for (var n = 0; n < word.length && success === true; n++) {
                if (grid.hasOwnProperty([checkX, checkY + 1])) success = false;
                if (grid.hasOwnProperty([checkX + 1, checkY + 1]))
                  success = false;
                if (grid.hasOwnProperty([checkX + 1, checkY])) success = false;
                if (grid.hasOwnProperty([checkX + 1, checkY - 1]))
                  success = false;
                if (grid.hasOwnProperty([checkX, checkY - 1])) success = false;
                if (grid.hasOwnProperty([checkX - 1, checkY - 1]))
                  success = false;
                if (grid.hasOwnProperty([checkX - 1, checkY])) success = false;
                if (grid.hasOwnProperty([checkX - 1, checkY + 1]))
                  success = false;
                checkX++;
              }
            }
            return success;
          }

          function checkVert(word) {
            var success = true;
            if (checkY - word.length < boundsMinY) {
              success = false;
            } else {
              for (var n = 0; n < word.length && success === true; n++) {
                if (grid.hasOwnProperty([checkX, checkY + 1])) success = false;
                if (grid.hasOwnProperty([checkX + 1, checkY + 1]))
                  success = false;
                if (grid.hasOwnProperty([checkX + 1, checkY])) success = false;
                if (grid.hasOwnProperty([checkX + 1, checkY - 1]))
                  success = false;
                if (grid.hasOwnProperty([checkX, checkY - 1])) success = false;
                if (grid.hasOwnProperty([checkX - 1, checkY - 1]))
                  success = false;
                if (grid.hasOwnProperty([checkX - 1, checkY])) success = false;
                if (grid.hasOwnProperty([checkX - 1, checkY + 1]))
                  success = false;
                checkY--;
              }
            }
            return success;
          }
        }

        function setupLetterCoordObject() {
          //var cc = 64;
          var cc = 32;
          var LC = {};
          while (cc++ < 90) LC[cc] = [];
          return LC;
        }

        function sanitizeAndRandomizeWords() {
          var word;
          var wordsTemp = [];
          var i = gameTerms.length - 1;
          var termList = gameTerms;
          do {
            //word         = termList[i]["Name"].toUpperCase().replace(/[^a-zA-Z0-9]/g, ""); // CLEARS ALL SPECIAL CHARS
            //word = termList[i]["Name"].toUpperCase().replace(/^\s+|\s+$|\s+(?=\s)/g, ""); // ONLY REMOVES WHITESPACES
            word = termList[i]["Name"].toUpperCase().replace(/\s/g, ""); // ONLY REMOVES WHITESPACES
            longestWord = word.length > longestWord ? word.length : longestWord;
            wordsTemp[i] = word;
          } while (i-- > 0);
          longestWord = Math.ceil(longestWord / 2);
          originalOrder = wordsTemp.slice(0);
          return shuffle(wordsTemp);
        }

        function getAllCoordinates(shuffled) {
          var letterCode, letter;
          var cnt = shuffled.length - 1;
          var merged = [];
          var allCoords = [];
          do {
            letter = shuffled[cnt];
            letterCode = letter.charCodeAt();
            merged = [];
            merged.push(letterCoords[letterCode].slice(0));
            allCoords = allCoords.concat.apply(allCoords, merged);
          } while (cnt-- > 0);
          allCoords.sort(function (a, b) {
            return (
              Math.sqrt(a[0] * a[0] + a[1] * a[1]) -
              Math.sqrt(b[0] * b[0] + b[1] * b[1])
            );
          });
          return allCoords;
        }

        function findHorizontalPlacement(t, l) {
          var occs = occurrences(t, l);
          var idxLetter = 0;
          var termCnt = t.length;

          outerloop: for (var occ = 0; occ < occs && success === false; occ++) {
            idxLetter = t.indexOf(l, idxLetter);
            coordX = x - idxLetter;
            checkX = x - idxLetter;
            coordY = y;
            checkY = y;
            intersects = 0;
            distance = 0;
            idxLetter++;

            if (grid[[checkX - 1, checkY]]) continue;
            if (grid[[checkX + termCnt]]) continue;
            if (
              (checkX < boundsMinX || checkX + termCnt > boundsMaxX) &&
              ignoreCoords === false
            )
              continue;
            for (var j = 0; j < termCnt; j++) {
              count++;
              if (checkX === x && checkY === y) {
                intersects++;
                checkX++;
                continue;
              }
              if (!checkHorizontal(checkX, checkY, t[j])) continue outerloop;
            }
            checkX--;
            success = true;
            distance =
              Math.sqrt(
                Math.abs(coordX) +
                  Math.abs(coordY) +
                  Math.abs(checkX) +
                  Math.abs(checkY) +
                  Math.abs(coordY) +
                  (Math.abs(coordX) - Math.floor(termCnt / 2))
              ) - Math.sqrt(Math.abs(coordX - checkX));
            if (distance < hBestDistance) {
              hBestDistance = distance;
              hBest = [[x, y].join(","), coordX, coordY, l, t];
            }
          }
        }

        function findVerticalPlacement(t, l) {
          var occs = occurrences(t, l);
          var idxLetter = 0;
          var termCnt = t.length;

          outerloop: for (var occ = 0; occ < occs && success === false; occ++) {
            idxLetter = t.indexOf(l, idxLetter);
            coordY = y + idxLetter;
            coordX = x;
            checkX = x;
            checkY = y + idxLetter;
            intersects = 0;
            distance = 0;
            idxLetter++;

            if (grid[[checkX, checkY + 1]]) continue;
            if (grid[[checkX, checkY - termCnt]]) continue;
            if (
              (checkY > boundsMaxY || checkY - termCnt < boundsMinY) &&
              ignoreCoords === false
            )
              continue;
            for (var j = 0; j < termCnt; j++) {
              count++;
              if (checkX === x && checkY === y) {
                intersects++;
                checkY--;
                continue;
              }
              if (!checkVertical(checkX, checkY, t[j])) continue outerloop;
            }
            checkY++;
            success = true;
            distance =
              Math.sqrt(
                Math.abs(coordX) +
                  Math.abs(coordY) +
                  Math.abs(checkX) +
                  Math.abs(checkY) +
                  Math.abs(coordX) +
                  (Math.abs(coordY) - Math.floor(termCnt / 2))
              ) - Math.sqrt(Math.abs(coordY - checkY));
            if (distance < vBestDistance) {
              vBestDistance = distance;
              vBest = [[x, y].join(","), coordX, coordY, l, t];
            }
          }
        }

        function placeVertical() {
          var term = vBest[4];
          var vLetter = grid[vBest[0]].charCodeAt();
          coordX = vBest[1];
          coordY = vBest[2];
          var idxL = letterCoords[vLetter];
          var id = idxL
            .map(function (element) {
              return element.toString();
            })
            .indexOf(vBest[0]);
          var j = 0;
          var len = term.length - 1;
          var qN = originalOrder.indexOf(term);
          originalOrder[qN] = null;
          vDataTemp[qN] = [[coordX, coordY]];
          // Record word/question number
          vDataTemp[[coordX, coordY]] = [term, qN];
          letterCoords[vLetter].splice(id, 1);
          recordVerticalPlacement(coordX, coordY, term[j]);
          while (j++ < len) {
            vDataTemp[[coordX, coordY]] = [term, qN];
            vDataTemp[qN].push([coordX, coordY]);
            recordVerticalPlacement(coordX, coordY, term[j]);
          }
          sorted.splice(sorted.indexOf(term), 1);
          loopCnt = 0;
          vBest = [];
          vIntersect = 0;
          vCount++;
        }

        function placeHorizontal() {
          var term = hBest[4];
          var hLetter = grid[hBest[0]].charCodeAt();
          coordX = hBest[1];
          coordY = hBest[2];
          var idxL = letterCoords[hLetter];
          var id = idxL
            .map(function (element) {
              return element.toString();
            })
            .indexOf(hBest[0]);
          var j = 0;
          var len = term.length - 1;
          var qN = originalOrder.indexOf(term);
          originalOrder[qN] = null;
          hDataTemp[qN] = [[coordX, coordY]];
          hDataTemp[[coordX, coordY]] = [term, qN];
          letterCoords[hLetter].splice(id, 1);
          recordHorizontalPlacement(coordX, coordY, term[j]);
          while (j++ < len) {
            hDataTemp[[coordX, coordY]] = [term, qN];
            hDataTemp[qN].push([coordX, coordY]);
            recordHorizontalPlacement(coordX, coordY, term[j]);
          }
          sorted.splice(sorted.indexOf(term), 1);
          loopCnt = 0;
          hBest = [];
          hIntersect = 0;
          hCount++;
        }

        function recordHorizontalPlacement(cx, cy, t) {
          grid[[cx, cy]] = t;
          if (checkVerticalCells(cx, cy))
            letterCoords[t.charCodeAt()].push([cx, cy]);
          maxX = maxX < coordX ? coordX : maxX;
          minX = minX > coordX ? coordX : minX;
          coordX++;
        }

        function recordVerticalPlacement(cx, cy, t) {
          grid[[cx, cy]] = t;
          if (checkHorizontalCells(cx, cy))
            letterCoords[t.charCodeAt()].push([cx, cy]);
          maxY = maxY < coordY ? coordY : maxY;
          minY = minY > coordY ? coordY : minY;
          coordY--;
        }

        function checkHorizontalCells(cx, cy) {
          var w1 = grid.hasOwnProperty([cx - 1, cy]) ? 1 : 0;
          var w2 = grid.hasOwnProperty([cx - 2, cy]) ? 1 : 0;
          var e1 = grid.hasOwnProperty([cx + 1, cy]) ? 1 : 0;
          var e2 = grid.hasOwnProperty([cx + 2, cy]) ? 1 : 0;
          var nE = grid.hasOwnProperty([cx + 1, cy + 1]) ? 1 : 0;
          var nW = grid.hasOwnProperty([cx - 1, cy + 1]) ? 1 : 0;
          var sE = grid.hasOwnProperty([cx + 1, cy - 1]) ? 1 : 0;
          var sW = grid.hasOwnProperty([cx - 1, cy - 1]) ? 1 : 0;
          if (
            w1 ||
            e1 ||
            (w2 && e2) ||
            (nW && nE) ||
            (sW && sE) ||
            (nE && sW) ||
            (nW && sE)
          )
            return false;
          else return true;
        }

        function checkVerticalCells(cx, cy) {
          var n1 = grid.hasOwnProperty([cx, cy + 1]) ? 1 : 0;
          var n2 = grid.hasOwnProperty([cx, cy + 2]) ? 1 : 0;
          var s1 = grid.hasOwnProperty([cx, cy - 1]) ? 1 : 0;
          var s2 = grid.hasOwnProperty([cx, cy - 2]) ? 1 : 0;
          var nE = grid.hasOwnProperty([cx + 1, cy + 1]) ? 1 : 0;
          var nW = grid.hasOwnProperty([cx - 1, cy + 1]) ? 1 : 0;
          var sE = grid.hasOwnProperty([cx + 1, cy - 1]) ? 1 : 0;
          var sW = grid.hasOwnProperty([cx - 1, cy - 1]) ? 1 : 0;
          if (
            n1 ||
            s1 ||
            (n2 && s2) ||
            (nE && sE) ||
            (nW && sW) ||
            (nE && sW) ||
            (nW && sE)
          )
            return false;
          else return true;
        }

        function checkHorizontal(cx, cy, t) {
          var cH = grid.hasOwnProperty([cx, cy]);
          if (cH) {
            var cL = grid[[cx, cy]];
            if (cL != t) return false;
            else if (
              grid.hasOwnProperty([cx + 1, cy]) ||
              grid.hasOwnProperty([cx - 1, cy])
            )
              return false;
            else intersects++;
          } else {
            if (grid.hasOwnProperty([cx, cy + 1])) return false;
            if (grid.hasOwnProperty([cx, cy - 1])) return false;
            if (grid.hasOwnProperty([cx + 1, cy]))
              if (cx + 1 != x || cy != y) return false;
          }
          checkX++;
          return true;
        }

        function checkVertical(cx, cy, t) {
          var cH = grid.hasOwnProperty([cx, cy]);
          if (cH) {
            var cL = grid[[cx, cy]];
            if (cL != t) return false;
            else if (
              grid.hasOwnProperty([cx, cy + 1]) ||
              grid.hasOwnProperty([cx, cy - 1])
            )
              return false;
            else intersects++;
          } else {
            if (grid.hasOwnProperty([cx + 1, cy])) return false;
            if (grid.hasOwnProperty([cx - 1, cy])) return false;
            if (grid.hasOwnProperty([cx, cy + 1]))
              if (cx != x || cy + 1 != y) return false;
          }
          checkY--;
          return true;
        }
      }

      function sanitizeWords() {
        var i = gameData["Terms"].length - 1;
        do {
          //gameData["Terms"][i]["Name"] = gameData["Terms"][i]["Name"].toUpperCase().replace(/[^a-zA-Z0-9.]/g, "");
          gameData["Terms"][i]["Name"] = gameData["Terms"][i]["Name"]
            .toUpperCase()
            .replace(/\s/g, "");
        } while (i-- > 0);
      }

      function loadGame() {
        var view = createInstructionView();
        var container = new createjs.Container();
        var loadingText = new createjs.Text(
          "Loading...",
          "24px Arial Black",
          "black"
        );
        var loadingBG = new createjs.Shape();
        var loadingShape = new createjs.Shape();
        var startButton = new createjs.Bitmap(
          resourceLoader.getResult("start_button")
        );
        loadingText.x = 300;
        loadingText.y = 0;
        loadingText.textAlign = "center";
        loadingText.textBaseline = "middle";
        loadingBG.x = 0;
        loadingBG.y = 20;
        loadingBG.graphics
          .setStrokeStyle(2)
          .beginStroke("black")
          .beginFill(null)
          .drawRoundRect(0, 0, 601, 20, 3);
        loadingShape.x = 1;
        loadingShape.y = 21;
        loadingShape.graphics
          .beginLinearGradientFill(
            ["rgba(107,46,150,0.4)", "rgba(37,0,64,0.8)"],
            [0, 1],
            0,
            0,
            600,
            0
          )
          .drawRoundRect(0, 0, 600, 18, 3);
        loadingShape.scaleX = 1.0;
        views.loadingShape = loadingShape;
        container.addChild(loadingText, loadingBG, loadingShape);
        views.loadingContainer = container;
        views.loadingText = loadingText;
        startButton.setTransform(0, 0, 0.75, 0.75);
        var bounds = startButton.getTransformedBounds();
        startButton.cursor = "pointer";
        startButton.regX = bounds.width / 2;
        startButton.regY = bounds.height / 2;
        startButton.x = 140 + 330 - 40;
        startButton.y = 530 + 20;
        startButton.on("click", returnMouseClick);
        startButton.alpha = 0.0;

        if (!isMobileDevice) {
          startButton.on("mouseover", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 0.85, scaleY: 0.85 }, 200)
              .to({ scaleX: 0.75, scaleY: 0.75 }, 200)
              .to({ scaleX: 0.85, scaleY: 0.85 }, 200)
              .call(function () {
                update = true;
              });
          });
          startButton.on("mouseout", function () {
            update = true;
            createjs.Tween.get(startButton)
              .to({ scaleX: 0.75, scaleY: 0.75 }, 200)
              .call(function () {
                update = true;
              });
          });
        }

        views.playContainer = startButton;
        container.x = 170;
        container.y = 475;
        view.addChild(container, startButton);
        showView(view);
        self.currentView.cache(-800, -600, 1600, 1200);
        initializeGame();
      }

      function showView(view) {
        if (self.currentView) {
          self.stage.removeChild(self.currentView);
          self.previousView = self.currentView;
        } else {
          self.previousView = null;
        }
        if (view) {
          self.stage.addChild(view);
          self.currentView = view;
        } else {
          self.currentView = null;
        }
        setInputPosition();
      }

      function tickHandler(event) {
        if (gameLoaded) {
          if (rotateDown) {
            views.helpButton.scaleX -= 0.025;
          } else {
            views.helpButton.scaleX += 0.025;
          }
          if (views.helpButton.scaleX <= -1) rotateDown = false;
          if (views.helpButton.scaleX >= 1) rotateDown = true;
        }

        //if (isMobileDevice) {
        //    if (window.document.documentElement.clientWidth < window.document.documentElement.clientHeight != orientation) {
        //        orientation = orientation ? false : true;
        //        canvasResize();
        //    }
        //}

        if (!updatePaused) self.stage.update(event);
      }

      /**************
              Misc 
         **************/
      $(window).bind("beforeunload", function () {
        getResults();
      });
      function getResults() {
        self.currentView.getChildAt(0).mouseEnabled = false;
        self.currentView.getChildAt(1).mouseEnabled = false;
        self.currentView.getChildAt(2).mouseEnabled = true;
        self.currentView.getChildAt(3).mouseEnabled = true;
        self.currentView.getChildAt(4).mouseEnabled = false;
        views.deleteButton.alpha = 0.0;
        views.textBoxInputControl.alpha = 0.0;
        views.textBoxError.alpha = 0.0;
        views.textBoxTotal.alpha = 0.0;
        views.markerSprites.alpha = 0.0;
        views.yourAnswerText.alpha = 1.0;
        views.correctAnswerText.alpha = 1.0;
        views.correctAnswerTextInput.alpha = 1.0;
        views.yourAnswerTextInput.alpha = 1.0;
        gameOver = true;
        var correctObj = new Object();
        correctObj["target"] = new Object();
        correctObj["target"]["cells"] = [];
        var incorrectObj = new Object();
        incorrectObj["target"] = new Object();
        incorrectObj["target"]["cells"] = [];
        displayByQuestionNumber(1);
        cubeMouseOut(cellCoords);
        var valid, cell, cube, i, j;
        var cells = [];
        var cLen = 0;
        var score = 0;

        var qLen = questions.length;
        for (i = 0; i < qLen; i++) {
          // Check each word
          cells = vData.hasOwnProperty(i) ? vData[i] : hData[i];
          cLen = cells.length;
          valid = true;
          for (j = 0; j < cLen && valid === true; j++) {
            // Check the letter for each word
            cell = cells[j];
            cube = cellTextObjects[cell.join(",")];
            valid = cube.letter === cube.text;
          }
          if (valid) {
            correctObj["target"]["cells"] = correctObj["target"][
              "cells"
            ].concat((cells = vData.hasOwnProperty(i) ? vData[i] : hData[i]));
            score += 100;
          } else {
            incorrectObj["target"]["cells"] = incorrectObj["target"][
              "cells"
            ].concat((cells = vData.hasOwnProperty(i) ? vData[i] : hData[i]));
          }
        }
        incorrectCellHilight(incorrectObj);
        correctCellHilight(correctObj);
        views.pointsText.text = score + " mata.";
        views.pointsText1.text = score + " mata.";
        console.log(score);
        if (score != 700) {
          views.gameOverBox1.alpha = 1.0;
        } else {
          views.gameOverBox.alpha = 1.0;
        }
        if (!scoreSubmitted) {
          submitScore(score);
          scoreSubmitted = true;
          if (isLmsConnected) {
            ScormHelper.cmi.successStatus(ScormHelper.successStatus.passed);
            ScormHelper.cmi.completionStatus(
              ScormHelper.completionStatus.completed
            );

            ScormHelper.cmi.score.min(0);
            ScormHelper.cmi.score.max(questions.length);
            ScormHelper.cmi.score.raw(score / 100);
            var scaledscore = score / 100 / questions.length;
            ScormHelper.cmi.score.scaled(scaledscore);
          }
        }
      }

      function occurrences(string, subString) {
        var n = 0;
        var pos = 0;
        while (true) {
          pos = string.indexOf(subString, pos);
          if (pos >= 0) {
            n++;
            pos++;
          } else return n;
        }
      }

      function shuffle(array) {
        var currentIndex = array.length,
          temporaryValue,
          randomIndex;
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
        return array;
      }

      function submitScore(score) {
        var url = gameData.leaderboardUrl;
        if (url) {
          var data = {
            gameId: gameData.id,
            score: score,
          };
          $.ajax(url, {
            type: "POST",
            data: data,
            success: function (x) {},
            error: function (x, y, z) {},
          });
        }
      }

      /***************
              Unused
         ***************/

      function createQuestionControl() {
        var questionIcon = new createjs.Bitmap(
          resourceLoader.getResult("questionIcon")
        );
        questionIcon.x = 0;
        questionIcon.y = 0;
        questionIcon.on("click", function (e) {
          views.questionContainer.alpha = views.questionContainer.alpha ? 0 : 1;
          views.miniContainer.alpha = views.miniContainer.alpha ? 0 : 1;
          self.stage.update();
        });
        questionIcon.cursor = "pointer";
        return questionIcon;
      }

      function createQuitControl() {
        var quitIcon = new createjs.Bitmap(
          resourceLoader.getResult("closeButton")
        );
        quitIcon.x = 0;
        quitIcon.y = 0;
        quitIcon.on("click", function () {
          getResults();
        });
        quitIcon.cursor = "pointer";
        return quitIcon;
      }

      function findAllCells(startCell) {
        var foundNorth = false;
        var foundSouth = false;
        var foundEast = false;
        var foundWest = false;
        var foundAll = false;
        var x = parseInt(startCell.split(",")[0]);
        var y = parseInt(startCell.split(",")[1]);
        var vX = x;
        var hY = y;
        var nY = y;
        var sY = y;
        var eX = x;
        var wX = x;
        cellCoords = [];
        cellCoords.push([x, y]);
        while (!foundAll) {
          if (!foundNorth) {
            nY++;
            if (grid.hasOwnProperty([vX, nY])) cellCoords.push([vX, nY]);
            else foundNorth = true;
          }
          if (!foundSouth) {
            sY--;
            if (grid.hasOwnProperty([vX, sY])) cellCoords.push([vX, sY]);
            else foundSouth = true;
          }
          if (!foundEast) {
            eX++;
            if (grid.hasOwnProperty([eX, hY])) cellCoords.push([eX, hY]);
            else foundEast = true;
          }
          if (!foundWest) {
            wX--;
            if (grid.hasOwnProperty([wX, hY])) cellCoords.push([wX, hY]);
            else foundWest = true;
          }
          if (foundNorth && foundSouth && foundEast && foundWest)
            foundAll = true;
        }
        cellHilights[startCell] = cellCoords;
        return cellCoords;
      }

      createjs.Ticker.addEventListener("tick", tickHandler);
      resourceLoader.addEventListener("complete", function (event) {
        showView(createTitleView());
        //if (isMobileDevice) canvasResize();
      });
    }
    return Game;
  })(createjs);
(function () {
  var stageMouseDownHandler = createjs.Stage.prototype._handlePointerDown;
  var stageMouseUpHandler = createjs.Stage.prototype._handlePointerUp;
  var mouseInterval = {};
  var MIN_CLICK_TIME = 20;

  if (navigator.userAgent.indexOf("Android") > -1) {
    createjs.Stage.prototype._handlePointerDown = function (event) {
      var lastTime = mouseInterval.mousedown;
      var now = new Date().getTime(); // Slower than Date.now(), but compatible with IE8 and others.
      if (lastTime == null || now - lastTime > MIN_CLICK_TIME) {
        mouseInterval.mousedown = now;
        stageMouseDownHandler.call(this, event);
      }
    };
    createjs.Stage.prototype._handlePointerUp = function (event) {
      var lastTime = mouseInterval.mouseup;
      var now = new Date().getTime();
      if (lastTime == null || now - lastTime > MIN_CLICK_TIME) {
        mouseInterval.mouseup = now;
        stageMouseUpHandler.call(this, event);
      }
    };
  }
})();
