{
    let view = new View2({
        data: {
            selectedTab: 'tab_songList'
        },
        el: '.aside-inner',
        template: `
            <ul>
                <li name="catalogue">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-mulu"></use>
                    </svg>
                    <span>目录</span>
                </li>
                <li name="tab_songList" data-ele="tab">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-gequliebiao"></use>
                    </svg>
                    <span>歌曲列表</span> 
                </li>
                <li name="tab_newAndEdit" data-ele="tab">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-xinjian_bianji"></use>
                    </svg>
                    <span>新建歌曲</span>
                </li>
                <li name="tab_menuList" data-ele="tab">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-yonghuguanli"></use>
                    </svg>
                    <span>歌单列表</span>
                </li>
                <li name="tab_newMenu" data-ele="tab">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-yonghuguanli"></use>
                    </svg>
                    <span>新建歌单</span>
                </li>
            </ul>
        `
    })

    let model = new Model2({})
    
    let controller = new Controller2({
        view: view,
        model: model,
        events: [
            {ele: 'tab', type: 'click', fn: 'handleClickTab'}
        ],
        eventHub: [

        ],
        init(){
            this.view.init()
            this.bindEvents()
            this.bindEventHub()
        },
        handleClickTab(target){
            let tabName = target.getAttribute('name')
            this.activateLi(tabName)
            window.eventHub.trigger('selectTab', {tabName: tabName})
        },
        activateLi(newTabName){
            let oldTabName = this.view.data.selectedTab
            if(oldTabName){
                if(oldTabName !== newTabName){
                    this.view.toggleActive(`li[name=${oldTabName}]`, 'deactive')
                }
            }
            this.view.toggleActive(`li[name=${newTabName}]`, 'active')
            this.view.data.selectedTab = newTabName
        }
    })

    controller.init()
}
