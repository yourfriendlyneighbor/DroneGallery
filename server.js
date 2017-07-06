const
express = require('express'),
app = express(),
mongoose = require('mongoose'),
multer = require('multer'),
upload = multer({dest: './userUploads/'}),
bodyParser = require('body-parser'),
fs = require('fs'),
compression = require('compression'),
cloudinary = require('cloudinary'),
path = require('path'),
mongoosePaginate = require('mongoose-paginate');
cloudinary.config({
  cloud_name: 'dgeyqjlzg',
  api_key: '328426136744652',
  api_secret: 'ToWguKhGOvj9ZKDl8onjg7f5Xag'
});


app.set('view engine', 'ejs');

app.use(compression());

try {
    mongoose.connect('mongodb://dabkab:abcdabcd@ds149412.mlab.com:49412/dronepics');
} catch (e) {
    mongoose.connect('mongodb://dabkab:abcdabcd@ds149412.mlab.com:49412/dronepics');
} finally {
    console.log('uh oh');
}

var pschema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    location: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number
    },
    dislikes: {
        type: Number
    }
}, {
    collection: 'gallery'
});

pschema.plugin(mongoosePaginate);

const Photo = mongoose.model('Photo', pschema);


app.use('/static', express.static('./static'));
app.use('/userUploads', express.static('./userUploads'));
app.use('/jquery', express.static('./node_modules/jquery/dist/jquery.min.js'));
app.use('/angular', express.static('./node_modules/angular/angular.min.js'));
app.use('/materializeCSS', express.static('./node_modules/materialize-css/dist/css/materialize.min.css'));
app.use('/materializeJS', express.static('./node_modules/materialize-css/dist/js/materialize.min.js'));
app.use('/fonts/roboto/Roboto-Regular.woff', express.static('./node_modules/materialize-css/dist/fonts/roboto/Roboto-Regular.woff'));
app.use('/fonts/roboto/Roboto-Regular.woff2', express.static('./node_modules/materialize-css/dist/fonts/roboto/Roboto-Regular.woff2'));
app.use('/fonts/roboto/Roboto-Medium.woff', express.static('./node_modules/materialize-css/dist/fonts/roboto/Roboto-Medium.woff'));
app.use('/fonts/roboto/Roboto-Medium.woff2', express.static('./node_modules/materialize-css/dist/fonts/roboto/Roboto-Medium.woff2'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, sid');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
    next()
});

app.get('/', (req, res) => {
    res.redirect('/home');
});
app.get('/home', (req, res) => {
    var currentPage = 1, limit = 6, docs = [];

    currentPage = +req.query.page;
    Photo.paginate({}, { page: currentPage, limit: limit }, function(err, result) {
        docs = result.docs.reverse();

        res.render("pages/index", {
             photos: docs
         });
    });
});
app.get('/upload', (req, res) => {
    res.render('pages/upload')
});

function deletePhotos(path){
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
}

app.post('/postPhoto', upload.any(), (req, res) => {
    console.log(req.files[0].size);
    if(req.files[0].size <= 5242880){
        if(req.body.description == ""){
            if(req.body.description == ""){
                if(req.body.title == req.body.title.toUppercase()){
                    if(req.body.description == req.body.description.toUppercase()){
                        // All good
                        req.files.forEach((file) => {
                            var filename = (new Date).valueOf() + "." + file.originalname;
                            fs.rename(file.path, './userUploads/' + filename, (err) => {
                                if(err){
                                    deletePhotos('./userUploads/');

                                    console.log(err);
                                    return res.json({error: err})
                                }else{
                                    cloudinary.uploader.upload('./userUploads/' + filename, function(result) {
                                        var photo = new Photo({
                                            title: req.body.title,
                                            description: req.body.description,
                                            location: req.body.location,
                                            image: result.url
                                        });

                                        photo.save((err, result) => {
                                            if(err){
                                                delet
                                                deletePhotos('./userUploads/');
                                                console.log(err);
                                                res.json({error: err})
                                            }else{
                                                fs.unlink('./userUploads/'+filename, (err) => {
                                                    if (err){
                                                        deletePhotos('./userUploads/');
                                                        console.log(err);
                                                        res.json({error: err})
                                                    }else{
                                                        deletePhotos('./userUploads/');
                                                        res.json({success: 'Success! Check out your new image'})
                                                    }
                                                });
                                            }
                                        })
                                    }, {
                                        width: 1080,
                                        height: 720
                                    });
                                }

                            })
                        })

                    }else{
                        try{
                            deletePhotos('./userUploads/');
                            fs.mkdirSync('./userUploads');
                        } catch(e){
                            deletePhotos('./userUploads/');
                            fs.mkdirSync('./userUploads');
                        }
                        return res.json({warning: 'An all uppercase description makes me sad'})
                    }
                }else{
                    try{
                        deletePhotos('./userUploads/');
                        fs.mkdirSync('./userUploads');
                    } catch(e){
                        deletePhotos('./userUploads/');
                        fs.mkdirSync('./userUploads');
                    }
                    return res.json({warning: 'An all uppercase title makes me sad'})
                }
            }else{
                try{
                    deletePhotos('./userUploads/');
                    fs.mkdirSync('./userUploads');
                } catch(e){
                    deletePhotos('./userUploads/');
                    fs.mkdirSync('./userUploads');
                }
                return res.json({warning: 'Make sure you made a description'})
            }
        }else{
            try{
                deletePhotos('./userUploads/');
                fs.mkdirSync('./userUploads');
            } catch(e){
                deletePhotos('./userUploads/');
                fs.mkdirSync('./userUploads');
            }
            return res.json({warning: 'Make sure you made a title'})
        }
    }else{
        try{
            deletePhotos('./userUploads/');
            fs.mkdirSync('./userUploads');
        } catch(e){
            deletePhotos('./userUploads/');
            fs.mkdirSync('./userUploads');
        }
        return res.json({warning: 'Your file cannot be more than 5MB'})
    }


});

app.post('/thumbup', (req, res) => {
    Photo.findById(req.body.data, (err, doc) => {
        doc.likes = doc.likes + 1;
        doc.save(function (err) {
            if(err) {
                console.error('ERROR!');
            }
        });
    });
    return res.sendStatus(200)
});

app.post('/thumbdown', (req, res) => {
    Photo.findById(req.body.data, (err, doc) => {
        doc.dislikes = doc.dislikes + 1;
        doc.save(function (err) {
            if(err) {
                console.error('ERROR!');
            }
        });
    });
    return res.sendStatus(200)
});

app.get('*', function(req, res){
  res.status(404).send(req.url + ' is not on our website :(')
});

app.listen(process.env.PORT || 3001)
