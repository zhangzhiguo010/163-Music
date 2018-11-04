class View2{
    constructor({...res}){
        Object.assign(this, res)
    }
    init(){
        this.o_el = document.querySelector(this.el)
        if(this.template){
            this.o_el.innerHTML = this.template
        }
    }
    toggleActive(selector, key){
        if(`${this.o_el}` === selector){
            if(key === 'active'){
                this.o_el.classList.add('active')
            }else if(key === 'deactive'){
                this.o_el.classList.remove('active')
            }
        }else{
            if(key === 'active'){
                this.o_el.querySelector(selector).classList.add('active')
            }else if(key === 'deactive'){
                this.o_el.querySelector(selector).classList.remove('active')
            }
        }
    }
    toggleActive2(selector, key){
        if(key === 'active'){
            document.querySelector(selector).classList.add('active')
        }else if(key === 'deactive'){
            document.querySelector(selector).classList.remove('active')
        }
    }
    toggleShowOrHidden(acceptTabName, tabName, selector){
        if(acceptTabName === tabName){
            document.querySelector(selector).classList.add('active')
        }else{
            document.querySelector(selector).classList.remove('active')
        }
    }
    clearUlOrOl(selector){
        let ele = document.querySelector(selector)
        for(let i=0; i< ele.childNodes.length; i++){
            ele.removeChild(ele.childNodes[i])
        }
        while(ele.hasChildNodes()){
            ele.removeChild(ele.firstChild)
        }
    }
    
}

class Model2{
    constructor({...res}){
        Object.assign(this, res)
    }
    // url: 'http://localhost:8888/uptoken'
    saveToQiniu(url, file){
        let name = file.name
        let putExtra = {fname: "",params: {},mimeType: [] || null}
        let config = {useCdnDomain: true,region: qiniu.region.z2}
        return axios.get(url).then((response)=>{
            let token  = response.data.token
            return qiniu.upload(file, name, token, putExtra, config)
        })
    }
    // 通过id值，查找某条数据
    fetchFromLeanCloud(storage, id){
        storage = new AV.Query(storage)
        return storage.get(id).then((responseData)=>{
            Object.assign(this.data, {id:responseData.id}, responseData.attributes)
        })
    }
    batchFetchFromLeanCloud(storage, localStorage){
        storage = new AV.Query(storage)
        return storage.find().then((responseData)=>{
            this.data[localStorage] = []
            responseData.map((item)=>{

                this.data[localStorage].push(Object.assign({}, {id: item.id, }, item.attributes))
            })
        })
    }
    saveToLeanCloud(data){
        let  Store = AV.Object.extend(this.resourceName)
        let store = new Store()
        return store.save(data).then((responseData)=>{
            let createdAt = this.handleDate(responseData.createdAt)
            let updatedAt = this.handleDate(responseData.updatedAt)
            Object.assign(this.data, {id: responseData.id}, {createdAt: createdAt, updatedAt: updatedAt},responseData.attributes)
        })
    }
    updateToLeanCloud(data){
        let object = AV.Object.createWithoutData(this.resourceName, this.data.id)
        for(let key in data){
            object.set(key, data[key])
        }
        return object.save().then((responseData)=>{
            Object.assign(this.data, {id:responseData.id}, responseData.attributes)
        })
    }
    handleDate(date){
        let year = date.getFullYear()
        let month = date.getMonth()+1
        let day = date.getDate()
        return `${year}.${month}.${day}`
    }
    // 新建歌曲和歌单，让歌曲指向歌单
    songPointToMenu(songStorage, menuStorage, songItem){
        songStorage = new AV.Object(songStorage)
        menuStorage = new AV.Object(menuStorage)
        songStorage.set('dependent', menuStorage)  
        return songStorage.save(songItem).then((responseData)=>{
            let createdAt = this.handleDate(responseData.createdAt)
            let updatedAt = this.handleDate(responseData.updatedAt)
            Object.assign(this.data, {id: responseData.id}, {createdAt: createdAt, updatedAt: updatedAt},responseData.attributes)
        });
    }
    // 新建歌曲，让歌曲指向已经存在的歌单
    songSaveToMenu(songStorage, menuStorage, songItem, munuId){
        songStorage = new AV.Object(songStorage)
        let menuItem = AV.Object.createWithoutData(menuStorage, '5baee50e0b6160006fce5b83')
        songStorage.set('dependent', menuItem)
        return songStorage.save(songItem).then((responseData)=>{
            let createdAt = this.handleDate(responseData.createdAt)
            let updatedAt = this.handleDate(responseData.updatedAt)
            Object.assign(this.data, {id: responseData.id}, {createdAt: createdAt, updatedAt: updatedAt},responseData.attributes)
        })
    }
    // 通过歌单找歌曲
    batchFetchFromSongMenu(songStorage, menuStorage, munuId, localStorage){
        let menuItem = AV.Object.createWithoutData(menuStorage, munuId)
        songStorage = new AV.Query(songStorage)
        songStorage.equalTo('dependent', menuItem)
        return songStorage.find().then((responseData)=>{
            this.data[localStorage] = []
            responseData.map((item)=>{
                this.data[localStorage].push(Object.assign({}, {id: item.id, }, item.attributes))
            })
        })
    }
    // 通过歌曲找歌单
    judgeMenu(songStorage, songId){
        let songItem = AV.Object.createWithoutData(songStorage, songId);
        return songItem.fetch({ include: ['dependent'] }).then((song)=>{
            let menuItem = song.get('dependent');
        });
    }
    // 新建仓库：let XX = new AV.Object('XX')
    // 查找仓库：let YY = AV.Object.extend('YY')
}

