const
express = require('express'),
app = express(),
mongoose = require('mongoose'),
multer = require('multer'),
upload = multer({dest: 'uploads/'}),
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

mongoose.connect('mongodb://dabkab:abcdabcd@ds149412.mlab.com:49412/dronepics');

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

        res.render("pages/index", { photos: docs });
    });



});
app.get('/upload', (req, res) => {
    res.render('pages/upload')
});


var editor = path.resolve(__dirname, 'editor.js');
function compressAndResize (imageUrl) {
  // We need to spawn a child process so that we do not block
  // the EventLoop with cpu intensive image manipulation
  var childProcess = require('child_process').fork(editor);
  childProcess.on('message', function(message) {
    console.log(message);
  });
  childProcess.on('error', function(error) {
    console.error(error.stack)
  });
  childProcess.on('exit', function() {
    console.log('process exited');
  });
  childProcess.send(imageUrl);
}


app.post('/postPhoto', upload.any(), (req, res) => {

    if(req.body.title == " " || req.body.description == "" || req.body.description.length < 2 || req.body.title.length < 2 || !req.files){
        res.json({error: 'Make sure you filled all inputs correctly'})
    }

    if(req.files){
        req.files.forEach((file) => {
            var filename = (new Date).valueOf() + "." + file.originalname;
            fs.rename(file.path, './userUploads/' + filename, (err) => {
                if(err)throw err;

                cloudinary.uploader.upload('./userUploads/' + filename, function(result) {
                  console.log(result)
                  var photo = new Photo({
                      title: req.body.title,
                      description: req.body.description,
                      image: result.url
                  });

                  photo.save((err, result) => {
                      if(err){throw err}else{
                          fs.unlink('./userUploads/'+filename, (err) => {
                              if (err) throw err;
                              res.json({success: 'Success! Check out your new image'})
                            });
                      }
                  })
              }, {
                  width: 1080,
                  height: 720
              });
            })
        })
    }

});

app.get('*', function(req, res){
  res.status(404).send(req.url + ' is not on our website :(')
});

app.listen(process.env.PORT || 3001)
