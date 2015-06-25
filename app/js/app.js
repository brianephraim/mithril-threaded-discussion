var mId = 0;

var appendDOM = function( dom ){
  return function( el, init ){
    if( !init ) el.innerHTML = ( dom );
  };
};

var dateToAgoString = function(datex) {//datex can be date obj or string/number seconds ago.
    if(typeof datex !== 'object'){
        datex = +datex;
        var seconds = datex;
        var dateNow = new Date();
        var dateSecondsAgo = new Date(dateNow.getTime() - seconds*1000);
        datex = dateSecondsAgo;
    }
    var strings = [];
    var delta = (Math.abs(new Date() - datex) / 1000);

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    if (days > 0) {
        strings.push(days + ' days,')
    }

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    if (hours > 0) {
        strings.push(hours + 'h')
    }

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    if (minutes > 0) {
        strings.push(minutes + 'm')
    }

    if (strings.length === 0) {
        strings.push(1 + 'm')
    }

    var result = strings.join(' ') + ' ago';
    return result;
};




var view2 = function(controller) {
    return m("html", [
        m("body", [
            m("input", {onchange: m.withAttr("value", controller.description), value: controller.description()}),
            m("button", {onclick: function(){controller.add()}}, "asdfasdfasdfas")
        ])
    ]);
};

//-=-=-=-=-=-=-=-=-=-=-=-


var discussionId = 0;
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
                    discussionId = responses[j].id > discussionId ? responses[j].id : discussionId;
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

var topicPageComp = {
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
            }
        };
    },
    view:function(controller) {

        var list = m.component(topicListComp, {parent: controller});

        return m("div", {class:['page topicPageComp'].join(' ')}, [
            m("div",{class:"pageHeader"},[
                m("input", {onchange: m.withAttr("value", controller.description), value: controller.description()}),
                m("button", {onclick: function(){controller.add()}}, "Add"),
            ]),
            m.component(topicListComp, controller),
            
            m("#container", {config: fadesIn}, [
                m("a[href='/foo']", {config: fadesOutPage}, "go to foo")
            ])
        ])
    }
};
var topicListComp = {
    controller: function(parentCtrl){
        var self = this;
        this.listx = parentCtrl.listx;
        this.description = parentCtrl.description;

        this.remove = function(event,item){
            m.redraw.strategy('all');//all,diff,none
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
        return m("div",{'class':'topicList'}, ctrl.listx().map(function(item, index){
            return [
                m('div',{'class':'topicContainer'},[
                    m('div',{'class':'topicHeader'},[
                        m("span", {
                            // 'id': item.mId + 'delete', //hack to override diffing fade out item splice bug.
                            onclick: function(e){
                                fadesOut(e,function(){
                                    ctrl.remove(e,item)
                                })
                            }
                        }, "delete ---- "),
                        m("span",item.topictitle)
                    ]),
                    m.component(responseListComp, item.responses),
                ])
            ]

        }))
    }
};



var responseListComp = {
    controller: function(responses){
        var self = this;
        this.listx = m.prop(responses);
    },
    view: function(ctrl) {
        return m("div", {class:'responseList'}, ctrl.listx().map(function(item, index){
            return m.component(responseContainerComp, item);
        }))
    }
};

var responseContainerComp = {
    controller:function(item){
        var self = this;
        this.item = item;
        this.showResponses = true;
        this.showHide = function(){
            self.showResponses = !self.showResponses;
        }
    },
    view: function(ctrl){

        var inner = [];
        inner.push(m.component(responseItemComp, ctrl))

        inner.push(
            m(
                'form',
                {
                    'class':'addResponseForm clearfix',
                    'config':function(el, isInitialized,context,mObj){
                        if(!isInitialized){
                            var $el = $(el);
                            var $textarea = $el.closest('form').find('textarea');
                            $el.on('submit',function(e){
                                e.preventDefault();
                                var inputValue = $textarea.val();
                                if(inputValue.length > 0){
                                    m.redraw.strategy('all');//all,diff,none
                                    ctrl.item.responses = ctrl.item.responses ? ctrl.item.responses : [];
                                    ctrl.item.responses.unshift({
                                        age:1,
                                        author:'me',
                                        id:++discussionId,
                                        parentid:ctrl.item.id,
                                        posttext: '<p>'+$textarea.val()+'</p>'
                                    })

                                    console.log(typeof $textarea.val())
                                    m.redraw(true)
                                    m.redraw.strategy('diff');
                                }
                            })

                            context.onunload = function() {
                                $el.remove();
                            }
                        }
                        console.log(isInitialized)
                    }
                },
                [
                    m('button',{'type':'submit','class':'addResponseSubmitButton'},'post'),
                    m('div',{'class':'inputWrap'},[
                        m('textarea',{
                            'class':'addResponseInput',
                            'placeholder':'add response',
                        })
                    ])
                ]
            )
        )

        if(ctrl.item.responses){
            inner.push(m( 'div', {
                'class':'showHide',
                'onclick':function(){
                    ctrl.showHide()
                }
            }, (ctrl.showResponses ? '[--] hide' : '[+] show')  + ' responses'))
        } else {
            inner.push(m( 'div', {'class':'showHide noResponses'}, 'no responses'))
        }


        if(ctrl.item.responses && ctrl.showResponses){
            inner.push(m.component(responseListComp, ctrl.item.responses));
        }

        return  m('div', {
            'class':[
                'responseContainer',
                'indent',
                'indent_'+ctrl.item.depth
            ].join(' ')
        },inner);
    }
};

var responseItemComp = {
    controller:function(parentCtrl){
        this.item = parentCtrl.item;
        this.parentCtrl = parentCtrl;
    },
    view: function(ctrl){
        var responseItem = [
            m('div',{'class':'responseHeader'},[
                m("span",{'class':'author'}, ' '+ctrl.item.author),
                m("span",{'class':'ago'}, ctrl.item.age+ ' '+dateToAgoString(ctrl.item.age))
            ]),
            m( 'div', {'class':'responseBody', config : appendDOM( ctrl.item.posttext ) } ),
            
        ];
        return m('div',{'class':['responseItem','responseItem_indent_'+ctrl.item.depth].join(' ')},responseItem)
    }
};




//initialize the application
$(function(){
    // m.mount(document.body, {controller:Controller, view: view});
    m.route.mode = "hash";
    m.route($('#app')[0], "/", {
        "/": (topicPageComp),
        // "/": slidingPage({controller: new Controller().controller, view: view}),
        // "/foo": slidingPage({controller:newController, view: view2}),
        // "/dashboard": slidingPage({controller:Controller, view: view}),
    });
    // m.route($('#app2')[0], "/", {
    //     "/foo": {controller:Controller, view: view2},
    // });
});
