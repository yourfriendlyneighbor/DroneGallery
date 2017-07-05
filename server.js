const
express = require('express'),
app = express(),
mongoose = require('mongoose'),
multer = require('multer'),
upload = multer({dest: 'uploads/'}),
bodyParser = require('body-parser'),
fs = require('fs'),
compression = require('compression');

app.set('view engine', 'ejs');

app.use(compression());

mongoose.connect('mongodb://localhost:27017/Gallery');

const Photo = mongoose.model('Photo', {
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
    }
})

app.use('/static', express.static('./static'));
app.use('/userUploads', express.static('./userUploads'));
app.use('/jquery', express.static('./node_modules/jquery/dist/jquery.min.js'));
app.use('/angular', express.static('./node_modules/angular/angular.min.js'));
app.use('/materializeCSS', express.static('./node_modules/materialize-css/dist/css/materialize.min.css'));
app.use('/materializeJS', express.static('./node_modules/materialize-css/dist/js/materialize.min.js'));
app.use('/fonts/roboto/Roboto-Regular.woff', express.static('./node_modules/materialize-css/dist/fonts/roboto/Roboto-Regular.woff'));
app.use('/fonts/roboto/Roboto-Regular.woff2', express.static('./node_modules/materialize-css/dist/fonts/roboto/Roboto-Regular.woff2'));


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
    Photo.find({}, (err, data) => {
        res.render('pages/index', {
            photos: data.reverse()
        })
    })
});
app.get('/upload', (req, res) => {
    res.render('pages/upload')
});


var path = require('path');
// require the image editing file
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
            var filename = (new Date).valueOf()+"."+file.originalname
            fs.rename(file.path, './userUploads/' + filename, (err) => {
                if(err)throw err;

                compressAndResize('./userUploads/' + filename);

                var photo = new Photo({
                    title: req.body.title,
                    description: req.body.description,
                    image: filename
                });

                photo.save((err, result) => {
                    if(err){throw err}else{
                        res.json({success: 'Success! Check out your new image'})
                    }
                })

            })
        })
    }

});

app.get('*', function(req, res){
  res.status(404).send(req.url + ' is not on our website :(')
});

app.listen(process.env.PORT || 3001)
