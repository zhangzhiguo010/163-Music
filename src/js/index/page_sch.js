{
    let view = new View({
        el: 'main > #page_sch',
        template: `
            这里是index页面里的搜索
        `,
        toggleShowOrHidden(key){
            if(key === 'show'){
                this.o_el.classList.add('active')
            }else if(key === 'hidden'){
                this.o_el.classList.remove('active')
            }
        }
    })

    let model = new Model({})

    let controller = new Controller({
        view: view,
        model: model,
        eventHub: [
            {type: 'chooseTab', fn: 'afterTabChoose'}
        ],
        init(){
            this.view.init()
            this.bindEventHub()
        },
        afterTabChoose(data){
            if(data.tabName === 'page_sch'){
                this.view.toggleShowOrHidden('show')
            }else{
                this.view.toggleShowOrHidden('hidden')
            }
        }
    })

    controller.init()
}