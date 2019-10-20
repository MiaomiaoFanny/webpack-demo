/* 多页面应用: 自动生成页面 */

const fs = require("fs")
const path = require('path')
const baseDir = path.join(__dirname, "../www/pages/")
let pages = process.argv.slice(2)
if (pages == "" || pages == null || pages == undefined) {
    console.log("Please give the page name!")
    return
}
const createPage = (baseDir, page) => {
    if (fs.existsSync(baseDir + page) == true) {
        console.log(`This page: ${baseDir + page} already exist!`)
        return
    }
    try {
        fs.mkdirSync(baseDir + page)
        console.log(`Create ${baseDir + page} success!`)
    } catch (error) {
        console.log(`Create ${baseDir + page} fail > ${error}`)
    }

    ['html', 'js', 'css'].forEach(suffix => {
        try {
            let data = ""
            if(suffix === 'js') {
                data = `import './${page}.css'`
            }
            if(suffix === 'html') {
                data = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title><%= htmlWebpackPlugin.options.title %></title>
</head>
<body>
  <h1>Webpack 多页面应用 - ${page}</h1>
  <p><a href="index.html">index</a></p>
</body>
</html> `
            }
            fs.writeFileSync(`${baseDir}${page}/${page}.${suffix}`, data)
            console.log(`create ${baseDir}${page}.${suffix} success!!`)
        } catch (error) {
            console.log(`create ${baseDir}${page}.${suffix} fail!!`)
        }
    })
}
pages.forEach(page => createPage(baseDir, page))
