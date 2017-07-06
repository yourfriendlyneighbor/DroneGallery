const mongoosePaginate = require('mongoose-paginate'), mongoose = require('mongoose'), config = require('../config');


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
    collection: config.mongoose.coll
});

pschema.plugin(mongoosePaginate);

module.exports = mongoose.model('Photo', pschema);
