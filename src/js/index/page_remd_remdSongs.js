{
    let view = new View({
        el: 'section.remdSongs',
        template: `
            <h2 class="sectionTitle">推荐歌单</h2>
            <ul></ul>
        `,
        render(data){
            data.menus.slice(0,6).map((item)=>{
                let ul = this.o_el.querySelector('ul')
                let li = document.createElement('li')
                let placeholder = ['coverUrl', 'menuName']
                placeholder.map((key)=>{
                    if(!item[key]){ item[key] = '' }
                })
                li.innerHTML = `
                    <figure class="remd_cover">
                        <div class="remd_imgWrapper">
                            <img src="${item.coverUrl}" alt="" class="remd_img">
                            <div class="remd_praise">
                                <svg class="icon remd_erjiSvg" aria-hidden="true">
                                    <use xlink:href="#icon-erji"></use>
                                </svg>
                                100.5万
                            </div>
                        </div>
                        <figcaption class="remd_text">
                            ${item.menuName}
                        </figcaption>
                    </figure>
                `
                li.setAttribute('data-menuId', item.menuId)
                li.setAttribute('data-ele', 'menu')
                li.classList.add('remd_menu')
                ul.appendChild(li)
            })
        }
    })

    let model = new Model({
        data: {
            menus: []
        },
        fetchAll(){
            let menuStorage = new AV.Query('Playlist')
            return menuStorage.find().then((responseData)=>{
                responseData.map((item)=>{
                    this.data.menus.push({
                        menuId: item.id,
                        menuName: item.attributes.menuName,
                        creator: item.attributes.creator,
                        description: item.attributes.description,
                        coverUrl: item.attributes.coverUrl
                    })
                })
            })
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'menu', type: 'click', fn: 'handleMenuClick'},
        ],
        init(){
            this.view.init()
            // 取所有歌单，生成index的歌单模块
            this.model.fetchAll().then(()=>{
                this.view.render(this.model.data)
            })
            this.bindEvents()
        },
        handleMenuClick(target){
            // 点击歌单，打开页面，歌单的id在请求中
            this.view.selectedId = target.getAttribute('data-menuId')
            window.location.href = `/src/playlist.html/?menuId=${this.view.selectedId}`
        }
    })
    controller.init()
}