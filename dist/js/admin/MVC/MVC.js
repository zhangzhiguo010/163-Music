class View{
    constructor({...res}){
        Object.assign(this, res)
        this.init()
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
}

class Model{
    constructor({...res}){
        Object.assign(this, res)
    }
    // url: 'http://localhost:8888/uptoken'
    saveToQiniu(url, data){
        let {file, name} = data
        let putExtra = {fname: "",params: {},mimeType: [] || null}
        let config = {useCdnDomain: true,region: qiniu.region.z2}
        return axios.get(url).then((response)=>{
            let token  = response.data.token
            return qiniu.upload(file, name, token, putExtra, config)
        })
    }
    fetchFromLeanCloud(id){
        let query = new AV.Query(this.resourceName)
        return query.get(id).then((responseData)=>{
            Object.assign(this.data, {id:responseData.id}, responseData.attributes)
        })
    }
    batchFetchFromLeanCloud(){
        let query = new AV.Query(this.resourceName)
        return query.find().then((responseData)=>{
            responseData.map((item)=>{
                this.data.songs.push(Object.assign({}, {id: item.id, }, item.attributes))
            })
        })
    }
    saveToLeanCloud(data){
        let Object = AV.Object.extend(this.resourceName)
        let object = new Object()
        return object.save(data).then((responseData)=>{
            let createdAt = this.handleDate(responseData.createdAt)
            let updatedAt = this.handleDate(responseData.updatedAt)
            this.data.songName = responseData.attributes.songName
            this.data.singer = responseData.attributes.singer
            this.data.songUrl = responseData.attributes.songUrl
            this.data.coverUrl = responseData.attributes.coverUrl
            this.data.lyrics = responseData.attributes.lyrics
            this.data.createdAt = createdAt
            this.data.updatedAt = updatedAt
            this.data.playList = responseData.attributes.playList
            // Object.assign(this.data, responseData.attributes, {createdAt: createdAt, updatedAt: updatedAt})
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
}

class Controller{
    constructor({...res}){
        Object.assign(this, res)
        this.bindEvents()
        this.bindEventHub()
        this.bindProxy()
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
                            Object.assign(this.model.data, {name: name, url: url})
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
                    this.view.render(this.model.data)
                })
            }
        })
        this.saveToLeanCloud_proxy = new Proxy(this.model.saveToLeanCloud, {
            apply: (target,thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then(()=>{
                    this.view.render(this.model.data)
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

    }
    bindEventHub(){
        this.eventHub.map((item)=>{
            window.eventHub.listen(item.type, (data)=>{
                this[item.fn].call(this, data)
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