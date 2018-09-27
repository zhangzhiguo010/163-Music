{
    let view = new View({
        el: '.globalNav_inner',
        data: {
            selectedTab: 'page_remd'
        },
        template: `
            <ol>
                <li class="active" data-ele="glb_tab" data-tabName="page_remd">
                    <div class="glb_tab">
                        <span>推荐音乐</span>
                    </div>
                </li>
                <li data-ele="glb_tab" data-tabName="page_fsh">
                    <div class="glb_tab">
                        <span>热歌榜</span>
                    </div>
                </li>
                <li data-ele="glb_tab" data-tabName="page_sch">
                    <div class="glb_tab">
                        <span>搜索</span>
                    </div>
                </li>
            </ol>
        `
    })

    let model = new Model({})

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'glb_tab', type: 'click', fn: 'chooseTab'}
        ],
        init(){
            this.view.init()
            this.bindEvents()
        },
        chooseTab(target){
            let tabName = target.getAttribute('data-tabName')
            this.judgeTab(tabName)
            window.eventHub.trigger('chooseTab', {tabName: tabName})
        },
        judgeTab(tabName){
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