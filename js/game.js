// Declare all the commonly used objects as variables for convenience
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

var box2d = {
  scale:30,
  init:function(){
    // Set up the Box2D world that will do most of the physics calculation
    var gravity = new b2Vec2(0,9.8); //declare gravity as 9.8 m/s^2 downward
    var allowSleep = true; //Allow objects that are at rest to fall asleep and be excluded from calculations
    box2d.world = new b2World(gravity,allowSleep);
  },
  createRectangle:function(entity,definition){
    var bodyDef = new b2BodyDef;
    if(entity.isStatic){
      bodyDef.type = b2Body.b2_staticBody;
    } else {
      bodyDef.type = b2Body.b2_dynamicBody;
    }
    bodyDef.position.x = entity.x/box2d.scale;
    bodyDef.position.y = entity.y/box2d.scale;
    if (entity.angle) {
      bodyDef.angle = Math.PI*entity.angle/180;
    }
    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = definition.density;
    fixtureDef.friction = definition.friction;
    fixtureDef.restitution = definition.restitution;
    fixtureDef.shape = new b2PolygonShape;
    fixtureDef.shape.SetAsBox(entity.width/2/box2d.scale,entity.height/2/box2d.scale);
    var body = box2d.world.CreateBody(bodyDef);
    body.SetUserData(entity);
    var fixture = body.CreateFixture(fixtureDef);
    return body;
  },
  createCircle:function(entity,definition){
    var bodyDef = new b2BodyDef;
    if(entity.isStatic){
      bodyDef.type = b2Body.b2_staticBody;
    } else {
      bodyDef.type = b2Body.b2_dynamicBody;
    }
    bodyDef.position.x = entity.x/box2d.scale;
    bodyDef.position.y = entity.y/box2d.scale;
    if (entity.angle) {
      bodyDef.angle = Math.PI*entity.angle/180;
    }
    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = definition.density;
    fixtureDef.friction = definition.friction;
    fixtureDef.restitution = definition.restitution;
    fixtureDef.shape = new b2CircleShape(entity.radius/box2d.scale);
    var body = box2d.world.CreateBody(bodyDef);
    body.SetUserData(entity);
    var fixture = body.CreateFixture(fixtureDef);
    return body;
  },
}

var entities = {
  definitions:{
    "glass": {
      fullHealth: 100,
      density: 2.4,
      friction: 0.4,
      restitution: 0.15
    },
    "wood":{
      fullHealth:500,
      density:0.7,
      friction:0.4,
      restitution:0.4,
    },
    "dirt":{
      density:3.0,
      friction:1.5,
      restitution:0.2,
    },
    "burger":{
      shape:"circle",
      fullHealth:40,
      radius:25,
      density:1,
      friction:0.5,
      restitution:0.4,
    },
    "sodacan":{
      shape:"rectangle",
      fullHealth:80,
      width:40,
      height:60,
      density:1,
      friction:0.5,
      restitution:0.7,
    },
    "fries":{
      shape:"rectangle",
      fullHealth:50,
      width:40,
      height:50,
      density:1,
      friction:0.5,
      restitution:0.6,
    },
    "apple":{
      shape:"circle",
      radius:25,
      density:1.5,
      friction:0.5,
      restitution:0.4,
    },
    "orange":{
      shape:"circle",
      radius:25,
      density:1.5,
      friction:0.5,
      restitution:0.4,
    },
    "strawberry":{
      shape:"circle",
      radius:15,
      density:2.0,
      friction:0.5,
      restitution:0.4,
    }
  },
  // Take the entity, create a Box2D body, and add it to the world
  create: function(entity) {
      var definition = entities.definitions[entity.name];

      if (!definition) {
          console.log("Undefined entity name", entity.name);

          return;
      }

      switch (entity.type) {
          case "block": // simple rectangles
              entity.health = definition.fullHealth;
              entity.fullHealth = definition.fullHealth;
              entity.shape = "rectangle";
              entity.sprite = loader.loadImage("images/entities/" + entity.name + ".png");

              entity.breakSound = game.breakSound[entity.name];

              box2d.createRectangle(entity, definition);
              break;
          case "ground": // simple rectangles
                  // No need for health. These are indestructible
              entity.shape = "rectangle";
                  // No need for sprites. These won't be drawn at all
              box2d.createRectangle(entity, definition);
              break;
          case "hero":    // simple circles
          case "villain": // can be circles or rectangles
              entity.health = definition.fullHealth;
              entity.fullHealth = definition.fullHealth;
              entity.sprite = loader.loadImage("images/entities/" + entity.name + ".png");
              entity.shape = definition.shape;

              entity.bounceSound = game.bounceSound;

              if (definition.shape === "circle") {
                  entity.radius = definition.radius;
                  box2d.createCircle(entity, definition);
              } else if (definition.shape === "rectangle") {
                  entity.width = definition.width;
                  entity.height = definition.height;
                  box2d.createRectangle(entity, definition);
              }
              break;
          default:
              console.log("Undefined entity type", entity.type);
              break;
      }
  },
  // take the entity, its position, and its angle and draw it on the game canvas
  draw:function(entity,position,angle){
  }
}

