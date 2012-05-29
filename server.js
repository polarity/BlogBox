var watch = require('nodewatch');
var md = require("node-markdown").Markdown
var fs = require('fs')

var source = "./posts/"
var target = "./blog/"
var sourceFile = false
var targetFile = false
var markdownString = false
var htmlString = false
var filename = false
var headerString = false

var headerJSON = {}
var app = {}

// find the markdown header
app.getHeader = function() {
	// get the regex result
	headerString = markdownString.match(/^---((.|\n)*?)---/i)
	// correct the content and remove the header
	markdownString = markdownString.replace(headerString[0], '')
	// find key->values in the header string
	// and iterate over it
	var re = /(\w*):([ |\w]*| )\n/g
	while (match = re.exec(headerString[1])) {
		// write every pair into the global variable
		headerJSON[match[1]] = match[2].trim();
	}
}
// read a file and convert it to markdown
// save it to the target destionation
app.md2html = function() {
	// read the new/changed file
	markdownString = fs.readFileSync(sourceFile,'ascii')
	// extract header and correct content
	app.getHeader()
	// convert the content to html
	htmlString = md(markdownString)
}
// write a html file
app.writeHtml = function() {
	if(typeof headerJSON.title != 'undefined'){
		targetFile = app.string2url(headerJSON.title)
	} else {
		targetFile = sourceFile.substr(sourceFile.lastIndexOf('/')+1).split('.')[0]
	}
	fs.writeFileSync(target+targetFile+'.html', htmlString)
}
// convert a string to an alias filename
app.string2url = function(string) {
	return string
		.toLowerCase()
		.replace(/ /g,'-')
		.replace(/[^\w-]+/g,'')
		.trim()
}
app.getFileList = function() {
	return fs.readdirSync(target)
}
app.writeIndexFile = function(dirArr) {
	var writeContent = '<ul>'
	for (var k in dirArr) {
		writeContent = writeContent+'<li><a href="'+dirArr[k]+'">'+dirArr[k]+'</a></li>\n\n'
	}
	writeContent = writeContent+'/<ul>'
	fs.writeFile('./blog/index.html', writeContent)
}
// Events
watch.add("./posts").onChange(function(file,prev,curr,action){
	// new markdown file arrives folder
	if(action == 'new' || action =='change') {
		sourceFile = file
		// read -> extract meta -> convert
		app.md2html()
		// write
		app.writeHtml()
		// generate index file yoa
		app.writeIndexFile(app.getFileList())
	}
 });

// generate index file on first start
app.writeIndexFile(app.getFileList())
