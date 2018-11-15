# 一、index.html 
>备注：《首页》

## 1、page_remd.js 
>备注：《推荐音乐》标签被点击（默认）

#### (1) page_remd_remdSongs.js 
>备注：推荐歌单 模块

1. 输入：
```js
	/*LeanClound API 获取所有歌单*/
	let store = new AV.Query('Playlist')
	store.find().then((response)=>{})
```
2. 输出：
```js
	/*view.render 将歌单加载到页面中歌单模块*/
```

3. 跳转：
```js
	/*点击歌单，跳转到歌单页面，palylist.html*/
	window.location.href = `/src/playlist.html?menuId=/*点击的歌单的id值*/`
```

#### (2) page_remd_fshSongs.js 
>备注：最新音乐 模块

1. 输入：
```js
	/*LeanClound API 获取所有歌曲*/
	let store = new AV.Query('Song')
	store.find().then((response)=>{})
```
2. 输出：
```js
	/*view.render 将歌曲加载到页面中最新音乐模块*/
```

3. 跳转：
```js
	/*点击歌曲，跳转到歌曲播放页面，song.html*/
	window.location.href = `/src/song.html?songId=/*点击的歌曲的id值*/`
```

#### (3) page_remd_art.js 
>备注：广告区域 模块

1. 输入：
```js
	无
```
2. 输出：
```js
	'网易音乐'图标 + '打开APP'按钮 + '版权提示'
```

3. 跳转：
```js
	/*APP按钮点击跳转，没做*/	
```

## 2、page_hot.js  
>备注：《热歌榜》标签被点击

1. 输入：
```js
	/*LeanClound API 获取所有歌曲*/
	let store = new AV.Query('Song')
	store.find().then((response)=>{})
```
2. 输出：
```js
	/*view.render 将歌曲加载到页面中热歌榜标签下页面*/
```

3. 跳转：
```js
	/*点击歌曲，跳转到歌曲播放页面，song.html*/
	window.location.href = `/src/song.html?songId=/*点击的歌曲的id值*/`
```

## 3、page_sch.js  
>备注：《搜索》标签被点击

1. 输入：
```js
	/*LeanClound API 获取所搜的歌曲*/
    let songName = new AV.Query(/*仓库名*/)
    let singger = new AV.Query(/*仓库名*/)
    songName.contains(/*歌曲名*/, /*输入的关键字*/)
    singger.contains(/*歌手名*/, /*输入的关键字*/)
    AV.Query.or(songName, singger).find().then((response)=>{})
```
2. 输出：
```js
	/*view.render_createSearch 将歌曲加载到页面中搜索标签下搜索结果展示区域*/
```

3. 跳转：
```js
	/*点击歌曲，跳转到歌曲播放页面，song.html*/
	window.location.href = `/src/song.html?songId=/*点击的歌曲的id值*/`
```

# 二、playlist.html 
>备注：《歌单页》

## 1、plt_hed.js 
>备注：歌单页面头部区域

1. 输入：
```js
	/*在url的查询参数中得到歌单id*/
	getUrlSearch('menuId')  //自己写的辅助函数
	/*LeanClound API 获取歌单信息*/
	let store = new AV.Query(/*仓库名*/)
	store.get(/*歌单id*/).then((response)=>{})
```

2. 输出：
```js
	/*view.render 用拿到的歌单信息渲染歌单页面头部区域*/
```

## 2、plt_main.js 
>备注：歌单页面主体区域

1. 输入：
```js
	/*在url的查询参数中得到歌单id*/
	getUrlSearch('menuId')  //自己写的辅助函数
	/*LeanClound API 获取属于某一歌单的所有歌曲*/
    let menuItem = AV.Object.createWithoutData(/*歌单仓库名*/, /*歌单id值*/)
    songStorage = new AV.Query(/*歌曲仓库名*/)
    songStorage.equalTo('dependent', menuItem)
    songStorage.find().then((response)=>{})
```

2. 输出：
```js
	/*view.render 用拿到的歌曲数组渲染歌单页面主体区域*/
```

3. 跳转：
```js
	/*点击歌曲，跳转到歌曲播放页面，song.html*/
	window.location.href = `/src/song.html?songId=/*点击的歌曲的id值*/`
```

# 三、song.html 
>备注：《歌曲播放页》

1. 输入：
```js
	/*在url的查询参数中得到歌曲id*/
	getUrlSearch('songId')  //自己写的辅助函数
	/*LeanClound API 获取歌曲信息*/
	let store = new AV.Query(/*仓库名*/)
	store.get(/*歌曲id*/).then((response)=>{})
```

2. 输出：
```js
	/*view.render 用拿到的歌曲信息渲染歌曲播放页面*/
```

3. 播放：
```js
	/*歌曲使用audio标签*/
	/*audio.play()控制歌曲的播放*/
	/*audio.pause()控制歌曲的暂停*/
	/*歌曲结束时，触发ended事件*/
	/*歌曲播放中，触发timeupdate事件，ev.currentTarget.currentTime得到播放时间*/
```

# 四、depend目录
>自定义工具函数、MVC类等等

## 1、eventHub.js
>事件发布/订阅
```js
	window.eventHub = {
	    events: {},    // 数据结构：{click:[fn1, fn2], dbclick:[fn3, fn4]}
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
```

## 2、init_leancloud.js
>初始化liancloud数据库，放到.gitignore中，防止上传到服务器

