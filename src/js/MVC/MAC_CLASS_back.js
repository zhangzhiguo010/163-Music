class View{
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
        if(key === 'active'){
            document.querySelector(selector).classList.add('active')
        }else if(key === 'deactive'){
            document.querySelector(selector).classList.remove('active')
        }
    }
    toggleShowOrHidden(name1, name2, selector){
        if(name1 === name2){
            document.querySelector(selector).classList.add('active')
        }else{
            document.querySelector(selector).classList.remove('active')
        }
    }
    clearUlOrOl(ul){
        let ele = document.querySelector(selector)
        for(let i=0; i< ele.childNodes.length; i++){
            ele.removeChild(ele.childNodes[i])
        }
        while(ele.hasChildNodes()){
            ele.removeChild(ele.firstChild)
        }
    }
}

class Model{
    constructor({...res}){
        Object.assign(this, res)
    }
    // 新建仓库，新建一条数据
    save(storeName, data){
        let  Store = AV.Object.extend(storeName)
        let store = new Store()
        return store.save(data).then((response)=>{
            console.log('MVC: 新建数据成功！')
            Object.assign(this.data, response.attributes, {id: response.id})
        })
    }
    // 删除一条指定id的数据
    delete(name, id){
        var storeItem = AV.Object.createWithoutData(name, id)
        return storeItem.destroy().then(
            (sucess)=>{alert('删除数据操作成功！')},
            (error)=>{alert('删除数据操作失败！')}
        )
    }
    // 更改一条指定id的数据
    change(name, id, data){
        let storeItem = AV.Object.createWithoutData(name, id)
        for(let key in data){
            storeItem.set(key, data[key])
        }
        return storeItem.save().then((response)=>{
            Object.assign(this.data, response.attributes, {id:response.id})
        })
    }
    // 得到一条指定id的数据
    fetch(name, id){
        let store = new AV.Query(name)
        return store.get(id).then((response)=>{
            Object.assign(this.data, response.attributes, {id:response.id})
        })
    }
    // 得到指定数据库的所有数据
    fetchAll(name, local){
        let store = new AV.Query(name)
        return store.find().then((response)=>{
            console.log('MVC这里')
            console.log(response)
            this.data[local] = []
            response.map((item)=>{
                this.data[local].push(Object.assign({}, item.attributes, {id: item.id}))
                // console.log(this.data[local])
            })
        })
    }
    // 新建歌曲和歌单，让歌曲指向歌单
    pointSongToMenu(songStorage, menuStorage, songItem){
        songStorage = new AV.Object(songStorage)
        menuStorage = new AV.Object(menuStorage)
        songStorage.set('dependent', menuStorage)  
        return songStorage.save(songItem).then((response)=>{
            Object.assign(this.data, response.attributes, {id: response.id})
        });
    }
    // 新建歌曲，让歌曲指向已经存在的歌单
    saveSongToMenu(songStorage, menuStorage, songItem, munuId){
        songStorage = new AV.Object(songStorage)
        let menuItem = AV.Object.createWithoutData(menuStorage, munuId)
        songStorage.set('dependent', menuItem)
        return songStorage.save(songItem).then((response)=>{
            Object.assign(this.data, response.attributes, {id: response.id})
        })
    }
    // 通过歌单找歌曲
    fetchSongFromMenu(songStorage, menuStorage, munuId, localStorage){
        let menuItem = AV.Object.createWithoutData(menuStorage, munuId)
        songStorage = new AV.Query(songStorage)
        songStorage.equalTo('dependent', menuItem)
        return songStorage.find().then((response)=>{
            this.data[localStorage] = []
            response.map((item)=>{
                this.data[localStorage].push(Object.assign({}, {id: item.id, }, item.attributes))
            })
        })
    }
    // 通过歌曲找歌单
    fetchMenuFromSong(songStorage, songId){
        let songItem = AV.Object.createWithoutData(songStorage, songId)
        return songItem.fetch({ include: ['dependent'] }).then((song)=>{
            let menuItem = song.get('dependent')
        });
    }
    // 关联查询，搜索框查询
    relationFetch(local, name, value, key1, key2){
        let songName = new AV.Query(name)
        let singger = new AV.Query(name)
        songName.contains(key1, value)
        singger.contains(key2, value)
        return AV.Query.or(songName, singger).find().then((response)=>{
            this.data[local] = []
            if(response.length === 0){
                return
            }else{
                response.map((item)=>{
                    this.data[local].push(Object.assign({}, item.attributes, {songId: item.id}))
                })
            }
        })
    }
    /*******************************  操作七牛云 *************************************************************/
    saveToQiNiu(data){
        let {file, name} = data
        let putExtra = {fname: "",params: {}}
        let config = {useCdnDomain: true,region: qiniu.region.z2}
        return axios.get(url).then((response)=>{
            let token  = response.data.token
            return qiniu.upload(file, name, token, putExtra, config)
        })
    }
}




class Controller{
    constructor({...res}){
        Object.assign(this, res)
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
                if(item.type === 'submit'){ ev.preventDefault() }
                let target = ev.target
                while(target !== ev.currentTarget){
                    if(target.getAttribute('data-ele') === item.ele){
                        this[item.fn].call(this, target, ev)
                        break
                    }
                    target = target.parentElement
                }
            }, false)
        })
    }
    // 得到想要的查询参数
    getUrlSearch(data){
        return new Promise((resolve)=>{
            let searchStr = window.location.search
            if(searchStr.indexOf('?') !== -1){
                searchStr = searchStr.substring(1)
            }
            let searchArr = searchStr.split('&').filter((v=>v))
            for(let i=0; i<searchArr.length; i++){
                let key = searchArr[i].split('=')[0]
                if(key === data){
                    let value = searchArr[i].split('=')[1]
                    resolve(value)
                }
                break
            }
        })
    }
    bindProxy(){
        this.saveToQiniu_proxy = new Proxy(this.model.saveToQiniu, {
            apply: (target, thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then((obj)=>{
                    obj.subscribe({
                        next: (response)=>{
                            let loaded = `${Math.ceil(response.total.loaded/1000)}kb`
                            let size = `${Math.ceil(response.total.size/1000)}kb`
                            let percent = `${Math.floor(response.total.percent)}%`
                            // 此处responseData数据是页面展示所用的数据，存在view的data中 
                            Object.assign(this.view.data, {loaded:loaded, size:size, percent:percent}) 
                        },
                        error: ()=>{
                            alert('上传出错，请刷新后重试！')
                        },
                        complete: (response)=>{
                            let name = response.key
                            let url = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(response.key)}`
                            // 此处responseData数据是数据库返回的数据，存在model的data中
                            Object.assign(this.model.data, {name: name, url: url})
                            if(this.completeSaveToQiNiu){
                                this.completeSaveToQiNiu(response)
                            } 
                        }
                    })
                })
            }
        })
        this.fetch_proxy = new Proxy(this.model.fetch, {
            apply: (target,thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then(()=>{
                    this.view.render(this.model.data)
                })
            }
        })
        this.fetchAll_proxy = new Proxy(this.model.fetchAll, {
            apply: (target, thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then(()=>{
                    this.view.render(this.model.data)
                })
            }
        })
        this.change_proxy = new Proxy(this.model.change, {
            apply: (target,thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then(()=>{
                    this.view.render(this.model.data)
                })
            }
        })
        this.fetchSongFromMenu_proxy = new Proxy(this.model.fetchSongFromMenu, {
            apply: (target, thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then(()=>{
                    this.view.render(this.model.data)
                })
            }
        })

    }
}