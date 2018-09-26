{
    let view = {
        el: '.aside-inner',
        template:`
            <ul>
                <li name="catalogue">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-mulu"></use>
                    </svg>
                    <span>目录</span>
                </li>
                <li name="tab_songList">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-gequliebiao"></use>
                    </svg>
                    <span>歌曲列表</span> 
                </li>
                <li name="tab_newAndEdit">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-xinjian_bianji"></use>
                    </svg>
                    <span>新建/编辑</span>
                </li>
                <li name="userManage">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-yonghuguanli"></use>
                    </svg>
                    <span>用户管理</span>
                </li>
            </ul>
        `,
        render(){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
        },
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
    }
    let model = {
        data: {
            selectTabName: ''
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render()
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents(){
            this.view.o_el.addEventListener('click', (ev)=>{
                // 选中标签，此标签被激活，并发送标签被选中的事件
                this.activeLiAndSendEvent(ev)
            })
        },
        bindEventHub(){},
        activeLiAndSendEvent(ev){
            let target = ev.target
            while(target !== ev.currentTarget){
                if(target.nodeName.toLowerCase() === 'li'){
                    let tabName = target.getAttribute('name')
                    // 激活被点击的li
                    this.activateLi(tabName)
                    // 发布事件：目录中有标签被选择
                    window.eventHub.trigger('selectTab', {tabName: tabName})
                    break
                }
                target = target.parentNode
            }
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
    }

    controller.init(view, model)
}