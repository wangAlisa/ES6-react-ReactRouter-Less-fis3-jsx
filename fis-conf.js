// 编译less
fis.match('**.less', {
	parser: 'less',
	rExt: '.css'
})
// 编译tsx
fis.match('**.tsx', {
	parser: 'babel2',
	rExt: '.js'
})