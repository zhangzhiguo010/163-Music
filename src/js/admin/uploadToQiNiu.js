{
    let view = new View({
        el: '.uploadSong-inner',
        template: `
            <div class="uploadWrapper-background"></div>
            <div class="uploadWrapper">
                <div class="uploadView">
                    <div class="songImgLi">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-musicFile"></use>
                        </svg>
                    </div>
                    <div class="songDetails">
                        <div class="areaHeader">
                            <span>{name}</span>
                        </div>
                        <div class="areaMiddle">
                            <span>{percent}</span>
                            <span>{loaded}{size}</span>
                        </div>
                        <div class="growBar">
                            <div class="growBarInner"></div>
                        </div>
                    </div>
                </div>
                <div class="uploadSongArea">
                    <div class="drapArea">
                        <input type="file" data-ele="inputFile">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-cloudStorage"></use>
                        </svg>
                    </div>
                    <p class="hintDrag">拖曳{songOrCover}文件到此处上传</p>
                    <p class="hintOr">或者</p>
                    <div class="chooseFileButton">
                        <input type="file">
                        选择文件
                    </div>
                </div>
            </div>
        `,
        render(data){
            let newTemplate = this.template
            let placeholder = ['name', 'percent', 'loaded', 'size']
            placeholder.map((item)=>{
                if(!data[item]){ data[item] = '' }
                newTemplate = newTemplate.replace(`{${item}}`, data[item])
            })

            if(data.showOrHidden === 'show'){
                this.o_el.parentElement.classList.add('active')
            }else if(data.showOrHidden === 'hidden'){
                this.o_el.parentElement.classList.remove('active')
            }

            if(data.songOrCover === 'song'){
                newTemplate = newTemplate.replace('{songOrCover}', '歌曲')
            }else if(data.status === 'cover'){
                newTemplate = newTemplate.replace('{songOrCover}', '封面')
            }

            this.o_el.innerHTML = newTemplate 

            if(data.percent){
                let percentString = data.percent
                let percentNumber = percentString.slice(0, percentString.length-1) - 0
                this.o_el.querySelector('.growBarInner').style.cssText = `width:${percentNumber}%`
            }
        }
    })

    let model = new Model({
// {name:'', url:'' [name:'', url:''] loaded:'', size:'', percent:'', showOrHidden:'', songOrCover:''}
        data: {},
        nextFun(responseData, callBack){
            let loaded = `${Math.ceil(responseData.total.loaded/1000)}kb`
            let size = `${Math.ceil(responseData.total.size/1000)}kb`
            let percent = `${Math.floor(responseData.total.percent)}%`
            Object.assign(this.data, {loaded:loaded, size:size, percent:percent})
            callBack(this.data)
        },
        completeFun(responseData, callBack){
            let name = responseData.key
            let url = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(responseData.key)}`
            Object.assign(this.data, {name: name, url: url})
            callBack(this.data)
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'inputFile', type: 'change', fn:'afterInputFile'}
        ],
        eventHub: [
            {type: 'fileUploadToQiNiu', fn: 'afterFileUploadToQiNiu'}
        ],
        init(){
            this.view.render(this.model.data)
        },
        afterInputFile(target){
            let file = target.files[0]
            this.model.saveToQiniu(
                'http://localhost:8888/uptoken', 
                {file: file, name: file.name}, 
                this.view.render.bind(this.view)
            )
        },
        afterFileUploadToQiNiu(data){
            Object.assign(this.model.data, {songOrCover: data.fileType, showOrHidden: 'show'})
            this.view.render(this.model.data)
        }
    })

    controller.init()
}