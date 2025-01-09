// import the required modules
import express from "express";
import bodyParser from "body-parser";
import fs from "node:fs";
import {dirname} from "path"
import {fileURLToPath} from "url"

// initialize app
const app = express();
const port = 3000;

// allow the server to access static files like css by 
// telling it is in the public folder
app.use(express.static("public"));

// dynamic path
const __dirname = dirname(fileURLToPath(import.meta.url));


// mount middlewares
app.use(bodyParser.urlencoded({extended:true}))

// add arrays that will contain data

var blog_titles = []
var blog_stories = []
var blogs_to_delete = []

// ----------------setup the routes------------------

// home page
app.get("/", (req, res)=>{
    // iterate over blogs_to_delete to delete all elements at 
    // the indexes in the blog_titles and blog_stories arrays
    res.render("home.ejs", {blog_t : blog_titles, blog_s : blog_stories, blog_d:blogs_to_delete})
})

app.post("/", (req, res)=>{
        var index = req.body["blog_index"]
        blogs_to_delete.push(index)
        blogs_to_delete.forEach((index)=>{
        blog_titles = blog_titles.filter(item => item !== blog_titles[index]);
        blog_stories = blog_stories.filter(item => item !== blog_stories[index]);
    })
    // clearing the array
    blogs_to_delete.length =  0;
    res.render("home.ejs", {blog_t : blog_titles, blog_s : blog_stories, blog_d:blogs_to_delete})

})

// submit page

app.get("/submit", (req, res)=>{
    res.render("write.ejs")
})
app.post("/submit", (req, res)=>{
    

    // extract data from the form sent to the server by the client
    var blog_name_for_array = req.body["blog_title"]
    var blog_name = blog_name_for_array.replace(/ /g, "_")
    var blog_story = req.body["blog_story"]
    var blog_path = __dirname+"/views/"+blog_name+".ejs"
    var blog_edit_path = __dirname+"/views/"+blog_name+"-edit.ejs"

    const htmlContent_BlogFile = `<%- include("partials/header.ejs")%>
                                  <h1>${blog_name.replace(/_/g, " ")}</h1>
                                  <h3>${blog_story}</h3>
                                  <%- include("partials/footer.ejs")%>`
    const htmlContent_editFile = `
<%- include("partials/header.ejs")%>
<form class="text-center" action="/edit-${blog_name}" method="POST">
    <label for="blog_title"><h3>Title</h3></label>
    <input class="form-control" type="text" name="blog_title" value=${blog_name}>
    <label for="blog_story"><h3>Story</h3></label>
    <input class="form-control" type="text" name="blog_story" value=${blog_story}>
    <input class="btn btn-outline-warning btn-lg" type="submit" value="Confirm Changes">
</form>

<%- include("partials/footer.ejs")%>
  `;

    // create a file who's name is <blog_title>+".ejs"
    fs.writeFile(blog_path, htmlContent_BlogFile, (err)=>{
        if (err) throw err;
        console.log('The file has been saved!');
        createRoutesBlog()
    })

    // create a file who's name is <blog_title>+"-edit.ejs" (for editing)
    fs.writeFile(blog_edit_path, htmlContent_editFile, (err)=>{
        if (err) throw err;
        console.log('The file has been saved!');
        createRoutesBlogEdit()
        HandleBlogEdit()
    })

    /***
    TODO add both of the above variables to 2 different
    arrays, respectively blog_names and blog_stories or something.
    We will iterate through both of them in the home.ejs 
    in order to display their content.

    ***/
   blog_titles.push(blog_name)
   blog_stories.push(blog_story)
    
   // render home.ejs with the blogs
   res.render("home.ejs", {blog_t : blog_titles, blog_s : blog_stories, blog_d:blogs_to_delete})

})


// create routes to get access to all the files containing blogs
function createRoutesBlog(){
    blog_titles.forEach((title)=>{
        var route = "/"+title;
        // get handlers
        app.get(route, (req, res)=>{
            res.render(title+".ejs")
        })
    })
    

    
}


// create routes to get access to all the files containing blogs
function createRoutesBlogEdit(){
    blog_titles.forEach((title)=>{
        var route = "/edit-"+title;
        app.get(route, (req, res)=>{
            HandleBlogEdit()
            res.render(title+"-edit.ejs")
        })
    
    })
    
}

