{
    let view = new View({
        el: 'nav',
        data: {
            selectedTab: 'page_remd'
        }
    })

    let model = new Model({})

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'tab', type: 'click', fn: 'clickTab'}
        ],
        init(){
            this.view.init()
            this.bindEvents()
        },
        clickTab(target){
            let tabName = target.getAttribute('data-tabName')
            // 发布事件
            window.eventHub.trigger('clickTab', {tabName: tabName})
            // 激活标签 
            let oldTab = this.view.data.selectedTab
            let newTab = tabName 
            if(oldTab !== newTab){
                this.view.toggleActive(`li[data-tabName=${oldTab}]`, 'deactive')
                this.view.toggleActive(`li[data-tabName=${newTab}]`, 'active')
                this.view.data.selectedTab = newTab
            }
        }
    })
    
    controller.init()
}