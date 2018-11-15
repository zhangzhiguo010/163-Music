window.eventHub = {
    events: {},    // {click:[fn1, fn2], dbclick:[fn3, fn4]}
    listen(eventName, fn){
        if(!this.events[eventName]){
            this.events[eventName] = []
        }
        this.events[eventName].push(fn)
    },
    trigger(eventName, options,){
        for(let key in this.events){
            if(key === eventName){
                this.events[eventName].map((item)=>{
                    item.call(null, options)
                })
            }
        }
    }
}