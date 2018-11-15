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
                li.innerHTML = `
                    <figure class="remd_cover">
                        <div class="remd_imgWrapper">
                            <img src="${item.coverUrl || ''}" alt="" class="remd_img">
                            <div class="remd_praise">
                                <svg class="icon remd_erjiSvg" aria-hidden="true">
                                    <use xlink:href="#icon-erji"></use>
                                </svg>
                                100.5万
                            </div>
                        </div>
                        <figcaption class="remd_text">
                            ${item.menuName || ''}
                        </figcaption>
                    </figure>
                `
                li.setAttribute('data-menuId', item.id)
                li.setAttribute('data-ele', 'menu')
                li.classList.add('remd_menu')
                ul.appendChild(li)
            })
        }
    })

    let model = new Model({
        data: {
            menus: []
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'menu', type: 'click', fn: 'clickMenu'},
        ],
        init(){
            this.view.init()
            this.model.fetchAll('Playlist', 'menus').then(()=>{
                this.view.render(this.model.data)
            })
            this.bindEvents()
        },
        clickMenu(target){
            // 点击歌单，打开页面，歌单的id在请求中
            this.view.selectedId = target.getAttribute('data-menuId')
            window.location.href = `/src/playlist.html?menuId=${this.view.selectedId}`
        }
    })
    controller.init()
}