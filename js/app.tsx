// 解构
let { Component } = React;
let { render } = ReactDOM;
// 使用路由
let { Router, Route, IndexRoute } = ReactRouter;
// 第一步 定义混合类
class Util extends Component {
	/**
	 * 异步请求方法
	 * @url 	请求地址
	 * @fn 		回调函数
	 **/
	ajax(url, fn) {
		// 实例化xhr
		var xhr = new XMLHttpRequest();
		// 监听事件
		xhr.onreadystatechange = () => {
			// 监听状态
			if(xhr.readyState === 4) {
				// 监听请求状态
				if (xhr.status === 200) {
					// 解析返回的数据
					let res = JSON.parse(xhr.responseText);
					// 执行回调函数
					fn && fn(res);
				}
			}
		}
		// 打开请求
		xhr.open('GET', url, true);
		// 发送请求
		xhr.send(null);
	}
	/**
	 * 将对象转化成query
	 * @url 	请求地址
	 * @obj 	处理的对象
	 * return 	完整的url
	 * objToQuery('demo.json', {a: 100, b: 200}) => demo.json?a=100&b=200
	 **/
	objToQuery(url, obj) {
		// 定义query字符串
		let query = '';
		// 解析对象
		for (let i in obj) {
			// i表示key => a,  obj[i]表示value => 100
			query += '&' + i + '=' + obj[i]
		}
		// 第一个&多余，截取, 前面还要加上? , 最前面还有地址
		return url + '?' + query.slice(1);
	}
}
// 定义三个组件
// 首页组件
class Home extends Util {
	// 初始化状态数据
	constructor(props) {
		super(props);
		this.state = {
			data: []
		}
	}
	render() {
		return (
			<section className="home">
				<ul>{this.createList()}</ul>
			</section>
		)
	}
	// 创建列表
	createList() {
		return this.state.data.map((obj, index) => (
			<li key={index}>
				<a href={'#/detail/' + obj.id}>
					<img src={obj.img} alt="" />
					<div className="home-content">
						<h3>{obj.title}</h3>
						<p>{obj.content}<span className="home-comment">{'评论:' + obj.comment}</span></p>
					</div>
				</a>
			</li>
		))
	}
	componentDidMount() {
		this.ajax('data/list.json', res => {
			if (res && res.errno === 0) {
				this.setState({
					data: res.data
				})
			}
		})
	}
}
// Home.defaultProps ={}
// 详情页
class Detail extends Util {
	// 初始化状态数据
	constructor(props) {
		super(props);
		this.state = {
			data: {}
		}
	}
	// 渲染
	render() {
		// console.log(this, 22222)
		// 缓存数据
		let data = this.state.data;
		// 过滤标签
		let content = {
			__html: data.content
		}
		return (
			<section className="detail">
				<h1>{data.title}</h1>
				<p className="status"><span className="time">{data.time}</span><span className="comment">{'评论:' + data.comment}</span></p>
				<img src={data.img} alt="" />
				<p className="content" dangerouslySetInnerHTML={content}></p>
				<a href={'#/comments/' + data.id}>
					<div className="btn">查看更多评论</div>
				</a>
			</section>
		)
	}
	// 加载完成，请求数据
	componentDidMount() {
		// id怎么获取？
		// console.log(this)
		let id = this.props.params.id;
		// 根据id，请求数据
		this.ajax('data/detail.json?id=' + id, res => {
			// console.log(res)
			// 请求成功，存储数据
			if (res && res.errno === 0) {
				this.setState({
					data: res.data
				})
			}
		})
	}
}
// 评论页
class Comments extends Util {
	// 我们在内部操作数据，因此，要将属性数据转化成状态数据
	constructor(props) {
		// 继承父类构造函数
		super(props);
		// 初始化属性数据
		this.state = {
			// 评论列表数据
			list: [],
			// 新闻的id
			id: 0
		}
	}
	// 存在期第一个阶段，更新状态数据
	// componentWillReceiveProps(newProps) {
	// 	this.setState({
	// 		// 更新列表数据
	// 		list: newProps.data.list,
	// 		// 更新id
	// 		id: newProps.data.id
	// 	})
	// }
	// 创建列表
	createList() {
		// 渲染状态数据
		return this.state.list.map((obj, index) => (
			<li key={index}>
				<h3>{obj.user}</h3>
				<p className="content">{obj.content}</p>
				<p className="date">{obj.time}</p>
			</li>
		))
	}
	// 定义事件回调函数
	submitInput() {
		// 1 为按钮绑定事件
		// 2 获取输入的内容
		let val = this.refs.userInput.value;
		// 3 我们要校验合法性
		if (/^\s*$/.test(val)) {
			// 符合条件，不合法，提示用户，阻止提交
			alert('请输入内容！');
			return;
		}
		// 4 	不合法，提示用户，阻止提交
		// 合法，提交请求
		// 模拟数据
		let date = new Date();
		let data = {
			id: this.state.id,
			user: '雨夜清荷',
			// 去除首尾空白符
			content: val.replace(/^\s+|\s+$/g, ''),
			time: '刚刚 ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
		}
		// 提交请求
		this.ajax(this.objToQuery('data/addComment.json', data), res => {
			// console.log(res)
			// 5 提交成功， 追加评论
			if (res && res.errno === 0) {
				let list = this.state.list;
				// 前面显示，插入前面，
				list.unshift(data)
				// 后面显示，插入后面
				// list.push(data)
				// 追加评论，就是将data添加在list状态数据中
				this.setState({
					// 前面显示，插入前面，后面显示，插入后面
					list: list
				})
				// 6 清空输入框，提示用户
				this.refs.userInput.value = '';
				alert('提交成功！')
			}
		})
	}
	// 渲染
	render() {
		return (
			<section className="comments">
				<div className="user-input">
					<textarea placeholder="文明上网，理性发言！" ref="userInput"></textarea>
					<div className="submit-btn"><span onClick={this.submitInput.bind(this)}>提交</span></div>
				</div>
				<ul>{this.createList()}</ul>
			</section>
		)
	}
	// 组件创建完成，发送请求
	componentDidMount() {
		// 获取id
		let id = this.props.params.id;
		// 1 父组件根据新闻id，请求新闻评论
		this.ajax('data/comment.json?id=' + id, res => {
			// 2 存储数据, 显示评论页
			if (res && res.errno === 0) {
				this.setState({
					// 存储数据
					list: res.data.list,
					id: res.data.id
				})
			}
			// 3 将数据传递给评论页
		})
	}
}
// 抽象header组件
class Header extends Component {
	goBack() {
		// 返回到上一个路由即可
		history.go(-1);
	}
	render() {
		return (
			<header className="header">
				<div className="go-back" onClick={this.goBack.bind(this)}><span className="arrow"><span className="arrow blue"></span></span></div>
				<div className="login">登录</div>
				<h1>爱创课堂新闻平台</h1>
			</header>
		)
	}
}
// 定义APP组件
// 第二步 继承混合类
class App extends Component {
	// 渲染方法
	render() {
		// let section = this.state.section;
		return (
			<div>
				<Header></Header>
				{/*第一步  定义路由容器*/}
				{this.props.children}
			</div>
		)
	}
}
// 第二步 定义路由规则
let routes = (
	<Router>
		<Route path="/" component={App}>
			<IndexRoute component={Home}></IndexRoute>
			<Route path="detail/:id" component={Detail}></Route>
			<Route path="comments/:id" component={Comments}></Route>
		</Route>
	</Router>
)

// 第三步 渲染路由
render(routes, document.getElementById('app'))
