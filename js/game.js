var game = {
  // Start initializing objects, preloading assets and display start screen
  init: function(){
    // Hide all game layers and display the start screen
    $('.gamelayer').hide();
    $('#gamestartscreen').show();
    //Get handler for game canvas and context
    game.canvas = $('#gamecanvas')[0];
    game.context = game.canvas.getContext('2d');
  },
}

// Intialize game once page has fully loaded
window.addEventListener("load", function() {
    game.init();
});
