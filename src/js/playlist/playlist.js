{
    let view = new View2({
        el: '.menu',
        template: `
            <section class="menu_details"></section>
            <section class="menu_songList"></section>
        `,
        render(){

        }
    })
    let model = new Model2({
        data: {}
    })
    let controller = new Controller2({
        view: view,
        model: model,
        init(){
            this.view.init()
            this.createScript()
            this.getMenuId().then((menuId)=>{
                this.getMenuData(menuId).then(()=>{
                    window.eventHub.trigger('uploadMenu', {menuData: this.model.data})
                })
                
            })
            
        },
        getMenuId(){
            return new Promise((resolve)=>{
                let searchStr = window.location.search
                if(searchStr.indexOf('?') !== -1){
                    searchStr = searchStr.substring(1)
                }
                let searchArr = searchStr.split('&').filter((v=>v))
                for(let i=0; i<searchArr.length; i++){
                    let key = searchArr[i].split('=')[0]
                    if(key === 'menuId'){
                        let menuId = searchArr[i].split('=')[1]
                        resolve(menuId)
                    }
                    break
                }
            })
        },
        getMenuData(menuId){
            let menuStorage = new AV.Query('Playlist')
            return menuStorage.get(menuId).then((responseData)=>{
                this.model.data = {
                    menuId: responseData.id,
                    menuName: responseData.attributes.menuName,
                    creator: responseData.attributes.creator,
                    coverUrl: responseData.attributes.coverUrl,
                    description: responseData.attributes.description
                }
            })
        },
        createScript(){
            let script1 = document.createElement('script')
            script1.src = '/src/js/playlist/plt_hed.js'
            document.body.appendChild(script1)
            let script2 = document.createElement('script')
            script2.src = '/src/js/playlist/plt_main.js'
            document.body.appendChild(script2)
        }





    })

    controller.init()
}