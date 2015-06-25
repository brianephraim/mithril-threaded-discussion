var mId = 0;



var view2 = function(controller) {
    return m("html", [
        m("body", [
            m("input", {onchange: m.withAttr("value", controller.description), value: controller.description()}),
            m("button", {onclick: function(){controller.add()}}, "asdfasdfasdfas")
        ])
    ]);
};

var discussionService = (function(){
    var Service = function(){
        this.discussionId = 0;
        this.hasData = false;
        this.mProp = this.fetch();
    };
    Service.prototype.fetch = function(){
        var self = this;
        return m.request({method: "GET", url: "discussion.json"})
        .then(function(response){
            if(response && response.topics){
                var topics = response.topics;
                for(var i=0,l=topics.length;i<l;i++){
                    var topic = topics[i];
                    var responses = topic.responses ? topic.responses : [];
                    var responseDict = {};
                    for(var j=0,m=responses.length;j<m;j++){
                        self.discussionId = responses[j].id > self.discussionId ? responses[j].id : self.discussionId;
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
                this.hasData = true;
                return topics;
            } else {
                return response;
            }
        });
    };

    return new Service();
})();



var topicPageComp = {
    controller:function(){
        var self= this;
        this.description = m.prop('');
        this.listx = discussionService.mProp;
        

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
                                        id:++discussionService.discussionId,
                                        parentid:ctrl.item.id,
                                        posttext: '<p>'+$textarea.val()+'</p>',
                                        fresh:true
                                    })

                                    m.redraw(true)
                                    m.redraw.strategy('diff');
                                }
                            })

                            context.onunload = function() {
                                $el.remove();
                            }
                        }
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
            'config':function(el, isInitialized,context,mObj){
                var item = mObj.controllers[0].item;

                // only do animation on new items
                if(item.fresh){
                    delete item.fresh;

                    //get element dimensions without shifting layout
                    var $el = $(el);
                    var $parent = $el.parent();
                    $parent.css({
                        'position':'relative'
                    });
                    $el.css({
                        'opacity':0,
                        'position':'absolute',
                        'width':'100%',
                        '-webkit-box-sizing':'border-box',
                        '-moz-box-sizing':'border-box',
                        'box-sizing':'border-box'

                    });
                    var itemWidth = $el.outerWidth();
                    var itemHeight = $el.outerHeight();
                    
                    //get items beneath... nesting makes this complicated.
                    var $beneath = $el.parents();
                    $beneath = $beneath.nextAll();
                    $beneath = $beneath.add($el.nextAll())

                    //make sure dom manipulation is ready
                    setTimeout(function(){
                        // prep the animation                   
                        $beneath.css({
                            '-webkit-transform':'translate3d(0, '+ (-itemHeight) +'px, 0)',
                            '-moz-transform':'translate3d(0, '+ (-itemHeight) +'px, 0)',
                            '-ms-transform':'translate3d(0, '+ (-itemHeight) +'px, 0)',
                            'transform':'translate3d(0, '+ (-itemHeight) +'px, 0)'
                        })

                        // reset earlier styles
                        $el.css({
                            'opacity':'',
                            'position':'',
                            'width':'',
                            '-webkit-box-sizing':'',
                            '-moz-box-sizing':'',
                            'box-sizing':''
                        });
                        $parent.css({
                            'position':''
                        });

                        // do the animation
                        $beneath.velocity({
                            translateY:[0,-itemHeight]
                        },{
                            duration: 1500,
                            easing: "spring",
                            complete: function(){
                                // reset styles
                                $beneath.css({
                                    '-webkit-transform':'',
                                    '-moz-transform':'',
                                    '-ms-transform':'',
                                    'transform':'',
                                })
                            },
                        })
                    },0);
                }
            },
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
                m("span",{'class':'authorLabel'}, 'By: '),
                m("span",{'class':'author'}, ' '+ctrl.item.author),
                m("span",{'class':'ago'}, utility.toAgoString(ctrl.item.age))
            ]),
            m( 'div', {'class':'responseBody', config : utility.appendDOM( ctrl.item.posttext ) } ),
            
        ];
        return m('div',{'class':['responseItem','responseItem_indent_'+ctrl.item.depth].join(' ')},responseItem)
    }
};




//initialize the application
$(function(){
    m.mount(document.body, topicPageComp);
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