// create routes to get access to all the files containing blogs
function HandleBlogEdit(){
    blog_titles.forEach((title)=>{

        var route = "/edit-"+title;
        app.post(route, (req, res)=>{

            // get new title and new story
            var new_blog_name = req.body["blog_title"]
            var new_blog_story = req.body["blog_story"]
        
        
        
            // 0. get the route name and remove "/edit-"
            var url = req.url;
            var to_remove = "/edit-"
            var old_blog_name = url.replace(to_remove, "")
            console.log(old_blog_name)
        
            // craft the old paths with the old name of the blog
            var old_blog_path = __dirname+"/views/"+old_blog_name+".ejs"
            var old_blog_edit_path = __dirname+"/views/"+old_blog_name+"-edit.ejs"
        
        
            // craft the new paths 
            var new_blog_path = __dirname+"/views/"+new_blog_name+".ejs"
            var new_blog_edit_path = __dirname+"/views/"+new_blog_name+"-edit.ejs"
        
            const htmlContent_BlogFile = `<%- include("partials/header")%>
            <h1>${new_blog_name.replace(/_/g, " ")}</h1>
            <h3>${new_blog_story}</h3>
            <%- include("partials/footer.ejs")%>`

            // 1. replace the content of soriir.ejs
            fs.writeFile(old_blog_path, htmlContent_BlogFile, (err)=>{
                if (err) throw err;
                console.log('The file has been saved!');
                createRoutesBlog()
            })
            

            // replace the content of sorrir-edit.ejs
            const new_htmlContent_editFile = `
 <%- include("partials/header.ejs")%>
<form class="text-center" action="/edit-${new_blog_name}" method="POST">
    <label for="blog_title"><h3>Title</h3></label>
    <input class="form-control" type="text" name="blog_title" value=${new_blog_name}>
    <label for="blog_story"><h3>Story</h3></label>
    <input class="form-control" type="text" name="blog_story" value=${new_blog_story}>
    <input class="btn btn-outline-warning btn-lg" type="submit" value="Confirm Changes">
</form>          
<%- include("partials/footer.ejs")%>
    `;

         


        
            // create a file who's name is <blog_title>+"-edit.ejs" (for editing)
            fs.writeFile(old_blog_edit_path, new_htmlContent_editFile, (err)=>{
                if (err) throw err;
                console.log('The file has been saved!');
                createRoutesBlogEdit()
            })
        
            // 2. change the name of sa.ejs to <new title>.ejs
            fs.rename( old_blog_path, new_blog_path, (err) => {
                if (err) throw err;
                console.log('Rename complete!');
                } )
        
            // 3. change the name of soriir-edit.ejs to <new title>-edit.ejs
            fs.rename( old_blog_edit_path, new_blog_edit_path, (err) => {
                if (err) throw err;
                console.log('Rename complete!');
                } )
        
        
            // change the content of the arrays
                // find index of element to replace
            var index = blog_titles.indexOf(old_blog_name)
                // replace it if it exists
            if (index !== -1) {
                blog_titles[index] = new_blog_name;
                blog_stories[index] = new_blog_story
            }
            createRoutesBlog()
            createRoutesBlogEdit()
            res.render("home.ejs", {blog_t : blog_titles, blog_s : blog_stories, blog_d:blogs_to_delete})
        })
        
    })
    
}

// -------------- Server shutdown hook -----------
process.on('SIGINT', function() {
    const testFolder = "/views";
    console.log(testFolder)

    fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
        console.log(file);
    });
    });
    console.log("> Exiting")
    process.exit()
});

// ----------------start the server----------------
app.listen(port, (req, res)=>{
    console.log(`Server running on port ${port}`)
})


// Tuesday January 7th summary
// 👑150 lines of code
// 👑setup the blog creating with express, node:fs, ejs
// 👑setup the blog viewing with express, node:fs, ejs
// 👑setup the blog editing feature with express, node:fs, ejs


// Tuesday January 7th summary
// 👑setup the blog deleting with express, node:fs, ejs
// 👑find how to execute code right before server shutdown with node fs
// 👑create footer, headers, link css
// 👑start styling all ejs files with bootstrap






// bash :command to delete every useless files
// find . -type f ! -path './partials/*' ! -name 'home.ejs' ! -name 'write.ejs' -delete
