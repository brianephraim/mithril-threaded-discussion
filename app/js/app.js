var mId = 0;


var discussion = m.request({method: "GET", url: "discussion.json"});
discussion.then(function(response){
    if(response && response.topics){
        var topics = response.topics;
        for(var i=0,l=topics.length;i<l;i++){
            var topic = topics[i];
            var responses = topic.responses ? topic.responses : [];
            var responseDict = {};
            for(var j=0,m=responses.length;j<m;j++){
                var response = responses[j];
                var id = response.id;
                responseDict[id] = response;
                var parentid = response.parentid;
                if(typeof responseDict[parentid] !== 'undefined'){
                    responseDict[parentid].responses = responseDict[parentid].responses ? responseDict[parentid].responses : [];
                    responseDict[parentid].responses.push(response);
                    responses.splice(j,1);
                    m--;
                    j--;
                }
            }
        }
        // console.log(topics)
        var str = JSON.stringify(topics, null, 2);
        console.log(str)
    }
    
})
console.log(discussion())

var Controller = function(){
    this.list = [];
    this.description = m.prop('');
    this.add(null,'aaa');
    this.add(null,'bbb');
};
Controller.prototype.add = function(event,text){
    var description = text ? text : this.description();
    if (description) {
        var newItem = new Item({description: description});
        this.list.push(newItem);
        this.description("");
    }
};
Controller.prototype.remove = function(event,item){
    for(var i=0,l=this.list.length;i<l;i++){
        if(this.list[i] === item){
            this.list.splice(i, 1);
            break;
        }
    }
};

var Item = function(data){
    this.mId = 'mId' + mId++;
    this.description = m.prop(data.description);
    this.done = m.prop(false);
};

var MyComponent = {
    controller: function(args) {
        return {greeting: args.message}
    },
    view: function(ctrl) {
        return m("h2", ctrl.greeting)
    }
};


var topicComponent = {
    controller: function(args) {
        return {greeting: args.message}
    },
    view: function(ctrl) {
        return m("h2", ctrl.greeting)
    }
}

//here's the view
var view = function(controller) {
    return m("div", [
        m.component(topicComponent, {message: "Hello"}),
        m.component(MyComponent, {message: "Hello"}),
        m("input", {onchange: m.withAttr("value", controller.description), value: controller.description()}),
        m("button", {onclick: function(){controller.add()}}, "Add"),
        m("table", [
            controller.list.map(function(item, index) {
                return m("tr", {config: fadesIn},[
                    m("td", [
                        m("input[type=checkbox]", {onclick: m.withAttr("checked", item.done), checked: item.done()})
                    ]),
                    m("td", {style: {textDecoration: item.done() ? "line-through" : "none"}}, item.description()),
                    m("td", {
                        'id': item.mId + 'delete', //hack to override diffing fade out item splice bug.
                        onclick: function(e){
                            fadesOut(e,function(){
                                controller.remove(e,item)
                            })
                        }
                    }, "delete"),
                ])
            })
        ]),
        m("#container", {config: fadesIn}, [
            m("a[href='/foo']", {config: fadesOutPage}, "go to foo")
        ])
    ])
};

var view2 = function(controller) {
    return m("html", [
        m("body", [
            m("input", {onchange: m.withAttr("value", controller.description), value: controller.description()}),
            m("button", {onclick: function(){controller.add()}}, "asdfasdfasdfas")
        ])
    ]);
};

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
        console.log('x')
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

//initialize the application
$(function(){
    // m.mount(document.body, {controller:Controller, view: view});
    m.route.mode = "hash";
    m.route($('#app')[0], "/", {
        "/": slidingPage({controller:Controller, view: view}),
        "/foo": slidingPage({controller:Controller, view: view2}),
        "/dashboard": slidingPage({controller:Controller, view: view}),
    });
    // m.route($('#app2')[0], "/", {
    //     "/foo": {controller:Controller, view: view2},
    // });
});
