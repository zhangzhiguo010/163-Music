{
    let view = new View({
        el: '.menuAddSong-inner',
        template:`
            <div class="amount-wrapper">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-suoyou"></use>
                </svg>
                <span class='sum'></span>
            </div>
            <div class="create-wrapper" data-ele="addSong">
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
                <div id="page_menuAddSong"></div>
            </div>
        `,
        render(data){
            this.o_el.querySelector('.sum').innerText = `所有歌曲(共 {${data.songs.length}曲} `
            let liArray = data.songs.map((item)=>{
                let li = document.createElement('li')
                li.innerHTML = `
                    <div class="coverImgWrapper">
                        <img src="${item.coverUrl || ''}" alt="封面">
                    </div>
                    <div>${item.songName}</div>
                    <div>${item.singer}</div>
                    <div>${item.menuName}</div>
                    <div class="congtrolTag">
                        <div data-ele="addSong">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-add"></use>
                            </svg>
                            <span>加入歌单</span>
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
                pageWrapper: '#page_menuAddSong',
                dataSource: liArray,
                dataSize: 10,
                callBack(newData, maxPageNumber){
                    let ul = this.o_el.querySelector('.item-wrapper')
                    this.clearUlOrOl(ul, [ul.firstElementChild])
                    newData.map((li)=>{
                        ul.appendChild(li) 
                    })
                }
            })
        }
    })

    let model = new Model({
        data: {
            menuId: '',    // 被点击添加歌曲按钮的那个歌单的id值
            songs: [],      //歌单中不存在的歌曲
            allSong: [],    //所有歌曲
            menuSong: []    // 歌单中歌曲
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'addSong', type: 'click', fn: 'handleAddSong'}
        ],
        eventHub: [
            {type: 'clickAddBtn', fn: 'listenMenuAddSong'},
            {type: 'selectTab', fn: 'listenSelectTab'}
        ],
        init(){
            this.view.init()
            this.bindEvents()
            this.bindEventHub()  
        },
        listenSelectTab(){
            this.view.toggleActive('.menuAddSong', 'deactive')
        },
        listenMenuAddSong(obj){
            this.model.data.id = obj.id
            this.view.toggleActive('.menuAddSong', 'active')
            this.model.fetchAll('Song', 'allSong').then(()=>{
                this.model.fetchSongFromMenu('Song', 'Playlist', this.model.data.id, 'menuSong').then(()=>{
                    this.removeRepet(this.model.data.allSong, this.model.data.menuSong).then((currentSongs)=>{
                        this.model.data.songs = currentSongs
                        this.view.render(this.model.data)
                    })
                })
            })
        },
        handleAddSong(target){
            this.model.changeSongPointMenu('Song', 'Playlist', this.fendLi(target), this.model.data.id)
        },
        fendLi(target){
            while(target.nodeName.toLowerCase() !== 'ul'){
                if(target.nodeName.toLowerCase() === 'li'){
                    return target.getAttribute('data-id')
                }
                target = target.parentElement
            }
        },
        removeRepet(bigArray, smallArray){   
            let currentArray = []
            return new Promise((resolve)=>{
                bigArray.map((bigItem, index)=>{
                    smallArray.map((smallItem)=>{
                        if(smallItem.id === bigItem.id){
                            bigArray[index] = ''
                        }
                    })
                })
                bigArray.map((item)=>{
                    if(item !== ''){
                        currentArray.push(item)
                    }
                })
                resolve(currentArray)
            })
        }
    })

    controller.init()
}
