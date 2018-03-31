// Declare all the commonly used objects as variables for convenience
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

var world;
var scale = 30;

function init() {
  // Set up the Box2d world that will do most of the physics calculation
  var gravity = new b2Vec2(0,9.8); //declare gravity as 9.8 m/s^2 downward
  var allowSleep = true; //Allow objects that are at rest to fall asleep and be excluded from calculations
  world = new b2World(gravity,allowSleep);
}
