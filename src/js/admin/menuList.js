{
    let view = new View({
        el: '.menuList-inner',
        template:`
            <div class="amount-wrapper">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-suoyou"></use>
                </svg>
                <span class="sum"></span>
            </div>
            <div class="create-wrapper clearfix">
                <div class="createButton" data-ele="createButton">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-tianjia"></use>
                    </svg>
                    <span>添加歌单</span>
                </div>
            </div>
            <ul class="item-wrapper">
                <li>
                    <div></div>
                    <div>歌单名</div>
                    <div>创建者</div>
                    <div>描述</div>
                    <div>操作</div>
                </li>
            </ul>
            <div class="selectButton-wrapper">
                <span>ic</span>
                <span>全选</span>
            </div>
            <div class="deleteButton-wrpper">
                <span>删除</span>
            </div>
            <div class="page-wrapper">
                <div id="page_menuList"></div>
            </div>
        `,
        render(data){
            this.o_el.querySelector('.sum').innerText = `所有歌单(共 {${data.menus.length}个} `
            let liArray = data.menus.map((item)=>{
                let li = document.createElement('li')
                li.innerHTML = `
                    <div class="coverImgWrapper">
                        <img src="${item.coverUrl}" alt="封面">
                    </div>
                    <div class="menuName">${item.menuName}</div>
                    <div>${item.creator}</div>
                    <div class="description">${item.description}</div>
                    <div class="congtrolTag">
                        <div data-ele="checkBtn">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-chakan"></use>
                            </svg>
                            <span>查看</span>
                        </div>
                        <div data-ele="addBtn">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-add"></use>
                            </svg>
                            <span>添加</span>
                        </div>
                        <div data-ele="editBtn">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-bianji"></use>
                            </svg>
                            <span>编辑</span>
                        </div>
                        <div data-ele="removeBtn">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-dustbin"></use>
                            </svg>
                            <span>删除</span>
                        </div>
                    </div> 
                `
                li.setAttribute('data-id', item.id)
                li.classList.add('autoCreateSongLi')
                return li
            })
            pagination.call(this, {
                pageWrapper: '#page_menuList',
                dataSource: liArray,
                dataSize: 10,
                callBack(newData, maxPageNumber){
                    let ul = this.o_el.querySelector('ul[class=item-wrapper]')
                    this.clearUlOrOl(ul, [ul.firstElementChild])
                    newData.map((li)=>{
                        ul.appendChild(li)
                    })
                }
            })
        },
    })

    let model = new Model({
        data: {
            menus: [],          // 它装的是所有歌单
            songsOfMenu: [],    // 它装的是某个歌单中的歌曲
        },
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'addBtn', type: 'click', fn: 'clickAddBtn'},
            {ele: 'removeBtn', type: 'click', fn: 'clickRemoveBtn'},
            {ele: 'editBtn', type: 'click', fn: 'clickEditBtn'},
            {ele: 'checkBtn', type: 'click', fn: 'clickCheckBtn'},
        ],
        eventHub: [
            {type: 'selectTab', fn: 'listenSelectTab'},
            {type: 'afterNewMenu', fn: 'afterNewMenu'},
            {type: 'afterEditMenu', fn: 'afterEditMenu'},
        ],
        init(){
            this.view.init()
            this.bindEvents()
            this.bindEventHub()  
        },
        listenSelectTab(data){
            this.view.toggleShowOrHidden(data.tabName, 'tab_menuList', '.menuList')
            this.model.fetchAll('Playlist', 'menus').then(()=>{
                this.view.render(this.model.data)                
            })
        },
        afterNewMenu(data){
            this.view.toggleActive('.menuList', 'active')
            this.model.data.menus.push(data)
            this.view.render(this.model.data)
        },
        afterEditMenu(data){
            this.view.toggleActive('.menuList', 'active')
            this.model.data.menus.map((item)=>{
                if(item.id === data.id){
                    Object.assign(item, data)
                }
            })
            this.view.render(this.model.data)
        },
        clickEditBtn(target){
            let id = this.fendLi(target)
            window.eventHub.trigger('editMenu', {id: id})
            this.view.toggleActive('.menuList', 'deactive')
        },
        clickCheckBtn(target){
            let id = this.fendLi(target)
            window.eventHub.trigger('checkMenu', {id: id})
            this.view.toggleActive('.menuList', 'deactive')
        },
        clickAddBtn(target){
            let id = this.fendLi(target)
            window.eventHub.trigger('clickAddBtn', {id: id})
            this.view.toggleActive('.menuList', 'deactive')
        },
        fendLi(target){
            while(target.nodeName.toLowerCase() !== 'ul'){
                if(target.nodeName.toLowerCase() === 'li'){
                    return target.getAttribute('data-id')
                }
                target = target.parentElement
            }
        }
    })

    controller.init()
}