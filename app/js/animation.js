//helper
var fadesOutPage = function(element, isInitialized, context) {
    if (!isInitialized) {
        element.onclick = function(e) {
            e.preventDefault();
            $.Velocity(document.getElementById("container"), {opacity: 0}, {
                complete: function() {
                    m.route(element.getAttribute("href"))
                }
            })
        }
    }
}


//view helpers
var fadesIn = function(element, isInitialized, context) {
    if (!isInitialized) {
        element.style.opacity = 0
        $.Velocity(element, {opacity: 1})
    }
}
var fadesOut = function(e,callback) {
    // return function(e) {
        //don't redraw yet
        m.redraw.strategy("none")

        $.Velocity(e.target, {opacity: 0}, {
            complete: function() {
                //now that the animation finished, redraw
                m.startComputation()
                callback()
                m.endComputation()
            }
        })
    // }
}

// Animation for sliding in. This is a bit basic, but you could do anything.
function slideIn( el, callback ){
    el.style.left       = '-100%';
    el.style.top        = '0';
    el.style.position   = 'fixed';
    el.style.transition = 'left .6s ease-in-out';

    setTimeout( function transit(){
        el.style.left = '0%';
    } );
    
    el.addEventListener( 'transitionend', callback, false );
}

// Slide out.
function slideOut( el, callback ){
    el.style.left       = '0%';
    el.style.top        = '0';
    el.style.position   = 'fixed';
    el.style.transition = 'left .6s ease-in-out';

    setTimeout( function transit(){
        el.style.left = '100%';
    } );

    // Remember to fire the callback when the animation is finished.
    el.addEventListener( 'transitionend', callback, false );
}

var slidingPage = animator( slideIn, slideOut );