{
    let view = new View({
        el: 'main > #page_hot',
        templateLi: `
            <span class="songNumber">{songNumber}</span>
            <a class="songLink" href="#">
                <h3 class="songName">{songName}</h3>
                <p class="singer">
                    <svg class="icon songSq" aria-hidden="true">
                        <use xlink:href="#icon-sq"></use>
                    </svg>
                    {singer}
                </p>
                <svg class="icon songPlay" aria-hidden="true">
                    <use xlink:href="#icon-bofang"></use>
                </svg>
            </a>
        `,
        render(data){
            let ul = this.o_el.querySelector('.songsWrapper')
            this.createLi(data).then((allLi)=>{
                allLi.map((li)=>{
                    ul.appendChild(li)
                })
            })
        },
        createLi(data){
            return new Promise((resolve)=>{
                let placeholder = ['songName', 'singer']
                let allLi = data.songs.map((song, index)=>{
                    let newTemplate = this.templateLi
                    placeholder.map((item)=>{
                        newTemplate = newTemplate.replace(`{${item}}`, song[item])
                    })
                    newTemplate = newTemplate.replace('{songNumber}', `0${index+1}`)
                    let li = document.createElement('li')
                    li.innerHTML = newTemplate
                    li.setAttribute('data-id', song.id)
                    // 前三个li标签的需要标红
                    if(index<3){
                        li.setAttribute('class', 'ahead')
                    }
                    return li
                })
                resolve(allLi)
            })
        }
    })

    let model = new Model({
        resourceName: 'Song',
        data: {
            songs: []
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        eventHub: [
            {type: 'chooseTab', fn: 'afterTabChoose'}
        ],
        init(){
            this.view.init()
            this.bindEventHub()
            this.bindProxy()
            this.batchFetchFromLeanCloud_proxy()
        },
        afterTabChoose(data){
            if(data.tabName === 'page_fsh'){
                this.view.toggleActive(`${this.view.o_el}`, 'active')
            }else{
                this.view.toggleActive(`${this.view.o_el}`, 'deactive')
            }
        }
    })

    controller.init()
}