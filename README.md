# 一、项目搭建：
>新建目录：《163-Music》《src》《js》《initializers》《css》《image》《dist》  
 新建文件：.gitignore  
 git提交：......  
 新建、关联、更新GitHub仓库：  
 安装LeanCloud：   
 安装七牛云：  
 git提交：......

# 一、后台管理：
>入口文件：admin.html

>主要功能：显示歌曲、上传歌曲、修改歌曲、删除歌曲

### 1、显示歌曲：
>整体思路：组件封装、MVC结构

>具体实现：

	view:
	    模板：
	    渲染函数：
	        动态生成li（记录歌曲id），更新模板，渲染页面
	  
	model:
	    数据：歌曲列表、选中歌曲的id
	    获取数据：数据库获取数据后更新model数据
	  
	controller:
	    初始化页面
	    数据库获取数据后更新页面
	    绑定事件：
	        监听li的click事件，事件触发渲染页面，并发布select事件
	    监听事件：
	        监听create新建歌曲事件，事件触发渲染页面
	        监听new事件，事件触发渲染页面
	        监听update事件，事件触发渲染页面

### 2、上传歌曲：

### 3、修改歌曲：

### 4、删除歌曲：

# 二、用户界面
# 三、播放界面
# 四、歌单界面


需要完善：
1、upload-song里面的上传文件类型
http://pfap49o5g.bkt.clouddn.com/%E9%AD%94%E6%96%B9.png