var game = {
    // Start initializing objects, preloading assets and display start screen
    init: function() {
        // Get handler for game canvas and context
        game.canvas = document.getElementById("gamecanvas");
        game.context = game.canvas.getContext("2d");

        // Initialize objects
        levels.init();
        loader.init();
        mouse.init();

        // Load All Sound Effects and Background Music
        game.loadSounds(function() {
            // Hide all game layers and display the start screen
            game.hideScreens();
            game.showScreen("gamestartscreen");
        });
    },

    hideScreens: function() {
        var screens = document.getElementsByClassName("gamelayer");

        // Iterate through all the game layers and set their display to none
        for (let i = screens.length - 1; i >= 0; i--) {
            var screen = screens[i];

            screen.style.display = "none";
        }
    },

    hideScreen: function(id) {
        var screen = document.getElementById(id);

        screen.style.display = "none";
    },

    showScreen: function(id) {
        var screen = document.getElementById(id);

        screen.style.display = "block";
    },

    showLevelScreen: function() {
        game.hideScreens();
        game.showScreen("levelselectscreen");
    },

    // Store current game state - intro, wait-for-firing, firing, fired, load-next-hero, success, failure
    mode: "intro",

    // X & Y coordinates of the slingshot
    slingshotX: 140,
    slingshotY: 280,

    // X & Y coordinate of point where band is attached to slingshot
    slingshotBandX: 140 + 55,
    slingshotBandY: 280 + 23,

    // Flag to check if the game has ended
    ended: false,

    // The game score
    score: 0,

    // X axis offset for panning the screen from left to right
    offsetLeft: 0,

    start: function() {
        game.hideScreens();

        // Display the game canvas and score
        game.showScreen("gamecanvas");
        game.showScreen("scorescreen");

        game.mode = "intro";
        game.currentHero = undefined;

        game.offsetLeft = 0;
        game.ended = false;

        game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);

    },

    // Maximum panning speed per frame in pixels
    maxSpeed: 3,

    // Pan the screen so it centers at newCenter
    // (or at least as close as possible)
    panTo: function(newCenter) {

        // Minimum and Maximum panning offset
        var minOffset = 0;
        var maxOffset = game.currentLevel.backgroundImage.width - game.canvas.width;

        // The current center of the screen is half the screen width from the left offset
        var currentCenter = game.offsetLeft + game.canvas.width / 2;

        // If the distance between new center and current center is > 0 and we have not panned to the min and max offset limits, keep panning
        if (Math.abs(newCenter - currentCenter) > 0 && game.offsetLeft <= maxOffset && game.offsetLeft >= minOffset) {
            // We will travel half the distance from the newCenter to currentCenter in each tick
            // This will allow easing
            var deltaX = (newCenter - currentCenter) / 2;

            // However if deltaX is really high, the screen will pan too fast, so if it is greater than maxSpeed
            if (Math.abs(deltaX) > game.maxSpeed) {
                // Limit delta x to game.maxSpeed (and keep the sign of deltaX)
                deltaX = game.maxSpeed * Math.sign(deltaX);
            }

            // And if we have almost reached the goal, just get to the ending in this turn
            if (Math.abs(deltaX) <= 1) {
                deltaX = (newCenter - currentCenter);
            }

            // Finally add the adjusted deltaX to offsetX so we move the screen by deltaX
            game.offsetLeft += deltaX;

            // And make sure we don't cross the minimum or maximum limits
            if (game.offsetLeft <= minOffset) {
                game.offsetLeft = minOffset;

                // Let calling function know that we have panned as close as possible to the newCenter
                return true;
            } else if (game.offsetLeft >= maxOffset) {
                game.offsetLeft = maxOffset;

                // Let calling function know that we have panned as close as possible to the newCenter
                return true;
            }

        } else {
            // Let calling function know that we have panned as close as possible to the newCenter
            return true;
        }
    },

    handleGameLogic: function() {
        if (game.mode === "intro") {
            if (game.panTo(700)) {
                game.mode = "load-next-hero";
            }
        }

        if (game.mode === "wait-for-firing") {
            if (mouse.dragging) {
                game.panTo(mouse.x + game.offsetLeft);
            } else {
                game.panTo(game.slingshotX);
            }
        }

        if (game.mode === "load-next-hero") {
            // First count the heroes and villains and populate their respective arrays
            // Check if any villains are alive, if not, end the level (success)
            // Check if there are any more heroes left to load, if not end the level (failure)
            // Load the hero and set mode to wait-for-firing
            game.mode = "wait-for-firing";
        }

        if (game.mode === "firing") {
            // If the mouse button is down, allow the hero to be dragged around and aimed
            // If not, fire the hero into the air
        }

        if (game.mode === "fired") {
            // Pan to the location of the current hero as he flies
            //Wait till the hero stops moving or is out of bounds
        }


        if (game.mode === "level-success" || game.mode === "level-failure") {
            // First pan all the way back to the left
            // Then show the game as ended and show the ending screen
        }

    },

    animate: function() {

        // Handle panning, game states and control flow
        game.handleGameLogic();

        // Draw the background with parallax scrolling
        // First draw the background image, offset by a fraction of the offsetLeft distance (1/4)
        // The bigger the fraction, the closer the background appears to be
        game.context.drawImage(game.currentLevel.backgroundImage, game.offsetLeft / 4, 0, game.canvas.width, game.canvas.height, 0, 0, game.canvas.width, game.canvas.height);
        // Then draw the foreground image, offset by the entire offsetLeft distance
        game.context.drawImage(game.currentLevel.foregroundImage, game.offsetLeft, 0, game.canvas.width, game.canvas.height, 0, 0, game.canvas.width, game.canvas.height);


        // Draw the base of the slingshot, offset by the entire offsetLeft distance
        game.context.drawImage(game.slingshotImage, game.slingshotX - game.offsetLeft, game.slingshotY);

        // Draw the front of the slingshot, offset by the entire offsetLeft distance
        game.context.drawImage(game.slingshotFrontImage, game.slingshotX - game.offsetLeft, game.slingshotY);

        if (!game.ended) {
            game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
        }
    },
    loadSounds: function(onload) {
        game.backgroundMusic = loader.loadSound("audio/gurdonark-kindergarten");

        game.slingshotReleasedSound = loader.loadSound("audio/released");
        game.bounceSound = loader.loadSound("audio/bounce");
        game.breakSound = {
            "glass": loader.loadSound("audio/glassbreak"),
            "wood": loader.loadSound("audio/woodbreak")
        };

        loader.onload = onload;
    },

};