class Controller2{
    constructor({...res}){
        Object.assign(this, res)
    }
    bindProxy(){
        this.saveToQiniu_proxy = new Proxy(this.model.saveToQiniu, {
            apply: (target, thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then((obj)=>{
                    obj.subscribe({
                        next: (responseData)=>{
                            let loaded = `${Math.ceil(responseData.total.loaded/1000)}kb`
                            let size = `${Math.ceil(responseData.total.size/1000)}kb`
                            let percent = `${Math.floor(responseData.total.percent)}%`
                            Object.assign(this.view.data, {loaded:loaded, size:size, percent:percent})
                            // 此处responseData数据是页面展示所用的数据，存在view的data中
                            this.view.render(this.view.data)       
                        },
                        error: ()=>{
                            alert('上传出错，请刷新后重试！')
                        },
                        complete: (responseData)=>{
                            let name = responseData.key
                            let url = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(responseData.key)}`
                            // 此处responseData数据是数据库返回的数据，存在model的data中
                            if(this.view.data.fileType === 'song'){
                                Object.assign(this.model.data, {songName: name, songUrl: url})
                            }else if(this.view.data.fileType === 'cover'){
                                Object.assign(this.model.data, {coverName: name, coverUrl: url})
                            }
                            if(this.afterComplete){
                                this.afterComplete(responseData)
                            } 
                        }
                    })
                })
            }
        })
        this.fetchFromLeanCloud_proxy = new Proxy(this.model.fetchFromLeanCloud, {
            apply: (target,thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then(()=>{
                    this.view.render(this.model.data)
                })
            }
        })
        this.batchFetchFromLeanCloud_proxy = new Proxy(this.model.batchFetchFromLeanCloud, {
            apply: (target, thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then(()=>{
                    this.view.init()
                    this.view.render(this.model.data)
                })
            }
        })
        this.saveToLeanCloud_proxy = new Proxy(this.model.saveToLeanCloud, {
            apply: (target,thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then((xx)=>{
                    // this.view.render(this.model.data)
                })
            }
        })
        this.updateToLeanCloud_proxy = new Proxy(this.model.updateToLeanCloud, {
            apply: (target,thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then(()=>{
                    this.view.render(this.model.data)
                })
            }
        })
        this.batchFetchFromSongMenu_proxy = new Proxy(this.model.batchFetchFromSongMenu, {
            apply: (target, thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then(()=>{
                    // console.log(this.model.data.songsOfMenu)
                })
            }
        })

    }
    bindEventHub(){
        this.eventHub.map((item)=>{
            window.eventHub.listen(item.type, (obj, data)=>{
                this[item.fn].call(this, obj, data)
            })
        })
    }
    bindEvents(){
        this.events.map((item)=>{
            this.view.o_el.addEventListener(item.type, (ev)=>{
                if(item.type === 'submit'){
                    ev.preventDefault()
                }
                let target = ev.target
                while(target !== ev.currentTarget){
                    if(target.getAttribute('data-ele') === item.ele){
                        this[item.fn].call(this, target)
                        break
                    }
                    target = target.parentElement
                }
            }, false)
        })
    }
}