{
    let view = new View({
        el: '.aside-inner',
        template: `
            <ul>
                <li name="catalogue" data-ele="li">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-mulu"></use>
                    </svg>
                    <span>目录</span>
                </li>
                <li name="tab_songList" data-ele="li">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-gequliebiao"></use>
                    </svg>
                    <span>歌曲列表</span> 
                </li>
                <li name="tab_newAndEdit" data-ele="li">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-xinjian_bianji"></use>
                    </svg>
                    <span>新建/编辑</span>
                </li>
                <li name="userManage" data-ele="li">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-yonghuguanli"></use>
                    </svg>
                    <span>用户管理</span>
                </li>
            </ul>
        `,
        toggleLiActive(key, name){
            let firstLiName = this.o_el.querySelector('ul').firstElementChild.getAttribute('name')
            if(key === 'active'){
                if(name !== firstLiName){
                    this.o_el.querySelector(`li[name=${name}]`).classList.add('active')
                }
            }else if(key === 'deactive'){
                this.o_el.querySelector(`li[name=${name}]`).classList.remove('active')
            }
        }
    })

    let model = new Model({
        data: { selectTabName: '' }
    })
    
    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'li', type: 'click', fn: 'activeAndTrigger'}
        ],
        eventHub: [],
        activeAndTrigger(target){
            let tabName = target.getAttribute('name')
            this.activateLi(tabName)
            window.eventHub.trigger('selectTab', {tabName: tabName})
        },
        activateLi(newTabName){
            let oldTabName = this.model.data.selectTabName
            if(oldTabName){
                if(oldTabName !== newTabName){
                    this.view.toggleLiActive('deactive', oldTabName)
                }
            }
            this.view.toggleLiActive('active', newTabName)
            this.model.data.selectTabName = newTabName
        }
    })
}
