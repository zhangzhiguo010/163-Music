{
    let view = new View({
        el: 'main > #page_remd',
        template: `
            <section class="remdSongs"></section>
            <section class="fshSongs"></section>
            <section class="art"></section>
        `
    })

    let model = new Model({})

    let controller = new Controller({
        view: view,
        model: model,
        eventHub: [
            {type: 'clickTab', fn: 'listenClickTab'}
        ],
        init(){
            this.view.init()
            this.loadModules().then(()=>{
                this.view.toggleActive('#page_remd', 'active')
            })
            this.bindEventHub()
        },
        listenClickTab(data){
            this.view.toggleShowOrHidden('page_remd', data.tabName, '#page_remd')
        },
        loadModules(){
            return new Promise((resolve)=>{
                this.loadModulesFun('script', './js/index/page_remd_remdSongs.js')
                this.loadModulesFun('script', './js/index/page_remd_fshSongs.js')
                this.loadModulesFun('script', './js/index/page_remd_art.js')
                resolve()
            })
        },
        loadModulesFun(tab, url){
            let ele = document.createElement(tab)
            ele.src = url 
            document.body.appendChild(ele)
        }
    })
    controller.init()
}