var levels = {
    // Level data
    data: [{   // First level
        foreground: "desert-foreground",
        background: "clouds-background",
        entities: [
          // The ground
          { type: "ground", name: "dirt", x: 500, y: 440, width: 1000, height: 20, isStatic: true },
          // The slingshot wooden frame
          { type: "ground", name: "wood", x: 190, y: 390, width: 30, height: 80, isStatic: true },

          { type: "block", name: "wood", x: 500, y: 380, angle: 90, width: 100, height: 25 },
          { type: "block", name: "glass", x: 500, y: 280, angle: 90, width: 100, height: 25 },
          { type: "villain", name: "burger", x: 500, y: 205, calories: 590 },

          { type: "block", name: "wood", x: 800, y: 380, angle: 90, width: 100, height: 25 },
          { type: "block", name: "glass", x: 800, y: 280, angle: 90, width: 100, height: 25 },
          { type: "villain", name: "fries", x: 800, y: 205, calories: 420 },

          { type: "hero", name: "orange", x: 80, y: 405 },
          { type: "hero", name: "apple", x: 140, y: 405 }
        ]
    }, {   // Second level
        foreground: "desert-foreground",
        background: "clouds-background",
        entities: [
          {type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
          {type:"ground", name:"wood", x:180,y:390,width:40,height:80,isStatic:true},
          {type:"block", name:"wood", x:820,y:375,angle:90,width:100,height:25},
          {type:"block", name:"wood", x:720,y:375,angle:90,width:100,height:25},
          {type:"block", name:"wood", x:620,y:375,angle:90,width:100,height:25},
          {type:"block", name:"glass", x:670,y:310,width:100,height:25},
          {type:"block", name:"glass", x:770,y:310,width:100,height:25},
          {type:"block", name:"glass", x:670,y:248,angle:90,width:100,height:25},
          {type:"block", name:"glass", x:770,y:248,angle:90,width:100,height:25},
          {type:"block", name:"wood", x:720,y:180,width:100,height:25},
          {type:"villain", name:"burger",x:715,y:160,calories:590},
          {type:"villain", name:"fries",x:670,y:400,calories:420},
          {type:"villain", name:"sodacan",x:765,y:395,calories:150},
          {type:"hero", name:"strawberry",x:40,y:420},
          {type:"hero", name:"orange",x:90,y:410},
          {type:"hero", name:"apple",x:150,y:410}
        ]
    }],

    // Initialize level selection screen
    init: function() {
        var levelSelectScreen = document.getElementById("levelselectscreen");

        // An event handler to call
        var buttonClickHandler = function() {
            game.hideScreen("levelselectscreen");

            // Level label values are 1, 2. Levels are 0, 1
            levels.load(this.value - 1);
        };


        for (let i = 0; i < levels.data.length; i++) {
            var button = document.createElement("input");

            button.type = "button";
            button.value = (i + 1); // Level labels are 1, 2
            button.addEventListener("click", buttonClickHandler);

            levelSelectScreen.appendChild(button);
        }

    },

    // Load all data and images for a specific level
    load: function(number) {
        // Initialize Box2D world whenever a level is loaded
        box2d.init();

        // Declare a new currentLevel object
        game.currentLevel = { number: number, hero: [] };
        game.score = 0;

        document.getElementById("score").innerHTML = "Score: " + game.score;
        var level = levels.data[number];

        // Load the background, foreground, and slingshot images
        game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/" + level.background + ".png");
        game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/" + level.foreground + ".png");
        game.slingshotImage = loader.loadImage("images/slingshot.png");
        game.slingshotFrontImage = loader.loadImage("images/slingshot-front.png");

        // Load all the entities
        for (let i = level.entities.length - 1; i >= 0; i--) {
            var entity = level.entities[i];

            entities.create(entity);
        }

        // Call game.start() once the assets have loaded
        loader.onload = game.start;

    }
};

var loader = {
    loaded: true,
    loadedCount: 0, // Assets that have been loaded so far
    totalCount: 0, // Total number of assets that need loading

    init: function() {
        // check for sound support
        var mp3Support, oggSupport;
        var audio = document.createElement("audio");

        if (audio.canPlayType) {
               // Currently canPlayType() returns:  "", "maybe" or "probably"
            mp3Support = "" !== audio.canPlayType("audio/mpeg");
            oggSupport = "" !== audio.canPlayType("audio/ogg; codecs=\"vorbis\"");
        } else {
            // The audio tag is not supported
            mp3Support = false;
            oggSupport = false;
        }

        // Check for ogg, then mp3, and finally set soundFileExtn to undefined
        loader.soundFileExtn = oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
    },

    loadImage: function(url) {
        this.loaded = false;
        this.totalCount++;

        game.showScreen("loadingscreen");

        var image = new Image();

        image.addEventListener("load", loader.itemLoaded, false);
        image.src = url;

        return image;
    },

    soundFileExtn: ".ogg",

    loadSound: function(url) {
        this.loaded = false;
        this.totalCount++;

        game.showScreen("loadingscreen");

        var audio = new Audio();

        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        audio.src = url + loader.soundFileExtn;

        return audio;
    },

    itemLoaded: function(ev) {
        // Stop listening for event type (load or canplaythrough) for this item now that it has been loaded
        ev.target.removeEventListener(ev.type, loader.itemLoaded, false);

        loader.loadedCount++;

        document.getElementById("loadingmessage").innerHTML = "Loaded " + loader.loadedCount + " of " + loader.totalCount;

        if (loader.loadedCount === loader.totalCount) {
            // Loader has loaded completely..
            // Reset and clear the loader
            loader.loaded = true;
            loader.loadedCount = 0;
            loader.totalCount = 0;

            // Hide the loading screen
            game.hideScreen("loadingscreen");

            // and call the loader.onload method if it exists
            if (loader.onload) {
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
};

var mouse = {
    x: 0,
    y: 0,
    down: false,
    dragging: false,

    init: function() {
        var canvas = document.getElementById("gamecanvas");

        canvas.addEventListener("mousemove", mouse.mousemovehandler, false);
        canvas.addEventListener("mousedown", mouse.mousedownhandler, false);
        canvas.addEventListener("mouseup", mouse.mouseuphandler, false);
        canvas.addEventListener("mouseout", mouse.mouseuphandler, false);
    },

    mousemovehandler: function(ev) {
        var offset = game.canvas.getBoundingClientRect();

        mouse.x = ev.clientX - offset.left;
        mouse.y = ev.clientY - offset.top;

        if (mouse.down) {
            mouse.dragging = true;
        }

        ev.preventDefault();
    },

    mousedownhandler: function(ev) {
        mouse.down = true;

        ev.preventDefault();
    },

    mouseuphandler: function(ev) {
        mouse.down = false;
        mouse.dragging = false;

        ev.preventDefault();
    }
};

// Intialize game once page has fully loaded
window.addEventListener("load", function() {
    game.init();
});
