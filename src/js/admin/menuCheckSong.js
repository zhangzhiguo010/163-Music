{
    let view = new View({
        el: '.menuCheckSong-inner',
        template:`
            <div class="amount-wrapper">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-suoyou"></use>
                </svg>
                <span class='sum'></span>
            </div>
            <div class="create-wrapper clearfix">
                <div class="createButton" data-ele="createButton">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-tianjia"></use>
                    </svg>
                    <span>添加歌曲</span>
                </div>
            </div>
            <ul class="item-wrapper">
                <li>
                    <div></div>
                    <div>歌名</div>
                    <div>歌手</div>
                    <div>所属歌单</div>
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
                <div id="page_menuCheckSong"></div>
            </div>
        `,
        render(data){
            this.o_el.querySelector('.sum').innerText = `所有歌曲(共 {${data.songs.length}曲} `
            let liArray = data.songs.map((item)=>{
                let li = document.createElement('li')
                li.innerHTML = `
                    <div class="coverImgWrapper">
                        <img src="${item.coverUrl}" alt="封面">
                    </div>
                    <div>${item.songName}</div>
                    <div>${item.singer}</div>
                    <div>${item.menuName}</div>
                    <div class="congtrolTag">
                        <div data-ele="removeSong">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-dustbin"></use>
                            </svg>
                            <span>删除</span>
                        </div>
                        <div>
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-pinglun"></use>
                            </svg>
                            <span>查看评论</span>
                        </div>
                    </div> 
                `
                li.setAttribute('data-id', item.id)
                li.classList.add('autoCreateSongLi')
                return li
            })
            pagination.call(this, {
                pageWrapper: '#page_menuCheckSong',
                dataSource: liArray,
                dataSize: 10,
                callBack(newData, maxPageNumber){
                    let ul = this.o_el.querySelector('ul[class=item-wrapper]')
                    this.clearUlOrOl(ul, [ul.firstElementChild])
                    newData.map((item)=>{
                        ul.appendChild(item)
                    })
                }
            })
        },
    })

    let model = new Model({
        data: {
            menuId: '',    // 被点击添加歌曲按钮的那个歌单的id值
            songs: []
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'removeSong', type: 'click', fn: 'handleRemoveSong'}
        ],
        eventHub: [
            {type: 'selectTab', fn: 'listenSelectTab'},
            {type: 'checkMenu', fn: 'listenCheckMenu'}
        ],
        init(){
            this.view.init()
            this.bindEvents()
            this.bindEventHub()  
        },
        listenSelectTab(){
            this.view.toggleActive('.menuCheckSong', 'deactive')
        },
        listenCheckMenu(obj){
            this.view.toggleActive('.menuCheckSong', 'active')
            this.model.fetchSongFromMenu('Song', 'Playlist', obj.id, 'songs').then(()=>{
                this.view.render(this.model.data)
            })
        },
        handleRemoveSong(target){
            console.log(this.model.data.songs)
            let songItem = AV.Object.createWithoutData('Song', this.fendLi(target))
            let menuItem = AV.Object.createWithoutData('Playlist', '5bb0ba970b6160006ad8592f')
            songItem.set('dependent', menuItem)
            songItem.save()
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
