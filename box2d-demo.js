// Declare all the commonly used objects as variables for convenience
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

var world;
var scale = 30;
var timeStep = 1/60;
//As per the Box2d manual, the suggested iteration count for Box2D is 8 for velocity and 3 for position.
var velocityIterations = 8;
var positionIterations = 3;

function init() {
  // Set up the Box2d world that will do most of the physics calculation
  var gravity = new b2Vec2(0,9.8); //declare gravity as 9.8 m/s^2 downward
  var allowSleep = true; //Allow objects that are at rest to fall asleep and be excluded from calculations
  world = new b2World(gravity,allowSleep);

  createBox();

  createSimplePolygonBody(500,100);
  createSimplePolygonBody(140,100);
  createSimplePolygonBody(320,280);

  createSpecialBody();

  listenForContact();

  setupDebugDraw();

  // Start the Box2D animation loop
  animate();
}

function listenForContact() {
    var listener = new Box2D.Dynamics.b2ContactListener;

    listener.PostSolve = function(contact, impulse) {
        var body1 = contact.GetFixtureA().GetBody();
        var body2 = contact.GetFixtureB().GetBody();

        // If either of the bodies is the special body, reduce its life
        if (body1 == specialBody || body2 == specialBody) {
            var impulseAlongNormal = impulse.normalImpulses[0];

            specialBody.GetUserData().life -= 1;
            console.log("The special body was in a collision with impulse", impulseAlongNormal, "and its life has now become ", specialBody.GetUserData().life);
        }
    };
    world.SetContactListener(listener);
}

function drawSpecialBody() {
    // Get body position and angle
    var position = specialBody.GetPosition();
    var angle = specialBody.GetAngle();

    // Translate and rotate axis to body position and angle
    context.translate(position.x * scale, position.y * scale);
    context.rotate(angle);

    // Draw a filled circular face
    life = specialBody.GetUserData().life;
    context.fillStyle = "rgb(" + life + "," + (256-life) + ",0)";
    context.beginPath();
    context.arc(0, 0, 30, 0, 2 * Math.PI, false);
    context.fill();

    // Draw two rectangular eyes
    context.fillStyle = "rgb(255, 255, 255)";
    context.fillRect(-15, -15, 10, 5);
    context.fillRect(5, -15, 10, 5);

    // Draw an upward or downward arc for a smile depending on life
    context.strokeStyle = "rgb(255, 255, 255)";
    context.beginPath();
    if (specialBody.GetUserData().life > 100) {
        context.arc(0, 0, 10, Math.PI, 2 * Math.PI, true);
    } else {
        context.arc(0, 10, 10, Math.PI, 2 * Math.PI, false);
    }
    context.stroke();

    // Translate and rotate axis back to original position and angle
    context.rotate(-angle);
    context.translate(-position.x * scale, -position.y * scale);
}

function createBox(){
  createFloor(0);
  createFloor(480);
  createWall(0);
  createWall(640);
}

function createFloor(posY) {
  //A body definition holds all the data needed to construct a rigid body.
  var bodyDef = new b2BodyDef;

  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.x = 640 / 2 / scale;
  bodyDef.position.y = posY / scale;

  // A fixture is used to attach a shape to a body for collision detection.
  // A fixture definition is used to create a fixture
  var fixtureDef = new b2FixtureDef;

  fixtureDef.density = 1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.2;

  fixtureDef.shape = new b2PolygonShape;
  fixtureDef.shape.SetAsBox(320 / scale, 10 / scale); //640 pixels wide and 20 pixels tall

  var body = world.CreateBody(bodyDef);
  var fixture = body.CreateFixture(fixtureDef);
}

function createWall(posX) {
  //A body definition holds all the data needed to construct a rigid body.
  var bodyDef = new b2BodyDef;

  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.x = posX / scale;
  bodyDef.position.y = 240 / scale;

  // A fixture is used to attach a shape to a body for collision detection.
  // A fixture definition is used to create a fixture
  var fixtureDef = new b2FixtureDef;

  fixtureDef.density = 1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.2;

  fixtureDef.shape = new b2PolygonShape;
  fixtureDef.shape.SetAsBox(10 / scale, 230 / scale); //640 pixels wide and 20 pixels tall

  var body = world.CreateBody(bodyDef);
  var fixture = body.CreateFixture(fixtureDef);
}

function createSimplePolygonBody(posX, posY) {
  var bodyDef = new b2BodyDef;

  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.x = posX / scale;
  bodyDef.position.y = posY / scale;

  var fixtureDef = new b2FixtureDef;

  fixtureDef.density = 1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.6;

  fixtureDef.shape = new b2PolygonShape;
  // Create an array of b2Vec2 points in clockwise direction
  var points = [
      new b2Vec2(0, 0),
      new b2Vec2(40 / scale, 50 / scale),
      new b2Vec2(50 / scale, 100 / scale),
      new b2Vec2(0, 120 / scale),
      new b2Vec2(-50 / scale, 100 / scale),
      new b2Vec2(-40 / scale, 50 / scale),
  ];

  // Use SetAsArray to define the shape using the points array
  fixtureDef.shape.SetAsArray(points, points.length);

  var body = world.CreateBody(bodyDef);

  var fixture = body.CreateFixture(fixtureDef);
}

function createSpecialBody() {
    var bodyDef = new b2BodyDef;

    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = 450 / scale;
    bodyDef.position.y = 100 / scale;

    specialBody = world.CreateBody(bodyDef);
    specialBody.SetUserData({ name: "special", life: 256 });

    //Create a fixture to attach a circular shape to the body
    var fixtureDef = new b2FixtureDef;

    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 1.1;

    fixtureDef.shape = new b2CircleShape(30 / scale);

    var fixture = specialBody.CreateFixture(fixtureDef);
}

function animate() {
    world.Step(timeStep, velocityIterations, positionIterations);
    world.ClearForces();
    world.DrawDebugData();
    // Custom Drawing
    if (specialBody) {
        drawSpecialBody();
    }

    //Kill Special Body if Dead
    if (specialBody && specialBody.GetUserData().life <= 0) {
        world.DestroyBody(specialBody);
        specialBody = undefined;
        console.log("The special body was destroyed");
    }

    setTimeout(animate, timeStep);
}

function setupDebugDraw() {
    context = document.getElementById("canvas").getContext("2d");

    var debugDraw = new b2DebugDraw();

    // Use this canvas context for drawing the debugging screen
    debugDraw.SetSprite(context);
    // Set the scale
    debugDraw.SetDrawScale(scale);
    // Fill boxes with an alpha transparency of 0.3
    debugDraw.SetFillAlpha(0.3);
    // Draw lines with a thickness of 1
    debugDraw.SetLineThickness(1.0);
    // Display all shapes and joints
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

    // Start using debug draw in our world
    world.SetDebugDraw(debugDraw);
}
