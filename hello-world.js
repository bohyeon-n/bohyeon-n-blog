const MarkdownIt = require("markdown-it"),
  md = new MarkdownIt();

//requiring path and fs modules
const path = require("path");
const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const ejsLint = require("ejs-lint");
//joining path of directory
let directoryPath = path.join(__dirname, "content");
//passsing directoryPath and callback function

let fileLists = [];
let directories = fs.readdirSync(directoryPath);
directories.forEach((directory, index) => {
  fileLists.push(fs.readdirSync(`./content/${directory}`));
});
const indexHtmlFormat = fs.readFileSync("./public/index.html", "utf8");
const sidebarHtmlFormat = fs.readFileSync("./public/sidebar.html", "utf8");
const mainHtmlFormat = fs.readFileSync("./public/main.html", "utf8");
const homeHtmlFormat = fs.readFileSync("./public/home.html", "utf8");
const articleHtmlFormat = fs.readFileSync("./public/article.html", "utf8");
const headerHtmlFormat = fs.readFileSync("./public/header.html", "utf8");

// md파일에서 사용자가 입력한 값 추출하기

function extractedValue(md) {
  string = md.match(/\n*(\+\+\+)\n*([\s\S]+)\n*(\+\+\+)/);

  if (string === null) {
    value = { title: "", date: "" };
    return value;
  } else {
    str = string[2].match(/[^\r\n]+/g);
    let extractedValue = {};
    str.forEach(value => {
      if (value !== " ") {
        let valueline = value.match(/(.+)[=\n](.+)/);
        if (valueline != null) {
          key = valueline[1].replace(/\s/g, "");
          value = valueline[2].replace(/['"]*/g, "");
          extractedValue[key] = value;
        }
      }
    });
    return extractedValue;
  }
}

function extractedBody(md) {
  return md.replace(/\n*(\+\+\+)\n*([\s\S]+)\n*(\+\+\+)/, "");
}

// 사용자 정보 읽기

const author = fs.readFileSync("./author.md", "utf8");
const authorValue = extractedValue(author);
console.log(authorValue);

const header = ejs.render(headerHtmlFormat, {
  author: authorValue,
  postNum: 1,
  categoryNum: 3
});
let sidebar = ejs.render(sidebarHtmlFormat, {
  folderList: directories
});

let articleValue = [];
// 폴더 리스트 메인
fileLists.forEach((fileList, index) => {
  let main = ejs.render(mainHtmlFormat, {
    fileList: fileList,
    folderName: directories[index]
  });
  let html = ejs.render(indexHtmlFormat, {
    header: header,
    folderList: directories,
    main: main,
    sidebar: sidebar
  });

  fs.writeFileSync(`./deploy/${directories[index]}-index.html`, html);
  // article파일
  fileList.forEach(file => {
    // markdown to html file
    const markdownFile = fs.readFileSync(
      `./content/${directories[index]}/${file}`,
      "utf-8"
    );

    let value = extractedValue(markdownFile);
    let body = extractedBody(markdownFile);

    articleValue.push(value);
    let convertedFile = md.render(body);
    let html = ejs.render(articleHtmlFormat, {
      main: convertedFile,
      sidebar: sidebar,
      title: value.title,
      date: value.date
    });
    let n = file.indexOf(".");
    let fileName = file.slice(0, n);
    fs.writeFileSync(`./deploy/${fileName}.html`, html);
  });
});

// 홈화면 메인
let file = [];
fileLists.forEach(files => {
  file.push(...files);
});
console.log(articleValue[0]);
articleList = ejs.render(homeHtmlFormat, {
  articles: articleValue,
  fileList: file
});

html = ejs.render(indexHtmlFormat, {
  header: header,
  sidebar: sidebar,
  main: articleList
});
fs.writeFileSync("./index.html", html);