```js
	{
	    let APP_ID = 'vrNy14F................GzoHsz';
	    let APP_KEY = 'WpRIB7...........qylpQwj';
	    AV.init({appId: APP_ID,appKey: APP_KEY});
	}
```

## 3、MVC_CLASS_BACK.js
>定义的View类、Model类、controller类

```js
	/*View类*/
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
	    	...
	    }
	    toggleShowOrHidden(name1, name2, selector){
	    	...
	    }
	    clearUlOrOl(o_ulOrOl, except){
			...
		}
	}
```
```js
	/*Model类*/
	class Model{
	    constructor({...res}){
	        Object.assign(this, res)
	    }
	    
	    /****** 操作leancloud***********/
	    // 新建仓库，新建一条数据
	    save(storeName, data, local){
			...
	    }
	    // 删除一条指定id的数据
	    delete(name, id){
			...
	    }
	    // 更改一条指定id的数据
	    change(name, id, data, local){
			...
	    }
	    // 得到一条指定id的数据
	    fetch(name, id, local){
			...
	    }
	    // 得到指定数据库的所有数据
	    fetchAll(name, local){
			...
	    }
	    // 新建歌曲和歌单，让歌曲指向歌单
	    pointSongToMenu(songStorage, menuStorage, songItem){
			...
	    }
	    // 新建歌曲，让歌曲指向已经存在的歌单
	    saveSongToMenu(songStorage, menuStorage, songItem, munuId, local){
			...
	    }
	    // 更改歌单指向
	    changeSongPointMenu(songStorage, menuStorage, songId, menuId){
			...
	    }
	    // 通过歌单找歌曲
	    fetchSongFromMenu(songStorage, menuStorage, munuId, localStorage){
			...
	    }
	    // 通过歌曲找歌单
	    fetchMenuFromSong(songStorage, songId){
			...
	    }
	    // 关联查询，搜索框查询
	    relationFetch(local, name, value, key1, key2){
			...
	    }
	    
	    /**************  操作七牛云 *****************/
	    saveToQiNiu(data){
			...
	    }
	}	
```

## 4、pagination.js
>自己做的分页器组件，加载文件，调用函数，出入控制参数即可，admin管理员页面用到了

```js
	function pagination({
		pageWrapper,	// 组件的容器元素的选择符，   字符串
		dataSource, 	// 数据源，   数组
		dataSize, 		// 每页展示的数据数量，   数字
		callBack		// 回调函数，接收筛选出来的数据最大页码，   函数
	}){
		...	
	}
```

# 五、辅助代码块：

```js
	/*得到想要的查询参数*/
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
```

```js
	/*ES5中模块加载，实现ES6的import*/
	// 函数声明
	loadModulesFun(tab, url){
        let ele = document.createElement(tab)
        ele.src = url 
        document.body.appendChild(ele)
    }
    
    // 函数调用
    new Promise((resolve)=>{
        this.loadModulesFun('script', './js/index/page_remd_remdSongs.js')
        this.loadModulesFun('script', './js/index/page_remd_fshSongs.js')
        this.loadModulesFun('script', './js/index/page_remd_art.js')
        resolve()
    })
```

```js
	/*歌曲搜索页面的状态管理*/
	// 为了记忆方便，add('active')是展示，remove('active')是隐藏
	showOrHidden(key, data){
	    let label = this.o_el.querySelector('label').classList
	    let close = this.o_el.querySelector('.sch_close').classList
	    let sch_view = this.o_el.querySelector('.sch_view').classList
	    let click_view = this.o_el.querySelector('.click_view').classList
	    let hint = this.o_el.querySelector('.sch_view h3')
	    let input = this.o_el.querySelector('.sch_input')
	
	    if(key === 'init'){
	        label.add('active')
	        close.remove('active')
	        sch_view.remove('active')
	        click_view.remove('active')
	    }else if(key === 'input_null'){
	        label.remove('active')
	        close.add('active')
	        sch_view.remove('active')
	        click_view.remove('active')
	    }else if(key === 'input_content'){
	        label.remove('active')
	        close.add('active')
	        sch_view.add('active')
	        click_view.remove('active')
	        hint.innerText = `搜索“${data}”`
	    }else if(key === 'close'){
	        label.add('active')
	        close.remove('active')
	        sch_view.remove('active')
	        click_view.remove('active')
	        input.value = ''
	    }else if(key === 'clickSong'){
	        label.remove('active')
	        close.add('active')
	        sch_view.remove('active')
	        click_view.add('active')
	        input.value = data
	    }
	}
```

```js
	/*view中render函数，大概思路*/
    render(data){
        this.o_el.innerHTML = this.template
        let ul = this.o_el.querySelector(/*ul选择器*/)
        data.songs.slice(0,10).map((item)=>{
            let li = document.createElement('li')	
            li.innerHTML = `
                <div class="songLink">
                    <h3 class="songName">${item.songName}</h3>
                    <p class="singer">
                        <svg class="icon songSq" aria-hidden="true">
                            <use xlink:href="#icon-sq"></use>
                        </svg>
                        ${item.singer}
                    </p>
                    <svg class="icon songPlay" aria-hidden="true">
                        <use xlink:href="#icon-bofang"></use>
                    </svg>
                </div>
            `,
            li.setAttribute('data-id', item.id)			// 记录歌曲id值
            li.setAttribute('data-ele', 'songClick')	// 为事件绑定服务
            ul.appendChild(li)
        })
    }
```