// class View{
//     constructor({el, template, render}){
//         this.el = el
//         this.o_el = document.querySelector(this.el)
//         this.template = template
//         this.render = render

//         this.render()
//     }
// }
// let view = new View({
//     el: '.songList-inner',
//     template:`
//         <h1>歌曲列表</h1>
//         <ul></ul>
//     `,
//     render(){
//         this.o_el.innerHTML = this.template
//     }
// })


// class Model{
//     constructor({data, fetch}){
//         this.data = data
//         this.fetch = fetch

//         this.fetch()
//     }
//     fetch(){

//     }
// }
// let model = new Model({
//     data:{
//         // [{id:'', name:'', singer:'', url:'', cover:'', lyrics:''}, {...........}]
//         songs:[],
//         selected: ''    
//     },
//     fetch(){
//         let query = new AV.Query('Song')
//         return query.find().then((allSong)=>{
//             allSong.map((song)=>{
//                 this.data.songs.push(Object.assign({}, {id:song.id}, song.attributes))
//             })
//         })
//     }

// }) 


// class Controller{
//     constructor({view, model, events, selectLi}){
//         this.view = view
//         this.model = model
//         this.events = events
//         this.selectLi = selectLi
        
//         this.view.render(this.model.data)
//         this.model.fetch().then(()=>{
//             this.view.render(this.model.data)
//         })
//         this.bindEvents()
//         // this.bindEventHub()
//     }
//     bindEvents(){
//         console.log(this.events)
//         this.events.map((item)=>{
//             // document.querySelector(this.view.el).addEventListener(item.eleType, this[item.eleHandle].bind(this))
//         })
//     }
// }
// let controller = new Controller({
//     view: view,
//     model: model,
//     events: [
//         {agencyEle: 'this.o_el', targetEle: 'li', eleType: 'click', eleHandle: 'selectLi'}
//     ],
//     selectLi(){
//         if(this.model.data.selectId){
//             if(this.model.data.selectId !== ev.target.getAttribute('data-song-id')){
//                 this.view.activateLi('deactive', this.model.data.selectId)
//             }
//         }
//         this.view.activateLi('active', ev.target.getAttribute('data-song-id'))
//         this.model.data.selectId = ev.target.getAttribute('data-song-id')
//         eventHub.trigger('select', this.model.data.selectId)
//     }

// })





{
    let view = {
        el: '.songList-inner',
        template:`
            <h1>歌曲列表</h1>
            <ul></ul>
        `,
        render(data){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
            data.map((item)=>{
                let li = document.createElement('li')
                li.setAttribute('data-song-id', item.id)
                li.innerText = item.name
                this.o_el.querySelector('ul').appendChild(li)
            })
        },
        activateLi(key, id){
            let selectLi = this.o_el.querySelector(`li[data-song-id='${id}'`)
            if(key === 'active'){
                selectLi.classList.add('active')
            }else if(key === 'deactive'){
                selectLi.classList.remove('active')
            }
        }
    }
    let model = {
        data:{
            // [{id:'', name:'', singer:'', url:'', cover:'', lyrics:''}, {...........}]
            songs:[],
            selected: ''    
        },
        fetch(){
            let query = new AV.Query('Song')
            return query.find().then((allSong)=>{
                allSong.map((song)=>{
                    this.data.songs.push(Object.assign({}, {id:song.id}, song.attributes))
                })
            })
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data.songs)
            this.model.fetch().then(()=>{
                this.view.render(this.model.data.songs)
            })
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents(){
            this.view.o_el.addEventListener('click', (ev)=>{
                if(ev.target.nodeName.toLowerCase() === 'li'){
                    this.selectLi(ev).then((id)=>{
                        eventHub.trigger('select', id)
                    }) 
                }
            })
        },
        bindEventHub(){
            eventHub.listen('uploadBefore', ()=>{
                if(this.model.data.selectId){
                    this.view.activeToggle('deactive', this.model.data.selectId)
                }
            })
            eventHub.listen('create', (data)=>{
                this.model.data.songs.push(data)
                this.view.render(this.model.data.songs)
            })
            eventHub.listen('change', (data)=>{
                this.model.data.songs.map((song)=>{
                    if(song.id === data.id){
                        Object.assign(song, data)
                        this.view.render(this.model.data.songs)
                    }
                })
            })  
        },
        selectLi(ev){
            return new Promise((resolve)=>{
                if(this.model.data.selectId){
                    if(this.model.data.selectId !== ev.target.getAttribute('data-song-id')){
                        this.view.activateLi('deactive', this.model.data.selectId)
                    }
                }
                this.view.activateLi('active', ev.target.getAttribute('data-song-id'))
                this.model.data.selectId = ev.target.getAttribute('data-song-id')
                resolve(this.model.data.selectId)
            })
        },
    }

    controller.init(view, model)
}