const fs = require("fs");
const util = require("util");
const axios = require("axios");
const inquirer = require("inquirer");
const pdf = require("html-pdf");
const github = require("github-scraper");

const colors = {
    green: {
        wrapperBackground: "#E6E1C3",
        headerBackground: "#C1C72C",
        headerColor: "black",
        photoBorderColor: "#black"
    },
    blue: {
        wrapperBackground: "#5F64D3",
        headerBackground: "#26175A",
        headerColor: "white",
        photoBorderColor: "#73448C"
    },
    pink: {
        wrapperBackground: "#879CDF",
        headerBackground: "#FF8374",
        headerColor: "white",
        photoBorderColor: "#FEE24C"
    },
    red: {
        wrapperBackground: "#DE9967",
        headerBackground: "#870603",
        headerColor: "white",
        photoBorderColor: "white"
    }
};

let profileImage;
let userName;
let userLocation;
let userGithubProfile;
let userBlog;
let userBio;
let numRepo;
let numFollowers;
let numGithubStars;
let numUsersFollowing;
let userCompany;
let userFavColor;

const writeFileAsync = util.promisify(fs.writeFile);
const appendFileAsync = util.promisify(fs.appendFile);

function promptUser() {
    return inquirer.prompt([
        {
            type: "input",
            message: "Please input your github username",
            name: "username",
        },
        {
            type: "list",
            message: "Choose your favorite color",
            name: "color",
            choices: ["green",
              "blue",
              "pink",
              "red"
            ]
        }
    ])
        .then(function ({
            username,
            color,
        }) {
            const queryUrl = `https://api.github.com/users/${username}`;
            console.log(username);
            console.log(color);
            userFavColor = color;


            axios.get(queryUrl).then(function (result) {
                profileImage = result.data.avatar_url;
                userName = result.data.login;
                userLocation = result.data.location;
                userGithubProfile = result.data.html_url;
                userBlog = result.data.blog;
                userBio = result.data.bio;
                numRepo = result.data.public_repos;
                numFollowers = result.data.followers;
                numUsersFollowing = result.data.following;
                userCompany = result.data.company;

            });

            github(username, function (err, data) {
                const html = generateHTML2(data.stars);
                return appendFileAsync("index.html", html);
            });
        })
        .then(function () {
            let html = fs.readFileSync("index.html", "utf8");
            let options = {
                format: "Letter"
            };

            pdf.create(html, options).toFile("./developerprofilegenerator.pdf", function (err, res) {
                if (err) return console.log(err);
                console.log(res);
            });
        })
}

function generateHTML(data) {
    return `<!DOCTYPE html>
    <html lang="en">
     <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"/>
        <link href="https://fonts.googleapis.com/css?family=BioRhyme|Cabin&display=swap" rel="stylesheet">
        <title>Document</title>
        <style>
            @page {
              margin: 0;
            }
           *,
           *::after,
           *::before {
           box-sizing: border-box;
           }
           html, body {
           padding: 0;
           margin: 0;
           }
           html, body, .wrapper {
           height: 100%;
           }
           .wrapper {
           background-color: ${colors[userFavColor].wrapperBackground};
           padding-top: 100px;
           }
           body {
           background-color: white;
           -webkit-print-color-adjust: exact !important;
           font-family: 'Cabin', sans-serif;
           }
           main {
           background-color: #E9EDEE;
           height: auto;
           padding-top: 30px;
           }
           h1, h2, h3, h4, h5, h6 {
           font-family: 'BioRhyme', serif;
           margin: 0;
           }
           h1 {
           font-size: 3em;
           }
           h2 {
           font-size: 2.5em;
           }
           h3 {
           font-size: 2em;
           }
           h4 {
           font-size: 1.5em;
           }
           h5 {
           font-size: 1.3em;
           }
           h6 {
           font-size: 1.2em;
           }
           .photo-header {
           position: relative;
           margin: 0 auto;
           margin-bottom: -50px;
           display: flex;
           justify-content: center;
           flex-wrap: wrap;
           background-color: ${colors[userFavColor].headerBackground};
           color: ${colors[userFavColor].headerColor};
           padding: 10px;
           width: 95%;
           border-radius: 6px;
           }
           .photo-header img {
           width: 250px;
           height: 250px;
           border-radius: 50%;
           object-fit: cover;
           margin-top: -75px;
           border: 6px solid ${colors[userFavColor].photoBorderColor};
           box-shadow: rgba(0, 0, 0, 0.3) 4px 1px 20px 4px;
           }
           .photo-header h1, .photo-header h2 {
           width: 100%;
           text-align: center;
           }
           .photo-header h1 {
           margin-top: 10px;
           }
           .links-nav {
           width: 100%;
           text-align: center;
           padding: 20px 0;
           font-size: 1.1em;
           }
           .nav-link {
           display: inline-block;
           margin: 5px 10px;
           }
           .workExp-date {
           font-style: italic;
           font-size: .7em;
           text-align: right;
           margin-top: 10px;
           }
           .container {
           padding: 50px;
           padding-left: 100px;
           padding-right: 100px;
           }
  
           .row {
             display: flex;
             flex-wrap: wrap;
             justify-content: space-between;
             margin-top: 20px;
             margin-bottom: 20px;
           }
  
           .card {
             padding: 20px;
             border-radius: 6px;
             background-color: ${colors[userFavColor].headerBackground};
             color: ${colors[userFavColor].headerColor};
             margin: 20px;
           }
           
           .col {
           flex: 1;
           text-align: center;
           }
  
           a, a:hover {
           text-decoration: none;
           color: inherit;
           font-weight: bold;
           }
  
           @media print { 
            body { 
              zoom: .75; 
            } 
           }
        </style>`
}

function generateHTML2(stars) {
    return `
    </head>
    <body>
    <div class="wrapper">
      <div class="container">
        <div class="photo-header">
          <img src="${profileImage}" alt="image">
          <h1>Hi!</h1>
          <h2>My name is ${userName}</h2>
          <h5 class = "company">Currently at ${userCompany}</h5>
          <div class = "links-nav">
            <div class="nav-link">
            <i class= "fas fa-location-arrow"></i>
            <a href="https://www.google.com/maps/place/${userLocation}">${userLocation}</a>
            </div>
            <div class="nav-link">
              <i class="fas fa-blog"></i>
              <a href="${userBlog}">Blog</a>
            </div>
          </div>
        </div>
    </div>
    <div class="main">
      <div class="container">
        <div class="row">
          <div class="col">
            <h2>${userBio}</h2>
          </div>
          <div class="row">
            <div class="card col">
              <h2>Public Repositories</h2>
              <h3>${numRepo}</h3>
            </div>
            <div class="card col">
              <h2>Followers</h2>
              <h3>${numFollowers}</h3>
            </div>
        </div>
        <div class="row">
          <div class="card col">
            <h2>Github Stars</h2>
            <h3>${stars}</h3>
          </div>
          <div class="card col">
            <h2>Following</h2>
            <h3>${numUsersFollowing}</h3>
          </div>
        </div>
      <div>
    </div>
</div>
</body>
</html>`
}

promptUser()
.then(function (answers) {
    const html = generateHTML(answers);
    return writeFileAsync("index.html", html);
})
.catch(function (err) {
    console.log(err);
});
