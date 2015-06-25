var mId = 0;


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


//-=-=-=-=-=-=-=-=-=-=-=-



var fetch = function(){
    return m.request({method: "GET", url: "discussion.json"})
    .then(function(response){
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
            // var str = JSON.stringify(topics, null, 2);
            // console.log(str);
            return topics;
        } else {
            return response;
        }
    });
};

var topicPage = {
    controller:function(){
        var self= this;
        this.description = m.prop('');
        this.listx = fetch();
        

        this.add = function(event,text){
            var description = text ? text : self.description();
            var list = self.listx();
            description = 'asdf'
            if (description) {
                list.push({topictitle: description});
                self.description("");
                // m.redraw(true)
                // m.startComputation()
                //     // callback()
                // m.endComputation()
            }
        };
    },
    view:function(controller) {

        var list = m.component(listComp, {parent: controller});

        return m("div", [
            m("input", {onchange: m.withAttr("value", controller.description), value: controller.description()}),
            m("button", {onclick: function(){controller.add()}}, "Add"),
            m("div",'---'),
            m.component(listComp, controller),
            m("div",'---'),
            
            m("#container", {config: fadesIn}, [
                m("a[href='/foo']", {config: fadesOutPage}, "go to foo")
            ])
        ])
    }
};

var listComp = {
    controller: function(parentCtrl){
        var self = this;
        this.listx = parentCtrl.listx;
        this.description = parentCtrl.description;

        this.remove = function(event,item){
            var list = self.listx();
            for(var i=0,l=list.length;i<l;i++){
                if(list[i] === item){
                    list.splice(i, 1);
                    break;
                }
            }
        };
    },
    view: function(ctrl) {
        console.log(ctrl.listx())
        return m("div", ctrl.listx().map(function(item, index){
            return [
                m('div',[
                    m("span", {
                        // 'id': item.mId + 'delete', //hack to override diffing fade out item splice bug.
                        onclick: function(e){
                            fadesOut(e,function(){
                                ctrl.remove(e,item)
                            })
                        }
                    }, "delete ---- "),
                    m("span",item.topictitle),
                    m("span",item.responses ? item.responses.length : '')
                ]),
                m.component(responsesComp, item.responses),
            ]

        }))
    }
};

var responsesComp = {
    controller: function(responses){
        var self = this;
        this.listx = m.prop(responses);
    },
    view: function(ctrl) {
        console.log(ctrl.listx())
        return m("div", ctrl.listx().map(function(item, index){
            console.log(
                item.age,
                item.author,
                item.posttext
            )
            var tabs = '';
            for(var i=0,l=item.depth;i<l;i++){
                tabs += '- '
            }

            var responseItem = [
                m("span",tabs+item.id),
            ];
            if(item.responses){
                responseItem.push(m.component(responsesComp, item.responses));
            }

            return [
                m('div',[
                    responseItem,
                ])
            ]

        }))
    }
};




//initialize the application
$(function(){
    // m.mount(document.body, {controller:Controller, view: view});
    m.route.mode = "hash";
    m.route($('#app')[0], "/", {
        "/": (topicPage),
        // "/": slidingPage({controller: new Controller().controller, view: view}),
        // "/foo": slidingPage({controller:newController, view: view2}),
        // "/dashboard": slidingPage({controller:Controller, view: view}),
    });
    // m.route($('#app2')[0], "/", {
    //     "/foo": {controller:Controller, view: view2},
    // });
});
