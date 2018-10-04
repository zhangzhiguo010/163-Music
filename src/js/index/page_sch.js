{
    let view = new View({
        el: 'main > #page_sch',
        template: `
            <form class="sch_form">
                <div class="sch_cover">
                    <input type="text" class="sch_input" data-ele="input">
                    <svg class="icon schIcon" aria-hidden="true">
                        <use xlink:href="#icon-sousuo"></use>
                    </svg>
                    <figure class="sch_close">
                        <svg class="icon closeIcon" aria-hidden="true">
                            <use xlink:href="#icon-shanchu"></use>
                        </svg>
                    </figure>
                </div>
            </form>
            <section class="sch_view">
                <h3></h3>
                <ul class="sch_result"></ul>
            </section>
        `,
        render(data){
            let ul = this.o_el.querySelector('ul')

            // 每次渲染之前都清空一下
            ul.innerHTML  = null

            data.songs.map((item)=>{
                let li = document.createElement('li')
                li.innerHTML = `
                    <a href="/src/song.html?${item.songId}" class="sch_link">
                        ${item.songName}
                        <svg class="icon schIcon" aria-hidden="true">
                            <use xlink:href="#icon-sousuo"></use>
                        </svg>
                    </a>
                `
                li.classList.add('sch_li')
                ul.appendChild(li)
            })   
            
        },
        toggleShowOrHidden(key){
            if(key === 'show'){
                this.o_el.classList.add('active')
            }else if(key === 'hidden'){
                this.o_el.classList.remove('active')
            }
        }
    })

    let model = new Model({
        data: {
            songs: []
        },
        query(data){
            let songName = new AV.Query('Song')
            songName.contains('songName', data)
            let singger = new AV.Query('Song')
            singger.contains('singer', data)
            return AV.Query.or(songName, singger).find().then((responseData)=>{
                if(!responseData.length){return}
                this.data.songs = []
                responseData.map((item)=>{
                    this.data.songs.push(Object.assign({}, item.attributes, {songId: item.id}))
                })
            })
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        // events: [
        //     {ele: 'input', type: 'input', fn: 'listenInput'}
        // ],
        eventHub: [
            {type: 'chooseTab', fn: 'afterTabChoose'}
        ],
        init(){
            this.view.init()
            this.bindEventHub()
            // this.bindEvents()
            this.listenInput()
        },
        afterTabChoose(data){
            if(data.tabName === 'page_sch'){
                this.view.toggleShowOrHidden('show')
            }else{
                this.view.toggleShowOrHidden('hidden')
            }
        },
        listenInput(target){
            // 没有搜索内容
            // 搜索提示隐藏
            // 有搜索内容
            // 搜索提示显示
            // 过300毫秒，搜索结果显示

            // 删除搜索框内容
            // 搜索提示紧跟着一个个消失，直到彻底隐藏
            // 搜索结果紧跟着变化，直到什么都没有

            this.view.o_el.querySelector('input').addEventListener('input', (ev)=>{
                let target = ev.target
                let h3 = this.view.o_el.querySelector('h3')
                let ul = this.view.o_el.querySelector('ul')
                if(!target.value){
                    console.log('没有搜索')
                    h3.classList.remove('active')
                    ul.classList.remove('active')
                    return 
                }
    
                h3.classList.add('active')
                ul.classList.add('active')
                h3.innerText = `搜索：${target.value}`

                let timer
                if(timer){window.clearTimeout(timer)}
                timer = setTimeout(()=>{
                    this.model.query(target.value).then(()=>{
                        console.log(this.model.data.songs)
                        this.view.render(this.model.data)
                    })
                }, 500)
            })
        }
    })

    controller.init()
}