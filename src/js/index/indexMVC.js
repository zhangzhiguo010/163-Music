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
}

class Model{
    constructor({...res}){
        Object.assign(this, res)
    }
    // url: 'http://localhost:8888/uptoken'
    saveToQiniu(url, data, callBack){
        let {file, name} = data
        let putExtra = {fname: "",params: {},mimeType: [] || null}
        let config = {useCdnDomain: true,region: qiniu.region.z2}
        return axios.get(url).then((response)=>{
            let token  = response.data.token
            qiniu.upload(file, name, token, putExtra, config).subscribe({
                next: (responseData)=>{ if(this.nextFun){this.nextFun(responseData, callBack)} },
                error: (err)=>{ console.log(err) },
                complete: (responseData)=>{ if(this.completeFun){this.completeFun(responseData, callBack)}}
            })
        })
    }
    fetchFromLeanCloud(id){
        let query = new AV.Query(this.resourceName)
        return query.get(id).then((responseData)=>{
            this.afterFetch(responseData)
        })
    }
    batchFetchFromLeanCloud(){
        let query = new AV.Query(this.resourceName)
        return query.find()
    }
    saveToLeanCloud(data){
        // 新建仓库
        let Object = AV.Object.extend(this.resourceName)
        // 实例化仓库
        let object = new Object()
        return object.save(data).then((responseData)=>{
            this.afterSave(responseData)
        })
    }
    updateToLeanCloud(data){
        let object = AV.Object.createWithoutData(this.resourceName, this.data.id)
        for(let key in data){
            object.set(key, data[key])
        }
        return object.save().then((responseData)=>{
            this.afterUpdate(responseData)
        })
    }
}

class Controller{
    constructor({...res}){
        Object.assign(this, res)
    }
    bindProxy(){
        // 存值且刷新
        this.batchFetchFromLeanCloud_proxy = new Proxy(this.model.batchFetchFromLeanCloud, {
            apply: (target, thisthis, array)=>{
                return Reflect.apply(target, this.model, array).then((responseData)=>{
                    responseData.map((item)=>{
                        this.model.data.songs.push(Object.assign({}, {id: item.id, }, item.attributes))
                    })
                    this.view.render(this.model.data)
                })
            }
        })
        // 只刷新
        this.fetchFromLeanCloud_proxy = new Proxy(this.model.fetchFromLeanCloud, {
            apply: (target,thisthis, array)=>{
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
    bindPureEvents(){
        this.events.map((item)=>{
            this.view.o_el.querySelector(item.ele).addEventListener(item.type, (ev)=>{
                if(item.type === 'submit'){
                    ev.preventDefault()
                }
                this[item.fn].call(this)
            })
        })
    }
}