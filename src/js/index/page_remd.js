{
    let view = new View({
        el: 'main > #page_remd',
        template: `
            <section class="remdSongs"></section>
            <section class="fshSongs"></section>
            <section class="art"></section>
        `,
        toggleShowOrHidden(key){
            if(key === 'show'){
                this.o_el.classList.add('active')
            }else if(key === 'hidden'){
                this.o_el.classList.remove('active')
            }
        }
    })

    let model = new Model({})

    let controller = new Controller({
        view: view,
        model: model,
        eventHub: [
            {type: 'chooseTab', fn: 'afterTabChoose'}
        ],
        init(){
            this.view.init()
            this.view.toggleShowOrHidden('show')
            this.bindEventHub()
            this.loadModules()
        },
        loadModules(){
            this.loadModulesFun('script', './js/index/page_remd_remdSongs.js')
            this.loadModulesFun('script', './js/index/page_remd_fshSongs.js')
            this.loadModulesFun('script', './js/index/page_remd_art.js')
        },
        loadModulesFun(tab, url){
            let x = document.createElement(tab)
            x.src = url 
            document.body.appendChild(x)
        },
        afterTabChoose(data){
            if(data.tabName === 'page_remd'){
                this.view.toggleShowOrHidden('show')
            }else{
                this.view.toggleShowOrHidden('hidden')
            }
        }
    })
    controller.init()
}